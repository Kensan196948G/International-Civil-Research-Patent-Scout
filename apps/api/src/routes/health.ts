import { Hono } from "hono";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";

export function healthRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.get("/", async (c) => {
    const env = resolveEnv(c.env);
    let db = "ok";
    try {
      const dbClient = createDb(env);
      await dbClient("SELECT 1");
    } catch {
      db = "degraded";
    }
    return c.json({
      ok: true,
      app: "icrps-api",
      version: "0.12.2",
      env: env.APP_ENV,
      db,
      time: new Date().toISOString()
    });
  });
  return app;
}
