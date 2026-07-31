// Node.js ローカル運用エントリポイント（systemd 用）
// 0.0.0.0:PORT（既定 8787）で API + Web 静的配信を同一プロセスで提供する
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { createApp } from "./app.js";
import { resolveEnv } from "./env.js";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

try {
  process.loadEnvFile?.();
} catch {
  // .env が無い場合は環境変数のみで動作
}

const env = resolveEnv(undefined);
const app = createApp();

const __dirname = dirname(fileURLToPath(import.meta.url));
// ビルド後: apps/api/dist/src/server.js → 静的ファイルは apps/web/dist
const webDist = resolve(__dirname, "../../../web/dist");

app.use("*", serveStatic({ root: webDist }));
app.use("*", serveStatic({ path: "index.html", root: webDist }));

const port = Number(process.env.PORT ?? 8787);
const host = "0.0.0.0";

serve({ fetch: app.fetch, port, hostname: host }, (info) => {
  console.log(`[icrps] listening on http://0.0.0.0:${info.port} (APP_ENV=${env.APP_ENV})`);
});
