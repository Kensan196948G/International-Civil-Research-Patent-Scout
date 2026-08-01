import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { summarizeDocument, toSummaryRecord } from "../ai.js";
import { getActiveAiProvider } from "../settings.js";
import {
  deleteProjectDocument,
  getDocumentById,
  getProject,
  getProjectDocument,
  getSummary,
  insertSummary,
  listProjectDocuments,
  listSummaries,
  saveProjectDocument,
  updateProjectDocument
} from "../repositories.js";

const summarizeSchema = z.object({
  summaryType: z.enum(["short", "detailed", "technical", "patent"]).default("technical"),
  language: z.enum(["ja", "en"]).default("ja")
});

const saveSchema = z.object({
  documentId: z.string().uuid(),
  tags: z.array(z.string().max(100)).max(50).optional(),
  importance: z.number().int().min(1).max(5).nullable().optional(),
  userNote: z.string().max(5000).nullable().optional(),
  status: z.enum(["saved", "reviewed", "excluded"]).optional()
});

const updateSchema = saveSchema.omit({ documentId: true }).partial();

export function documentRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/documents/:documentId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const document = await getDocumentById(db, c.req.param("documentId"));
    if (!document) throw notFound("文書が見つかりません");
    const summaries = await listSummaries(db, document.id);
    return c.json({ document, summaries });
  });

  app.post("/documents/:documentId/summarize", async (c) => {
    const parsed = summarizeSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "要約条件が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const document = await getDocumentById(db, c.req.param("documentId"));
    if (!document) throw notFound("文書が見つかりません");
    const existing = await getSummary(db, document.id, parsed.data.summaryType, parsed.data.language);
    if (existing) return c.json({ summary: existing });
    const provider = await getActiveAiProvider(db, env);
    const output = await summarizeDocument(document, parsed.data.summaryType, parsed.data.language, env, provider);
    const summary = await insertSummary(db, {
      sourceDocumentId: document.id,
      summaryType: parsed.data.summaryType,
      language: parsed.data.language,
      ...toSummaryRecord(document, parsed.data.summaryType, parsed.data.language, output)
    });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "summary.generate",
      resourceType: "source_document",
      resourceId: document.id,
      detail: { summaryType: parsed.data.summaryType, model: summary.modelName }
    });
    return c.json({ summary }, 201);
  });

  app.post("/projects/:projectId/documents", async (c) => {
    const parsed = saveSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "保存内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const project = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!project) throw notFound("プロジェクトが見つかりません");
    const document = await getDocumentById(db, parsed.data.documentId);
    if (!document) throw notFound("文書が見つかりません");
    const saved = await saveProjectDocument(db, {
      projectId: project.id,
      sourceDocumentId: document.id,
      tags: parsed.data.tags,
      importance: parsed.data.importance,
      userNote: parsed.data.userNote,
      status: parsed.data.status
    });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "document.save",
      resourceType: "project_document",
      resourceId: saved.id,
      detail: { projectId: project.id, documentId: document.id }
    });
    return c.json({ projectDocument: saved, document }, 201);
  });

  app.get("/projects/:projectId/documents", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const project = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!project) throw notFound("プロジェクトが見つかりません");
    const items = await listProjectDocuments(db, project.id);
    const documents = await Promise.all(items.map((item) => getDocumentById(db, item.sourceDocumentId)));
    return c.json({
      projectDocuments: items.map((item, i) => ({ ...item, document: documents[i] ?? null }))
    });
  });

  app.patch("/projects/:projectId/documents/:projectDocumentId", async (c) => {
    const parsed = updateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "更新内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const project = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!project) throw notFound("プロジェクトが見つかりません");
    const existing = await getProjectDocument(db, c.req.param("projectDocumentId"));
    if (!existing || existing.projectId !== project.id) throw notFound("保存文書が見つかりません");
    const updated = await updateProjectDocument(db, existing.id, parsed.data);
    await createAuditLog(db, { userId: c.get("userId"), action: "document.update", resourceType: "project_document", resourceId: existing.id });
    return c.json({ projectDocument: updated });
  });

  app.delete("/projects/:projectId/documents/:projectDocumentId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const project = await getProject(db, c.get("userId")!, c.req.param("projectId"));
    if (!project) throw notFound("プロジェクトが見つかりません");
    const existing = await getProjectDocument(db, c.req.param("projectDocumentId"));
    if (!existing || existing.projectId !== project.id) throw notFound("保存文書が見つかりません");
    await deleteProjectDocument(db, existing.id);
    await createAuditLog(db, { userId: c.get("userId"), action: "document.delete", resourceType: "project_document", resourceId: existing.id });
    return c.body(null, 204);
  });

  return app;
}
