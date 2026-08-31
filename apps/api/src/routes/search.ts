import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { resolveEnv, type WorkerEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { requireProjectAccess } from "../access.js";
import { aiRateLimited } from "../ai-limits.js";
import { expandKeywords } from "../keywords.js";
import { runConnectors } from "../connectors.js";
import { dedupeAndScore } from "../scoring.js";
import { getActiveAiProvider } from "../settings.js";
import {
  completeSearchQuery,
  createSearchQuery,
  failSearchQuery,
  findDocumentsByContentHashes,
  getSearchQuery,
  insertDocumentsForSearch,
  insertSearchResultsBatch,
  listBookmarkedSearches,
  listRecentSearches,
  listSearchResults,
  normalizeContentHash,
  setSearchBookmark,
  setSearchQueryRunning
} from "../repositories.js";

const searchSchema = z.object({
  projectId: z.string().uuid().nullable().optional(),
  query: z.string().min(1).max(500),
  languageMode: z.enum(["ja", "en", "auto", "bilingual"]).optional(),
  sourceTypes: z.array(z.enum(["web", "paper", "patent"])).min(1).optional(),
  countries: z.array(z.string().max(10)).max(50).optional(),
  yearFrom: z.number().int().min(1900).max(2100).optional(),
  yearTo: z.number().int().min(1900).max(2100).optional(),
  includeSynonyms: z.boolean().optional(),
  includeTranslation: z.boolean().optional(),
  maxResults: z.number().int().min(1).max(100).optional()
});

export function searchRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/", async (c) => {
    const parsed = searchSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "検索条件が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const userId = c.get("userId")!;
    if (parsed.data.projectId) {
      await requireProjectAccess(db, userId, parsed.data.projectId, "viewer");
    }
    const provider = await getActiveAiProvider(db, env);
    if (provider) {
      const limited = aiRateLimited(c);
      if (!limited.allowed) {
        return c.json(
          { error: { code: "rate_limited", message: "AI 利用量の上限に達しました。1時間後に再試行してください" } },
          429,
          { "Retry-After": String(limited.retryAfterSeconds) }
        );
      }
    }
    const query = await createSearchQuery(db, {
      userId,
      projectId: parsed.data.projectId ?? null,
      queryText: parsed.data.query,
      sourceTypes: parsed.data.sourceTypes ?? ["web", "paper", "patent"],
      filters: {
        languageMode: parsed.data.languageMode ?? "auto",
        countries: parsed.data.countries ?? [],
        yearFrom: parsed.data.yearFrom,
        yearTo: parsed.data.yearTo,
        includeSynonyms: parsed.data.includeSynonyms ?? false,
        includeTranslation: parsed.data.includeTranslation ?? false,
        maxResults: parsed.data.maxResults ?? 20
      }
    });
    // 非同期実行: Cloudflare Queues（任意）→ Workers の waitUntil → Node のタイマー
    if (env.SEARCH_QUEUE) {
      await env.SEARCH_QUEUE.send({ searchQueryId: query.id });
    } else {
      try {
        // Cloudflare Workers ではレスポンス後に実行が継続される
        c.executionCtx.waitUntil(runSearchJob(query.id, env));
      } catch {
        // Node 実行時（ExecutionContext なし）はタイマーでジョブを実行
        setTimeout(() => {
          void runSearchJob(query.id, env).catch(() => undefined);
        }, 0);
      }
    }
    return c.json({ searchQueryId: query.id, status: "queued" }, 202);
  });

  app.get("/history", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const limit = Math.min(Math.max(Number(c.req.query("limit") ?? 20), 1), 100);
    const history = await listRecentSearches(db, c.get("userId")!, limit);
    return c.json({ history });
  });

  app.get("/bookmarks", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const limit = Math.min(Math.max(Number(c.req.query("limit") ?? 50), 1), 100);
    const bookmarks = await listBookmarkedSearches(db, c.get("userId")!, limit);
    return c.json({ bookmarks });
  });

  app.patch("/:searchQueryId/bookmark", async (c) => {
    const parsed = z.object({ bookmarked: z.boolean() }).safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "ブックマーク指定が不正です");
    const db = createDb(resolveEnv(c.env));
    const updated = await setSearchBookmark(db, c.req.param("searchQueryId"), c.get("userId")!, parsed.data.bookmarked);
    if (!updated) throw notFound("検索履歴が見つかりません");
    return c.json({ ok: true, bookmarked: parsed.data.bookmarked });
  });

  app.get("/:searchQueryId", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const searchQuery = await getSearchQuery(db, c.req.param("searchQueryId"));
    if (!searchQuery) throw notFound("検索クエリが見つかりません");
    if (searchQuery.userId !== c.get("userId")) throw new HttpError(403, "forbidden", "この検索結果へのアクセス権がありません");
    const results = searchQuery.status === "completed" ? await listSearchResults(db, searchQuery.id) : [];
    return c.json({
      searchQueryId: searchQuery.id,
      status: searchQuery.status,
      queryText: searchQuery.queryText,
      expandedQueries: searchQuery.expandedQueries,
      failureSources: searchQuery.failureSources,
      results
    });
  });

  return app;
}

