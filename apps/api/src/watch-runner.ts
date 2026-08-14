// 更新監視（ウォッチ）の実動化
// - 有効なウォッチテーマを対象に、横断検索コネクタで新着文献を検索する
// - 未通知のマッチを notifications に登録し、テーマの last_checked_at / last_new_count を更新する
// - 初回実行（last_checked_at が null）はベースラインとして既存マッチを「既読通知」で記録し、
//   初回以降の新規マッチだけを未読通知にする
import type { SearchConnectorResult, SearchParams } from "@icrps/contracts";
import { createDb, type Db } from "./db.js";
import type { WorkerEnv } from "./env.js";
import { runConnectors, type ConnectorFailure } from "./connectors.js";
import { dedupeAndScore } from "./scoring.js";
import { emailEnabled, sendEmail } from "./email.js";
import {
  createNotification,
  findDocumentByKey,
  findUserById,
  insertDocument,
  listEnabledWatchTopics,
  normalizeContentHash,
  notificationExistsForDocument,
  updateWatchTopicCheck,
  type WatchTopicRow
} from "./repositories.js";

export const FREQUENCY_MS: Record<string, number> = {
  daily: 24 * 60 * 60 * 1000,
  weekly: 7 * 24 * 60 * 60 * 1000,
  monthly: 30 * 24 * 60 * 60 * 1000
};

export interface WatchSearchResult {
  results: SearchConnectorResult[];
  failures: ConnectorFailure[];
}

export type WatchSearch = (params: SearchParams, env: WorkerEnv) => Promise<WatchSearchResult>;

export function isWatchTopicDue(topic: Pick<WatchTopicRow, "lastCheckedAt" | "frequency">, now = Date.now()): boolean {
  if (!topic.lastCheckedAt) return true;
  const interval = FREQUENCY_MS[topic.frequency] ?? 7 * 24 * 60 * 60 * 1000;
  return now - new Date(topic.lastCheckedAt).getTime() >= interval;
}

/** テーマのキーワード・用語から実行クエリを組み立てる（最大 3 件） */
export function buildWatchQueries(topic: Pick<WatchTopicRow, "keyword" | "terms">): string[] {
  const terms = (topic.terms ?? "")
    .split(/[/,、\s]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && t !== topic.keyword);
  return [topic.keyword, ...terms].filter((v, i, arr) => arr.indexOf(v) === i).slice(0, 3);
}

export interface WatchTopicRunResult {
  topicId: string;
  keyword: string;
  fetched: number;
  inserted: number;
  notified: number;
  error?: string;
}

export async function runWatchTopic(
  db: Db,
  topic: WatchTopicRow,
  env: WorkerEnv,
  search: WatchSearch = async (params, e) => runConnectors(params, e)
): Promise<WatchTopicRunResult> {
  const queries = buildWatchQueries(topic);
  const baseline = !topic.lastCheckedAt;
  let fetched = 0;
  let inserted = 0;
  let notified = 0;
  const newMatches: Array<{ title: string; url: string | null }> = [];

  for (const query of queries) {
    let response: WatchSearchResult;
    try {
      response = await search(
        {
          query,
          languageMode: "bilingual",
          sourceTypes: ["web", "paper", "patent"],
          maxResults: 8
        },
        env
      );
    } catch (err) {
      return {
        topicId: topic.id,
        keyword: topic.keyword,
        fetched,
        inserted,
        notified,
        error: err instanceof Error ? err.message : String(err)
      };
    }
    fetched += response.results.length;
    const scored = dedupeAndScore(query, response.results).slice(0, 10);
    for (const item of scored) {
      const key = {
        doi: item.result.doi,
        patentNumber: item.result.patentNumber,
        url: item.result.url,
        contentHash: item.result.doi ?? item.result.patentNumber ?? item.result.url
      };
      let document = await findDocumentByKey(db, key);
      if (!document) {
        document = await insertDocument(db, item.result, await normalizeContentHash(key.contentHash));
        inserted += 1;
      }
      const alreadyNotified = await notificationExistsForDocument(db, topic.id, document.id);
      if (alreadyNotified) continue;
      await createNotification(db, {
        userId: topic.userId,
        watchTopicId: topic.id,
        sourceDocumentId: document.id,
        kind: baseline ? "baseline" : "watch",
        title: `${topic.displayName} の新着候補: ${document.title}`,
        body: document.abstract ? document.abstract.slice(0, 300) : "要旨は取得されていません。原典リンクからご確認ください。",
        url: document.url ?? undefined,
        readAt: baseline ? new Date().toISOString() : null
      });
      if (!baseline) {
        notified += 1;
        newMatches.push({ title: document.title, url: document.url });
      }
    }
  }

  if (notified > 0 && emailEnabled(env)) {
    const user = await findUserById(db, topic.userId);
    if (user) {
      await sendEmail(
        {
          to: user.email,
          subject: `[ICRPS] ウォッチ「${topic.displayName}」の新着候補 ${notified} 件`,
          text: [
            `ウォッチテーマ「${topic.displayName}」で新着候補を ${notified} 件検知しました。`,
            "",
            ...newMatches.map((m) => `・${m.title}${m.url ? `\n  ${m.url}` : ""}`),
            "",
            "詳細は ICRPS の「更新監視」画面で確認してください。"
          ].join("\n")
        },
        env
      );
    }
  }

  await updateWatchTopicCheck(db, topic.id, {
    lastCheckedAt: new Date().toISOString(),
    lastNewCount: notified
  });
  return { topicId: topic.id, keyword: topic.keyword, fetched, inserted, notified };
}

export interface WatchRoundResult {
  topicId: string;
  keyword: string;
  fetched: number;
  inserted: number;
  notified: number;
  error?: string;
}

/**
 * 有効かつ実行頻度の期限が来ているウォッチテーマを順次実行する。
 * 外部 API の負荷を抑えるため、テーマ間は 700ms 待機する。
 */
export async function runWatchRounds(
  env: WorkerEnv,
  options: { db?: Db; now?: number; search?: WatchSearch } = {}
): Promise<WatchRoundResult[]> {
  const db = options.db ?? createDb(env);
  const now = options.now ?? Date.now();
  const topics = await listEnabledWatchTopics(db);
  const due = topics.filter((t) => isWatchTopicDue(t, now));
  const results: WatchRoundResult[] = [];
  for (const topic of due) {
    results.push(await runWatchTopic(db, topic, env, options.search));
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
  return results;
}
