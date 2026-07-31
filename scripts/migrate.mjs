#!/usr/bin/env node
// Neon PostgreSQL マイグレーション実行スクリプト
// 使用法: DATABASE_URL=... node scripts/migrate.mjs [db/migrations/*.sql]
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
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
const targets = process.argv.slice(2);
const files = targets.length > 0
  ? targets.map((f) => resolve(f))
  : (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort().map((f) => join(dir, f));

const sql = neon(dbUrl, { arrayMode: false });
for (const file of files) {
  const content = await readFile(file, "utf8");
  const name = file.split("/").pop();
  console.log(`applying ${name} ...`);
  const statements = splitStatements(content);
  for (const statement of statements) {
    await sql.query(statement);
  }
  console.log(`applied ${name}`);
}
console.log("migrations done");
