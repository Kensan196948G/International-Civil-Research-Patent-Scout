// 通知センター API（ウォッチ新着・システム連絡）
import { Hono } from "hono";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { resolveEnv } from "../env.js";
import { notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount
} from "../repositories.js";

export function notificationRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/notifications", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const limit = Math.min(Math.max(Number(c.req.query("limit") ?? 50), 1), 100);
    const notifications = await listNotifications(db, c.get("userId")!, limit);
    return c.json({ notifications });
  });

  app.get("/notifications/unread-count", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const count = await unreadNotificationCount(db, c.get("userId")!);
    return c.json({ count });
  });

  app.post("/notifications/:notificationId/read", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const updated = await markNotificationRead(db, c.get("userId")!, c.req.param("notificationId"));
    if (!updated) throw notFound("通知が見つかりません（既読済みの可能性があります）");
    return c.json({ ok: true });
  });

  app.post("/notifications/read-all", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const count = await markAllNotificationsRead(db, c.get("userId")!);
    return c.json({ ok: true, count });
  });

  return app;
}
