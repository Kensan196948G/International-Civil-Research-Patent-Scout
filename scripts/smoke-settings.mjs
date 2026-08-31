#!/usr/bin/env node
// AI システム設定の E2E スモーク（preview 用。本番 DB では実行しない）
// 使用法: BASE_URL=http://127.0.0.1:8788 DATABASE_URL='postgresql://...' node scripts/smoke-settings.mjs
import { createSql } from "./lib/db.mjs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8788";
const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("DATABASE_URL required (preview DB のみ)");
  process.exit(1);
}

let token = "";
const email = `admin-smoke-${Date.now().toString(36)}@example.local`;
const password = "settings-smoke-2026";

async function call(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* text */ }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 200)}`);
  return json ?? text;
}

function ok(name) { console.log(`  ✓ ${name}`); }

async function main() {
  console.log(`AI settings smoke against ${BASE}`);
  const reg = await call("/api/auth/register", { method: "POST", body: { name: "Admin Smoke", email, password }, auth: false });
  token = reg.accessToken;

  // preview DB で admin に昇格（本番では実行しない）
  const sql = createSql(DB_URL);
  await sql.query("UPDATE users SET role = 'admin' WHERE lower(email) = lower($1)", [email]);
  if (sql.end) await sql.end();
  // トークンのロールは発行時点のもののため、再ログインして admin トークンを取得する
  const login = await call("/api/auth/login", { method: "POST", body: { email, password }, auth: false });
  token = login.accessToken;

  const initial = await call("/api/admin/settings");
  if (initial.ai.deepseek.configured || initial.ai.anthropic.configured) throw new Error("初期状態が未設定ではありません");
  ok("初期状態: 未設定");

  const saved = await call("/api/admin/settings/ai", {
    method: "PUT",
    body: { deepseek: { apiKey: "sk-fake-deepseek-for-smoke", model: "deepseek-chat" } }
  });
  if (!saved.ai.deepseek.configured || saved.ai.activeProvider !== "deepseek") throw new Error("DeepSeek 保存失敗");
  ok("DeepSeek 保存（暗号化・設定済み）");

  const testFail = await call("/api/admin/settings/ai/test", {
    method: "POST",
    body: { provider: "deepseek", apiKey: "sk-fake-deepseek-for-smoke" }
  });
  if (testFail.ok) throw new Error("フェイクキーで成功してはいけない");
  if (!testFail.message) throw new Error("テストメッセージがありません");
  ok(`DeepSeek テスト（失敗メッセージ出力）: ${testFail.message.slice(0, 60)}…`);

  const testSaved = await call("/api/admin/settings/ai/test", {
    method: "POST",
    body: { provider: "deepseek" }
  });
  if (testSaved.ok) throw new Error("保存済みフェイクキーで成功してはいけない");
  ok("保存済みキーでのテスト（キー非送信）");

  const savedAn = await call("/api/admin/settings/ai", {
    method: "PUT",
    body: { anthropic: { apiKey: "sk-ant-fake-for-smoke", model: "claude-sonnet-4-5" } }
  });
  if (!savedAn.ai.anthropic.configured) throw new Error("Anthropic 保存失敗");
  ok("Anthropic 保存");

  const cleared = await call("/api/admin/settings/ai/deepseek", { method: "DELETE" });
  if (cleared.ai.deepseek.configured || cleared.ai.activeProvider !== "anthropic") throw new Error("DeepSeek クリア失敗");
  ok("DeepSeek 設定クリア → アクティブが Anthropic に切替");

  const clearedAn = await call("/api/admin/settings/ai/anthropic", { method: "DELETE" });
  const active = clearedAn.ai.activeProvider;
  if (clearedAn.ai.anthropic.configured || (active !== null && active !== "openai")) throw new Error("Anthropic クリア失敗");
  ok(`Anthropic 設定クリア → アクティブ: ${active ?? "なし"}`);

  console.log("\nAI settings smoke: ALL PASSED");
}

main().catch((err) => {
  console.error("\nAI settings smoke FAILED:", err.message);
  process.exit(1);
});
