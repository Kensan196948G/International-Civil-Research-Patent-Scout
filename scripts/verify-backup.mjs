#!/usr/bin/env node
// 最新バックアップの検証（JSON 展開・テーブル件数と DB の突合）
// 使用法: DATABASE_URL=... node scripts/verify-backup.mjs [バックアップディレクトリ]
import { neon } from "@neondatabase/serverless";
import { gunzipSync } from "node:zlib";
import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const dir = resolve(process.argv[2] ?? "/var/backups/icrps");
const files = readdirSync(dir)
  .filter((n) => n.startsWith("icrps-") && n.endsWith(".json.gz"))
  .sort()
  .reverse();
if (files.length === 0) {
  console.error("no backup files found");
  process.exit(1);
}
const latest = join(dir, files[0]);
const payload = JSON.parse(gunzipSync(readFileSync(latest)).toString("utf8"));
const sql = neon(dbUrl, { arrayMode: false });
let mismatches = 0;
for (const [table, rows] of Object.entries(payload)) {
  const res = await sql.query(`SELECT count(*)::int AS c FROM ${table}`);
  const dbCount = Number(res[0]?.c ?? 0);
  const backupCount = Array.isArray(rows) ? rows.length : 0;
  if (dbCount !== backupCount) {
    console.error(`mismatch ${table}: db=${dbCount} backup=${backupCount}`);
    mismatches += 1;
  }
}
if (mismatches > 0) {
  console.error(`backup verification FAILED (${mismatches} tables)`);
  process.exit(1);
}
console.log(`backup OK: ${files[0]} (${Object.keys(payload).length} tables verified)`);
