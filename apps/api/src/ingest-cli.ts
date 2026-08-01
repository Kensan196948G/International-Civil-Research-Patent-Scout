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
process.exitCode = results.some((r) => r.status === "error") ? 1 : 0;
