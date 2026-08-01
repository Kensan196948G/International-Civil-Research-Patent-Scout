// 収集文献（土木建設技術）一覧 API
// 自動収集された source_documents を情報源・キーワード・件数で取得する（メタデータのみ）
import { Hono } from "hono";
import { requireAuth } from "../auth.js";
import { createDb } from "../db.js";
import { resolveEnv } from "../env.js";
import type { AppBindings } from "../types.js";

const SOURCE_FILTERS: Record<string, string> = {
  jstage: "url LIKE '%jstage.jst.go.jp%'",
  pwri: "url LIKE '%thesis.pwri.go.jp%'",
  itc: "url LIKE '%itc.scix.net%'",
  mlit: "url LIKE '%mlit.go.jp/tec%' OR url LIKE '%mlit.go.jp/report/press/kanbo08%'",
  ktr: "url LIKE '%ktr.mlit.go.jp%'"
};

function sourceLabel(url: string | null, sourceName: string | null): string {
  if (!url) return sourceName ?? "その他";
  if (url.includes("jstage.jst.go.jp")) return "J-STAGE";
  if (url.includes("thesis.pwri.go.jp")) return "土木研究所";
  if (url.includes("itc.scix.net")) return "ITC Digital Library";
  if (url.includes("ktr.mlit.go.jp")) return "関東地整";
  if (url.includes("mlit.go.jp")) return "国土交通省";
  return sourceName ?? "その他";
}

export function literatureRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/literature", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const q = (c.req.query("q") ?? "").trim();
    const source = c.req.query("source") ?? "all";
    const sourceType = c.req.query("sourceType") ?? "all";
    const limit = Math.min(Math.max(Number(c.req.query("limit") ?? 50), 1), 100);
    const offset = Math.max(Number(c.req.query("offset") ?? 0), 0);

    const clauses: string[] = [];
    const params: unknown[] = [];
    if (source === "all") {
      clauses.push(`(${Object.values(SOURCE_FILTERS).join(" OR ")})`);
    } else if (SOURCE_FILTERS[source]) {
      clauses.push(`(${SOURCE_FILTERS[source]})`);
    } else {
      clauses.push("(1 = 0)");
    }
    if (sourceType !== "all") {
      params.push(sourceType);
      clauses.push(`source_type = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      clauses.push(
        `(title ILIKE $${params.length} OR original_title ILIKE $${params.length} OR abstract ILIKE $${params.length} OR source_name ILIKE $${params.length} OR authors::text ILIKE $${params.length})`
      );
    }
    const where = clauses.join(" AND ");
    params.push(limit);
    const limitIdx = params.length;
    params.push(offset);
    const offsetIdx = params.length;

    const totalRows = await db(`SELECT count(*) AS n FROM source_documents WHERE ${where}`, params.slice(0, params.length - 2));
    const total = Number(totalRows[0]?.n ?? 0);
    const rows = await db(
      `SELECT id, source_type, title, original_title, abstract, url, doi, authors, publication_date, source_name, created_at
       FROM source_documents
       WHERE ${where}
       ORDER BY publication_date DESC NULLS LAST, created_at DESC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      params
    );

    const items = rows.map((r) => {
      const authors = Array.isArray(r.authors)
        ? r.authors
        : typeof r.authors === "string"
          ? (JSON.parse(r.authors) as unknown[])
          : [];
      const url = r.url == null ? null : String(r.url);
      const sourceName = r.source_name == null ? null : String(r.source_name);
      return {
        id: String(r.id),
        sourceType: String(r.source_type),
        title: String(r.title),
        originalTitle: r.original_title == null ? null : String(r.original_title),
        abstract: r.abstract == null ? null : String(r.abstract),
        url,
        doi: r.doi == null ? null : String(r.doi),
        authors: authors.map((a) => String(a)),
        publicationDate: r.publication_date == null ? null : String(r.publication_date).slice(0, 10),
        sourceName,
        sourceLabel: sourceLabel(url, sourceName),
        createdAt: String(r.created_at)
      };
    });

    return c.json({ items, total, limit, offset });
  });

  return app;
}
