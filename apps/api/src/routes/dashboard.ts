import { Hono } from "hono";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { requireAuth } from "../auth.js";
import { getDashboardStats } from "../repositories.js";

export function dashboardRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/stats", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const stats = await getDashboardStats(db, c.get("userId")!);
    return c.json({ stats });
  });

  return app;
}
