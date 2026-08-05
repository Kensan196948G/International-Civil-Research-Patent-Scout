import { Hono } from "hono";
import { logger } from "hono/logger";
import { randomUUID } from "node:crypto";
import type { AppBindings } from "./types.js";
import { authRoutes } from "./routes/auth.js";
import { projectRoutes } from "./routes/projects.js";
import { searchRoutes } from "./routes/search.js";
import { documentRoutes } from "./routes/documents.js";
import { comparisonRoutes } from "./routes/comparisons.js";
import { reportRoutes } from "./routes/reports.js";
import { adminRoutes } from "./routes/admin.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { healthRoutes } from "./routes/health.js";
import { settingsRoutes } from "./routes/settings.js";
import { watchRoutes } from "./routes/watch.js";
import { chatRoutes } from "./routes/chat.js";
import { literatureRoutes } from "./routes/literature.js";
import { notificationRoutes } from "./routes/notifications.js";
import { teamRoutes } from "./routes/teams.js";
import { HttpError } from "./errors.js";
import type { ApiErrorBody } from "@icrps/contracts";

export function createApp(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", logger());
  app.use("*", async (c, next) => {
    const requestId = c.req.header("x-request-id") ?? randomUUID();
    c.set("requestId", requestId);
    c.header("X-Request-Id", requestId);
    await next();
  });
  app.use("*", async (c, next) => {
    await next();
    c.header("X-Content-Type-Options", "nosniff");
    c.header("X-Frame-Options", "DENY");
    c.header("Referrer-Policy", "same-origin");
    c.header(
      "Content-Security-Policy",
      "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'"
    );
  });

  app.route("/api/health", healthRoutes());
  app.route("/api/auth", authRoutes());
  app.route("/api/projects", projectRoutes());
  app.route("/api/search", searchRoutes());
  app.route("/api", documentRoutes());
  app.route("/api", comparisonRoutes());
  app.route("/api", reportRoutes());
  app.route("/api/admin", adminRoutes());
  app.route("/api/admin", settingsRoutes());
  app.route("/api", watchRoutes());
  app.route("/api", chatRoutes());
  app.route("/api", literatureRoutes());
  app.route("/api", notificationRoutes());
  app.route("/api", teamRoutes());
  app.route("/api/dashboard", dashboardRoutes());

  app.onError((err, c) => {
    if (err instanceof HttpError) {
      const body: ApiErrorBody = { error: { code: err.code, message: err.message, details: err.details } };
      return c.json(body, err.status as 400 | 401 | 403 | 404 | 409 | 500);
    }
    console.error(`request_id=${c.get("requestId") ?? "-"} unhandled error`, err);
    const body: ApiErrorBody = { error: { code: "internal_error", message: "サーバー内部エラーが発生しました" } };
    return c.json(body, 500);
  });

  app.notFound((c) => {
    const body: ApiErrorBody = { error: { code: "not_found", message: "エンドポイントが見つかりません" } };
    return c.json(body, 404);
  });

  return app;
}
