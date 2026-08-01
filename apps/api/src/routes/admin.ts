import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAdmin, requireAuth } from "../auth.js";
import { listAuditLogs, listIngestRuns, listUsers, updateUserRole } from "../repositories.js";
import { runLiteratureIngest } from "../literature/index.js";

const roleSchema = z.object({
  role: z.enum(["admin", "user", "viewer"])
});

export function adminRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth, requireAdmin);

  app.get("/users", async (c) => {
    const db = createDb(resolveEnv(c.env));
    return c.json({ users: await listUsers(db) });
  });

  app.patch("/users/:userId/role", async (c) => {
    const parsed = roleSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "ロール指定が不正です");
    const db = createDb(resolveEnv(c.env));
    if (c.req.param("userId") === c.get("userId")) throw new HttpError(400, "bad_request", "自身のロールは変更できません");
    const user = await updateUserRole(db, c.req.param("userId"), parsed.data.role);
    if (!user) throw notFound("ユーザーが見つかりません");
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "admin.user_role_update",
      resourceType: "user",
      resourceId: user.id,
      detail: { role: user.role }
    });
    return c.json({ user });
  });

  app.get("/audit-logs", async (c) => {
    const db = createDb(resolveEnv(c.env));
    return c.json({ auditLogs: await listAuditLogs(db, 200) });
  });

  app.get("/ingest/runs", async (c) => {
    const db = createDb(resolveEnv(c.env));
    return c.json({ runs: await listIngestRuns(db, 50) });
  });

  app.post("/ingest/run", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const results = await runLiteratureIngest(env);
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "admin.ingest_manual",
      resourceType: "system",
      detail: {
        results: results.map((r) => ({ source: r.source, status: r.status, inserted: r.inserted, skipped: r.skipped }))
      }
    });
    return c.json({ results });
  });

  return app;
}
