import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { resolveEnv } from "../env.js";
import { runWatchTopic } from "../watch-runner.js";
import {
  createWatchTopic,
  deleteWatchTopic,
  getWatchTopic,
  listWatchTopics,
  updateWatchTopic
} from "../repositories.js";

const createSchema = z.object({
  displayName: z.string().min(1).max(200),
  terms: z.string().max(1000).optional(),
  keyword: z.string().min(1).max(500),
  frequency: z.enum(["daily", "weekly", "monthly"]).default("weekly")
});

const updateSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  terms: z.string().max(1000).nullable().optional(),
  keyword: z.string().min(1).max(500).optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  enabled: z.boolean().optional()
});

export function watchRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/watch", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    return c.json({ topics: await listWatchTopics(db, c.get("userId")!) });
  });

  app.post("/watch", async (c) => {
    const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "ウォッチテーマの入力が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const topic = await createWatchTopic(db, { userId: c.get("userId")!, ...parsed.data });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "watch.create",
      resourceType: "watch_topic",
      resourceId: topic.id,
      detail: { displayName: topic.displayName }
    });
    return c.json({ topic }, 201);
  });

  app.patch("/watch/:topicId", async (c) => {
    const parsed = updateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "更新内容が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const existing = await getWatchTopic(db, c.req.param("topicId"), c.get("userId")!);
    if (!existing) throw notFound("ウォッチテーマが見つかりません");
    const topic = await updateWatchTopic(db, existing.id, parsed.data);
    return c.json({ topic });
  });

  app.delete("/watch/:topicId", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const existing = await getWatchTopic(db, c.req.param("topicId"), c.get("userId")!);
    if (!existing) throw notFound("ウォッチテーマが見つかりません");
    await deleteWatchTopic(db, existing.id);
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "watch.delete",
      resourceType: "watch_topic",
      resourceId: existing.id
    });
    return c.body(null, 204);
  });

  app.post("/watch/run", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const topics = (await listWatchTopics(db, c.get("userId")!)).filter((t) => t.enabled).slice(0, 10);
    if (topics.length === 0) {
      return c.json({ results: [], message: "有効なウォッチテーマがありません" });
    }
    const results = [];
    for (const topic of topics) {
      results.push(await runWatchTopic(db, topic, env));
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "watch.run_manual",
      resourceType: "watch_topic",
      detail: { topicCount: topics.length, results: results.map((r) => ({ topicId: r.topicId, notified: r.notified })) }
    });
    return c.json({ results });
  });

  return app;
}
