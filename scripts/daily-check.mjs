#!/usr/bin/env node
// 日次点検: ヘルスチェック → 論理バックアップ → バックアップ検証 → 結果記録
// 失敗時は RESEND_API_KEY / ADMIN_EMAIL 設定があればメール通知
import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = process.env.APP_URL ?? "http://127.0.0.1:8787";
const logFile = "/var/log/icrps/daily-check.log";
const results = [];

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}`;
  appendFileSync(logFile, `${line}\n`);
  console.log(line);
}

try {
  const health = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(10000) });
  const body = await health.json();
  results.push(`health: ${health.ok && body.ok && body.db === "ok" ? "OK" : "NG (db=" + (body.db ?? "?") + ")"}`);
} catch (err) {
  results.push(`health: NG (${err instanceof Error ? err.message : err})`);
}

const root = resolve(import.meta.dirname, "..");
for (const script of ["backup.mjs", "verify-backup.mjs"]) {
  try {
    const out = execFileSync(process.execPath, [resolve(root, "scripts", script)], {
      env: process.env,
      encoding: "utf8",
      timeout: 120000
    }).trim();
    results.push(`${script}: OK (${out.split("\n").pop()})`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    results.push(`${script}: NG (${message})`);
  }
}

const failed = results.filter((r) => r.includes("NG"));
results.forEach((r) => log(r));

if (failed.length > 0 && process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL && process.env.EMAIL_FROM) {
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [process.env.ADMIN_EMAIL],
        subject: `[ICRPS] 日次点検で異常: ${failed.length} 件`,
        text: results.join("\n")
      }),
      signal: AbortSignal.timeout(15000)
    });
    log("alert email sent");
  } catch {
    log("alert email FAILED");
  }
}

if (failed.length > 0) {
  process.exitCode = 1;
} else {
  log("daily check: ALL OK");
}
