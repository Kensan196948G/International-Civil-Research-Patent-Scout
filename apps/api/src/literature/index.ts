// 土木建設技術文献の定期収集（J-STAGE / 土木研究所 / ITC / MLIT / KTR）
// 方針: メタデータのみ保存（本文・PDF は保存しない）。重複排除は DOI/URL/content_hash。
import type { SearchConnectorResult } from "@icrps/contracts";
import { createAuditLog } from "../audit.js";
import { createDb, type Db } from "../db.js";
import { emailEnabled, sendEmail } from "../email.js";
import type { WorkerEnv } from "../env.js";
import { insertDocumentsBatch } from "../repositories.js";
import { collectItc } from "./itc.js";
import { collectJStage } from "./jstage.js";
import { collectKtr } from "./ktr.js";
import { collectMlit } from "./mlit.js";
import { collectPwri } from "./pwri.js";

export type LiteratureSourceName = "J-STAGE" | "土木研究所" | "ITC Digital Library" | "国土交通省 技術調査" | "関東地整 技術情報";

export interface IngestSourceSummary {
  source: LiteratureSourceName;
  fetched: number;
  inserted: number;
  skipped: number;
  status: "ok" | "error";
  error?: string;
  startedAt: string;
  finishedAt: string;
  elapsedMs: number;
}

export interface LiteratureIngestOptions {
  sources?: LiteratureSourceName[];
}

const ALL_SOURCES: LiteratureSourceName[] = [
  "J-STAGE",
  "土木研究所",
  "ITC Digital Library",
  "国土交通省 技術調査",
  "関東地整 技術情報"
];

async function runOneSource(
  db: Db,
  source: LiteratureSourceName,
  collect: () => Promise<SearchConnectorResult[]>,
  env: WorkerEnv
): Promise<IngestSourceSummary> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  try {
    const results = await collect();
    const valid = results.filter((r) => r.title && (r.doi || r.url));
    const inserted = await insertDocumentsBatch(db, valid);
    const skipped = valid.length - inserted;
    await createAuditLog(db, {
      userId: null,
      action: "ingest.run",
      resourceType: "literature_source",
      detail: { source, fetched: results.length, inserted, skipped, status: "ok" }
    });
    return {
      source,
      fetched: results.length,
      inserted,
      skipped,
      status: "ok",
      startedAt,
      finishedAt: new Date().toISOString(),
      elapsedMs: Date.now() - t0
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await createAuditLog(db, {
      userId: null,
      action: "ingest.run",
      resourceType: "literature_source",
      detail: { source, status: "error", error }
    });
    if (emailEnabled(env) && env.ADMIN_EMAIL) {
      await sendEmail(
        {
          to: env.ADMIN_EMAIL,
          subject: `[ICRPS] 文献収集失敗: ${source}`,
          text: `文献収集（${source}）が失敗しました。\n\nエラー: ${error}\n\n監査ログ（ingest.run）で詳細を確認してください。`
        },
        env
      );
    }
    return {
      source,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      status: "error",
      error,
      startedAt,
      finishedAt: new Date().toISOString(),
      elapsedMs: Date.now() - t0
    };
  }
}

export async function runLiteratureIngest(
  env: WorkerEnv,
  options: LiteratureIngestOptions = {}
): Promise<IngestSourceSummary[]> {
  const db = createDb(env);
  const desired = options.sources ?? ALL_SOURCES;
  const summaries: IngestSourceSummary[] = [];

  const fetchKnownUrls = async (urls: string[]): Promise<Set<string>> => {
    if (urls.length === 0) return new Set<string>();
    const rows = await db("SELECT url FROM source_documents WHERE url = ANY($1)", [urls]);
    return new Set(rows.map((row) => String(row.url)));
  };

  if (desired.includes("J-STAGE")) {
    summaries.push(await runOneSource(db, "J-STAGE", () => collectJStage(), env));
  }
  if (desired.includes("土木研究所")) {
    summaries.push(await runOneSource(db, "土木研究所", () => collectPwri(), env));
  }
  if (desired.includes("ITC Digital Library")) {
    summaries.push(
      await runOneSource(db, "ITC Digital Library", () => collectItc({ fetchKnown: fetchKnownUrls }), env)
    );
  }
  if (desired.includes("国土交通省 技術調査")) {
    summaries.push(await runOneSource(db, "国土交通省 技術調査", () => collectMlit(), env));
  }
  if (desired.includes("関東地整 技術情報")) {
    summaries.push(await runOneSource(db, "関東地整 技術情報", () => collectKtr(), env));
  }
  return summaries;
}
