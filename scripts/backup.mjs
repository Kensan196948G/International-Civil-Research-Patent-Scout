#!/usr/bin/env node
// 論理バックアップ（Neon の全テーブルを JSON.gz で保存、7日保持）
// 使用法: DATABASE_URL=... node scripts/backup.mjs [出力ディレクトリ]
import { neon } from "@neondatabase/serverless";
import { gzipSync } from "node:zlib";
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const TABLES = [
  "users", "research_projects", "search_queries", "source_documents", "search_results",
  "project_documents", "ai_summaries", "comparisons", "reports", "watch_topics",
  "audit_logs", "app_settings", "notifications", "project_members", "teams",
  "team_members", "auth_tokens", "llm_usage"
];

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const outDir = resolve(process.argv[2] ?? "/var/backups/icrps");
const sql = neon(dbUrl, { arrayMode: false });

const payload = {};
for (const table of TABLES) {
  let rows;
  try {
    rows = await sql.query(`SELECT * FROM ${table}`);
  } catch (err) {
    console.error(`failed table: ${table}`);
    throw err;
  }
  payload[table] = rows;
}

mkdirSync(outDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join(outDir, `icrps-${stamp}.json.gz`);
writeFileSync(file, gzipSync(Buffer.from(JSON.stringify(payload))));

// 7日より古いバックアップを削除
const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
for (const name of readdirSync(outDir)) {
  if (!name.startsWith("icrps-") || !name.endsWith(".json.gz")) continue;
  const stat = await import("node:fs").then((fs) => fs.statSync(join(outDir, name)));
  if (stat.mtimeMs < cutoff) rmSync(join(outDir, name));
}

console.log(`backup written: ${file} (${Object.keys(payload).length} tables)`);
