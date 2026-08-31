#!/usr/bin/env node
// マイグレーション 0004〜0009 の rollback DDL をトランザクション内で検証（自動 ROLLBACK で破棄）
import { createSql } from "./lib/db.mjs";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const sql = createSql(dbUrl);
const statements = [
  "DROP TABLE IF EXISTS llm_usage",
  "DROP TABLE IF EXISTS auth_tokens",
  "ALTER TABLE research_projects DROP COLUMN IF EXISTS team_id",
  "DROP TABLE IF EXISTS team_members",
  "DROP TABLE IF EXISTS teams",
  "DROP TABLE IF EXISTS notifications",
  "ALTER TABLE source_documents DROP COLUMN IF EXISTS patent_status",
  "ALTER TABLE source_documents DROP COLUMN IF EXISTS classifications",
  "ALTER TABLE search_queries DROP COLUMN IF EXISTS is_bookmarked",
  "ALTER TABLE watch_topics DROP COLUMN IF EXISTS last_new_count",
  "DROP INDEX IF EXISTS idx_source_documents_title_trgm",
  "DROP INDEX IF EXISTS idx_source_documents_abstract_trgm",
  "DROP EXTENSION IF EXISTS pg_trgm"
];

// 最後に必ず失敗するクエリを加えることで、トランザクション全体を ROLLBACK させる
try {
  await sql.transaction((tx) => [
    ...statements.map((statement) => tx.query(statement)),
    tx.query("SELECT * FROM icrps_rollback_force_fail_does_not_exist")
  ]);
  console.error("rollback verification failed: transaction unexpectedly committed");
  process.exit(1);
} catch {
  // 期待どおり失敗 → ROLLBACK された
}

// 副作用ゼロを確認（notifications が存在しなければ DDL がコミットされた）
const check = await sql.query(
  "SELECT count(*)::int AS c FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications'"
);
if (Number(check[0]?.c ?? 0) !== 1) {
  console.error("rollback verification failed: side effects detected (notifications missing)");
  process.exit(1);
}
console.log(`rollback DDL verified OK (${statements.length} statements, rolled back, no side effects)`);
if (sql.end) await sql.end();