// 検索ジョブ本体（POST /api/search から即時レスポンスを返すため非同期実行する）
export async function runSearchJob(searchQueryId: string, env: WorkerEnv): Promise<void> {
  const db = createDb(env);
  const query = await getSearchQuery(db, searchQueryId);
  if (!query) return;
  await setSearchQueryRunning(db, searchQueryId);
  const filters = query.filters ?? {};
  const filterLanguage = filters.languageMode;
  const languageMode: "ja" | "en" | "auto" | "bilingual" =
    filterLanguage === "ja" || filterLanguage === "en" || filterLanguage === "auto" || filterLanguage === "bilingual"
      ? filterLanguage
      : "auto";
  const params = {
    query: query.queryText,
    languageMode,
    sourceTypes: query.sourceTypes,
    countries: Array.isArray(filters.countries) ? filters.countries.map(String) : [],
    yearFrom: typeof filters.yearFrom === "number" ? filters.yearFrom : undefined,
    yearTo: typeof filters.yearTo === "number" ? filters.yearTo : undefined,
    includeSynonyms: filters.includeSynonyms === true,
    includeTranslation: filters.includeTranslation === true,
    maxResults: typeof filters.maxResults === "number" ? filters.maxResults : 20
  };
  try {
    const provider = await getActiveAiProvider(db, env);
    const expansion = await expandKeywords(params, env, provider, query.userId);
    // 展開キーワードを実際の検索クエリへ反映する（最大 3 クエリ・1 クエリあたり件数を分散）
    const queriesToRun = Array.from(
      new Set([
        query.queryText,
        ...(expansion.translatedQueries ?? []),
        ...(expansion.synonymsJa ?? []),
        ...(expansion.synonymsEn ?? [])
      ])
    )
      .map((q) => q.trim())
      .filter((q) => q.length > 0)
      .slice(0, 3);
    const perQueryMax = Math.max(5, Math.ceil((params.maxResults ?? 20) / queriesToRun.length));
    const settledQueries = await Promise.allSettled(
      queriesToRun.map(async (q) => {
        try {
          return await runConnectors({ ...params, query: q, maxResults: perQueryMax }, env);
        } catch (err) {
          return {
            results: [],
            failures: [{ name: `query:${q}`, error: err instanceof Error ? err.message : String(err) }]
          };
        }
      })
    );
    const results = settledQueries.flatMap((s) => (s.status === "fulfilled" ? s.value.results : []));
    const failures = settledQueries.flatMap((s) =>
      s.status === "fulfilled" ? s.value.failures : [{ name: "query", error: s.reason instanceof Error ? s.reason.message : String(s.reason) }]
    );
    const scored = dedupeAndScore(query.queryText, results);
    // Cloudflare Workers のサブリクエスト上限を守るため、既存確認・登録・結果登録を一括クエリにする
    const entries = await Promise.all(
      scored.map(async (item) => ({
        item,
        contentHash: await normalizeContentHash(item.result.doi ?? item.result.patentNumber ?? item.result.url)
      }))
    );
    const byHash = new Map<string, string>();
    for (const row of await findDocumentsByContentHashes(db, entries.map((e) => e.contentHash))) {
      byHash.set(row.contentHash, row.id);
    }
    const missing = entries.filter((e) => (e.contentHash ? !byHash.has(e.contentHash) : true));
    const inserted = await insertDocumentsForSearch(
      db,
      missing.map((e) => ({ result: e.item.result, contentHash: e.contentHash }))
    );
    for (const row of inserted) {
      if (row.contentHash) byHash.set(row.contentHash, row.id);
    }
    const insertedNulls = inserted.filter((r) => !r.contentHash);
    let nullIdx = 0;
    const searchRows: Array<{ sourceDocumentId: string; rank: number; relevanceScore: number; matchedKeywords: string[] }> = [];
    let rank = 0;
    for (const e of entries) {
      rank += 1;
      const id = e.contentHash ? byHash.get(e.contentHash) ?? null : insertedNulls[nullIdx++]?.id ?? null;
      if (id) {
        searchRows.push({ sourceDocumentId: id, rank, relevanceScore: e.item.score, matchedKeywords: e.item.matchedKeywords });
      }
    }
    await insertSearchResultsBatch(db, query.id, searchRows);
    await completeSearchQuery(db, query.id, expansion, failures.map((f) => `${f.name}: ${f.error}`));
    await createAuditLog(db, {
      userId: query.userId,
      action: "search.execute",
      resourceType: "search_query",
      resourceId: query.id,
      detail: {
        query: query.queryText,
        sourceTypes: query.sourceTypes,
        resultCount: scored.length,
        failures: failures.map((f) => f.name)
      }
    });
  } catch (err) {
    // 検索失敗時もステータスを failed にして UI が「実行中」のままにならないようにする
    await failSearchQuery(db, searchQueryId, [err instanceof Error ? err.message : String(err)]).catch(() => undefined);
  }
}
