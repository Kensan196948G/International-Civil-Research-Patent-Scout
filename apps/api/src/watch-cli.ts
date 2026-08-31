// ウォッチ監視の定期実行 CLI（systemd timer 用）
// 使い方: node dist/src/watch-cli.js
import { resolveEnv } from "./env.js";
import { runWatchRounds } from "./watch-runner.js";

try {
  process.loadEnvFile?.();
} catch {
  // .env が無い場合は環境変数のみで動作
}

const env = resolveEnv(undefined);
const started = Date.now();
const results = await runWatchRounds(env);
const notified = results.reduce((acc, r) => acc + r.notified, 0);
const inserted = results.reduce((acc, r) => acc + r.inserted, 0);
const failed = results.filter((r) => r.error).length;
console.log(
  `[icrps-watch] topics=${results.length} notified=${notified} inserted=${inserted} failed=${failed} elapsedMs=${Date.now() - started}`
);
if (failed > 0) {
  for (const r of results.filter((x) => x.error)) {
    console.error(`[icrps-watch] topic=${r.topicId} error=${r.error}`);
  }
}
// ローカルPostgres接続時 (postgres.js) はTCPコネクションプールを保持し続け
// イベントループが自然にdrainしないため、exitCodeの設定だけでは終了しない。
process.exit(failed > 0 ? 1 : 0);
