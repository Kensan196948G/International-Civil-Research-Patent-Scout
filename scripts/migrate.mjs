#!/usr/bin/env node
// Neon PostgreSQL マイグレーション実行スクリプト
//
// 使用法:
//   DATABASE_URL=... node scripts/migrate.mjs                       # 未適用のものだけ適用
//   DATABASE_URL=... node scripts/migrate.mjs db/migrations/0010_*.sql  # ファイル指定
//   DATABASE_URL=... node scripts/migrate.mjs --force               # 適用済みも再実行
//
// 適用済みは schema_migrations テーブルで管理し、再実行しても失敗しない（冪等）。
// 台帳が無い既存 DB でも安全に動くよう、全マイグレーション SQL は
// IF NOT EXISTS / OR REPLACE で記述する規約とする。
import { basename, dirname, join, resolve } from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

function splitStatements(sql) {
  const parts = [];
  let current = "";
  let inDollar = false;
  let dollarTag = null;
  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i];
    if (!inDollar && ch === "$") {
      const m = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i));
      if (m) {
        inDollar = true;
        dollarTag = m[0];
        current += m[0];
        i += m[0].length - 1;
        continue;
      }
    }
    if (inDollar && ch === "$" && dollarTag && sql.startsWith(dollarTag, i)) {
      current += dollarTag;
      i += dollarTag.length - 1;
      inDollar = false;
      dollarTag = null;
      continue;
    }
    if (!inDollar && ch === ";") {
      if (current.trim()) parts.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const dir = join(root, "db", "migrations");
const args = process.argv.slice(2);
const force = args.includes("--force");
const targets = args.filter((a) => a !== "--force");
const files = targets.length > 0
  ? targets.map((f) => resolve(f))
  : (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort().map((f) => join(dir, f));

const sql = neon(dbUrl, { arrayMode: false });

// 適用済み台帳。台帳自身の作成も冪等にする。
await sql.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
  filename   text        PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`);
const appliedRows = await sql.query("SELECT filename FROM schema_migrations");
const applied = new Set(appliedRows.map((r) => r.filename));

let appliedCount = 0;
let skippedCount = 0;
for (const file of files) {
  const name = basename(file);
  if (applied.has(name) && !force) {
    console.log(`skipped ${name} (適用済み)`);
    skippedCount++;
    continue;
  }
  const content = await readFile(file, "utf8");
  console.log(`applying ${name} ...`);
  const statements = splitStatements(content);
  for (const statement of statements) {
    await sql.query(statement);
  }
  await sql.query(
    "INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING",
    [name]
  );
  console.log(`applied ${name}`);
  appliedCount++;
}
console.log(`migrations done (applied ${appliedCount} / skipped ${skippedCount})`);
