// 土木建設技術文献の定期収集 CLI（cron / systemd timer から実行）
// 使用法: node apps/api/dist/src/ingest-cli.js
import { resolveEnv } from "./env.js";
import { runLiteratureIngest } from "./literature/index.js";

try {
  process.loadEnvFile?.();
} catch {
  // .env が無い場合は環境変数のみで動作
}

const env = resolveEnv(undefined);
const results = await runLiteratureIngest(env);
console.log(JSON.stringify(results, null, 2));
// ローカルPostgres接続時 (postgres.js) はTCPコネクションプールを保持し続け
// イベントループが自然にdrainしないため、exitCodeの設定だけでは終了しない。
// (neon()のHTTP駆動driverでは問題にならなかったため潜在化していたバグ)
process.exit(results.some((r) => r.status === "error") ? 1 : 0);
