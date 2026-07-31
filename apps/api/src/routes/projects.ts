import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import {
  archiveProject,
  createProject,
  getProject,
  listComparisonsByProject,
  listProjects,
  listProjectDocuments,
  listReportsByProject,
  updateProject
} from "../repositories.js";
import { requireAuth } from "../auth.js";
import { resolveEnv } from "../env.js";

const projectCreateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).nullable().optional(),
  tags: z.array(z.string().max(100)).max(50).optional()
});

const projectUpdateSchema = projectCreateSchema
  .partial()
  .extend({ status: z.enum(["active", "archived", "completed"]).optional() });

export function projectRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const projects = await listProjects(db, c.get("userId")!);
    return c.json({ projects });
  });

  app.post("/", async (c) => {
    const parsed = projectCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const project = await createProject(db, {
      ownerUserId: c.get("userId")!,
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags
    });
    await createAuditLog(db, { userId: c.get("userId"), action: "project.create", resourceType: "project", resourceId: project.id });
    return c.json({ project }, 201);
  });

  app.get("/:projectId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const project = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!project) throw notFound("プロジェクトが見つかりません");
    const [documents, comparisons, reports] = await Promise.all([
      listProjectDocuments(db, project.id),
      listComparisonsByProject(db, project.id),
      listReportsByProject(db, project.id)
    ]);
    return c.json({ project, documents, comparisons, reports });
  });

  app.patch("/:projectId", async (c) => {
    const parsed = projectUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const existing = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!existing) throw notFound("プロジェクトが見つかりません");
    const project = await updateProject(db, existing.id, parsed.data);
    await createAuditLog(db, { userId: c.get("userId"), action: "project.update", resourceType: "project", resourceId: project!.id });
    return c.json({ project });
  });

  app.delete("/:projectId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const existing = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!existing) throw notFound("プロジェクトが見つかりません");
    const project = await archiveProject(db, existing.id);
    await createAuditLog(db, { userId: c.get("userId"), action: "project.archive", resourceType: "project", resourceId: existing.id });
    return c.json({ project });
  });

  return app;
}
