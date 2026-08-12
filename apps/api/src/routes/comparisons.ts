import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { requireProjectAccess } from "../access.js";
import { aiRateLimited } from "../ai-limits.js";
import { generateComparison } from "../ai.js";
import { getActiveAiProvider } from "../settings.js";
import {
  createComparison,
  getComparison,
  getDocumentsByIds,
  updateComparison
} from "../repositories.js";

const createSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  documentIds: z.array(z.string().uuid()).min(2).max(20),
  axes: z.array(z.string().min(1).max(100)).min(1).max(20).default([
    "技術概要",
    "適用条件",
    "主なメリット",
    "主なデメリット",
    "施工性",
    "コスト傾向",
    "環境負荷",
    "実績",
    "関連特許",
    "技術成熟度",
    "注意事項"
  ])
});

const updateSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  axes: z.array(z.string().min(1).max(100)).min(1).max(20).optional(),
  rows: z.array(z.any()).min(1).max(50).optional(),
  notes: z.array(z.string()).max(50).optional()
});

export function comparisonRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/projects/:projectId/comparisons", async (c) => {
    const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "比較条件が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "editor");
    const documents = await getDocumentsByIds(db, parsed.data.documentIds);
    if (documents.length < 2) throw new HttpError(400, "bad_request", "比較には2件以上の文書が必要です");
    const provider = await getActiveAiProvider(db, env);
    if (provider) {
      const limited = aiRateLimited(c);
      if (!limited.allowed) {
        return c.json(
          { error: { code: "rate_limited", message: "AI 利用量の上限に達しました。1時間後に再試行してください" } },
          429,
          { "Retry-After": String(limited.retryAfterSeconds) }
        );
      }
    }
    const generated = await generateComparison(documents, parsed.data.axes, env, provider, c.get("userId"));
    const comparison = await createComparison(db, {
      projectId,
      title: parsed.data.title ?? generated.title,
      axes: generated.axes,
      rows: generated.rows,
      notes: generated.notes
    });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "comparison.create",
      resourceType: "comparison",
      resourceId: comparison.id,
      detail: { projectId, documentCount: documents.length }
    });
    return c.json({ comparison }, 201);
  });

  app.get("/comparisons/:comparisonId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const comparison = await getComparison(db, c.req.param("comparisonId"));
    if (!comparison) throw notFound("比較表が見つかりません");
    await requireProjectAccess(db, c.get("userId")!, comparison.projectId, "viewer");
    return c.json({ comparison });
  });

  app.patch("/comparisons/:comparisonId", async (c) => {
    const parsed = updateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "更新内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const existing = await getComparison(db, c.req.param("comparisonId"));
    if (!existing) throw notFound("比較表が見つかりません");
    await requireProjectAccess(db, c.get("userId")!, existing.projectId, "editor");
    const comparison = await updateComparison(db, existing.id, parsed.data);
    await createAuditLog(db, { userId: c.get("userId"), action: "comparison.update", resourceType: "comparison", resourceId: existing.id });
    return c.json({ comparison });
  });

  return app;
}
