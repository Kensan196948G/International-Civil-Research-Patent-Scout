// ============================================================================
// ICRPS — scripts/lib/db.mjs
// 運用スクリプト共通のDB接続ヘルパー。DATABASE_URLのホストがneon.techなら
// @neondatabase/serverless、それ以外(ローカルPostgres等)はpostgres.js(TCP接続)
// を使う。apps/api/src/db.ts の createDb() と同じホスト判定方式。
// 呼び出し側からは neon() の sql.query(text, params) 互換のインターフェースで使う。
// ============================================================================
import { neon } from "@neondatabase/serverless";
import postgres from "postgres";

/**
 * @param {string} dbUrl
 * @returns {{ query(text: string, params?: unknown[]): Promise<Array<Record<string, unknown>>>, isNeon: boolean, end?: () => Promise<void> }}
 */
export function createSql(dbUrl) {
  const isNeon = /neon\.tech(:\d+)?$/.test(new URL(dbUrl).host);
  if (isNeon) {
    const sql = neon(dbUrl, { arrayMode: false });
    return { query: (text, params) => sql.query(text, params ?? []), isNeon: true };
  }
  const pg = postgres(dbUrl, { max: 1 });
  return {
    query: (text, params) => pg.unsafe(text, params ?? []),
    isNeon: false,
    end: () => pg.end(),
  };
}
