import { Hono } from "hono";
import { z } from "zod";
import type { ProjectDocument } from "@icrps/contracts";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { requireProjectAccess } from "../access.js";
import { aiRateLimited } from "../ai-limits.js";
import { summarizeDocument, toSummaryRecord } from "../ai.js";
import { getActiveAiProvider } from "../settings.js";
import { getCitationInfo } from "../citations.js";
import { getPatentFamily } from "../patent-family.js";
import {
  deleteProjectDocument,
  findDocumentByKey,
  getDocumentById,
  getSummaryById,
  listDocumentCandidates,
  getProjectDocument,
  getSummary,
  insertDocument,
  insertSummary,
  listProjectDocuments,
  listSummaries,
  normalizeContentHash,
  saveProjectDocument,
  updateProjectDocument,
  updateSummaryReview
} from "../repositories.js";
import { similarityScore } from "../scoring.js";

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

const importSchema = z
  .object({
    sourceType: z.enum(["web", "paper", "patent", "pdf"]),
    title: z.string().min(1).max(1000),
    originalTitle: z.string().max(1000).nullable().optional(),
    abstract: z.string().max(20000).nullable().optional(),
    url: z.string().url().max(2000).nullable().optional(),
    doi: z.string().max(255).nullable().optional(),
    patentNumber: z.string().max(255).nullable().optional(),
    publicationNumber: z.string().max(255).nullable().optional(),
    authors: z.array(z.string().max(255)).max(100).optional(),
    inventors: z.array(z.string().max(255)).max(100).optional(),
    applicants: z.array(z.string().max(255)).max(100).optional(),
    country: z.string().max(50).nullable().optional(),
    publicationDate: z
      .string()
      .regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "公開日は YYYY / YYYY-MM / YYYY-MM-DD 形式で指定してください")
      .nullable()
      .optional(),
    sourceName: z.string().max(255).nullable().optional(),
    projectId: z.string().uuid().nullable().optional()
  })
  .refine((v) => v.url || v.doi || v.patentNumber, {
    message: "URL・DOI・特許番号のいずれかを指定してください",
    path: ["url"]
  });

const reviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "edited"]),
  summaryText: z.string().max(20000).nullable().optional()
});

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

  app.get("/documents/:documentId/similar", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const document = await getDocumentById(db, c.req.param("documentId"));
    if (!document) throw notFound("文書が見つかりません");
    const limit = Math.min(Math.max(Number(c.req.query("limit") ?? 10), 1), 20);
    const candidates = await listDocumentCandidates(db, document.id, 300);
    const base = `${document.title} ${document.originalTitle ?? ""} ${document.abstract ?? ""} ${
      (document.applicants ?? []).join(" ")
    } ${(document.classifications ?? []).join(" ")}`;
    const scored = candidates
      .map((candidate) => {
        const target = `${candidate.title} ${candidate.originalTitle ?? ""} ${candidate.abstract ?? ""} ${
          (candidate.applicants ?? []).join(" ")
        } ${(candidate.classifications ?? []).join(" ")}`;
        const { score, matchedTerms } = similarityScore(base, target, {
          applicantsA: document.applicants ?? undefined,
          applicantsB: candidate.applicants ?? undefined,
          inventorsA: document.inventors ?? undefined,
          inventorsB: candidate.inventors ?? undefined,
          classificationsA: document.classifications ?? undefined,
          classificationsB: candidate.classifications ?? undefined
        });
        return { document: candidate, score, matchedTerms };
      })
      .filter((item) => item.score >= 15)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    return c.json({ items: scored });
  });

  app.get("/documents/:documentId/citations", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const document = await getDocumentById(db, c.req.param("documentId"));
    if (!document) throw notFound("文書が見つかりません");
    const citation = await getCitationInfo(document, resolveEnv(c.env));
    return c.json({ citation });
  });

  app.get("/documents/:documentId/patent-family", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const document = await getDocumentById(db, c.req.param("documentId"));
    if (!document) throw notFound("文書が見つかりません");
    const family = await getPatentFamily(document, db, resolveEnv(c.env));
    return c.json({ family });
  });

  app.post("/documents/import", async (c) => {
    const parsed = importSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "文献情報が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const input = parsed.data;
    const key = {
      doi: input.doi ?? null,
      patentNumber: input.patentNumber ?? null,
      url: input.url ?? null,
      contentHash: input.doi ?? input.patentNumber ?? input.url ?? null
    };
    let document = await findDocumentByKey(db, key);
    const created = !document;
    if (!document) {
      document = await insertDocument(
        db,
        {
          sourceType: input.sourceType,
          title: input.title,
          originalTitle: input.originalTitle ?? undefined,
          abstract: input.abstract ?? undefined,
          url: input.url ?? undefined,
          doi: input.doi ?? undefined,
          patentNumber: input.patentNumber ?? undefined,
          publicationNumber: input.publicationNumber ?? undefined,
          authors: input.authors?.length ? input.authors : undefined,
          inventors: input.inventors?.length ? input.inventors : undefined,
          applicants: input.applicants?.length ? input.applicants : undefined,
          country: input.country ?? undefined,
          publicationDate: input.publicationDate ?? undefined,
          sourceName: input.sourceName ?? "手動登録"
        },
        await normalizeContentHash(key.contentHash)
      );
    }
    let saved: ProjectDocument | null = null;
    if (input.projectId) {
      const { projectId } = await requireProjectAccess(db, c.get("userId")!, input.projectId, "editor");
      saved = await saveProjectDocument(db, { projectId, sourceDocumentId: document.id });
    }
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "document.import",
      resourceType: "source_document",
      resourceId: document.id,
      detail: { created, sourceType: input.sourceType, projectId: input.projectId ?? null }
    });
    return c.json({ document, created, saved }, created ? 201 : 200);
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
    const output = await summarizeDocument(
      document,
      parsed.data.summaryType,
      parsed.data.language,
      env,
      provider,
      c.get("userId")
    );
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

  app.patch("/documents/:documentId/summaries/:summaryId", async (c) => {
    const parsed = reviewSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "レビュー内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const document = await getDocumentById(db, c.req.param("documentId"));
    if (!document) throw notFound("文書が見つかりません");
    const summary = await getSummaryById(db, c.req.param("summaryId"));
    if (!summary || summary.sourceDocumentId !== document.id) throw notFound("要約が見つかりません");
    const updated = await updateSummaryReview(db, summary.id, {
      status: parsed.data.status,
      reviewedBy: c.get("userId")!,
      summaryText: parsed.data.summaryText ?? undefined
    });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "summary.review",
      resourceType: "ai_summary",
      resourceId: summary.id,
      detail: { status: parsed.data.status, edited: !!parsed.data.summaryText }
    });
    return c.json({ summary: updated });
  });

  app.post("/projects/:projectId/documents", async (c) => {
    const parsed = saveSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "保存内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "editor");
    const document = await getDocumentById(db, parsed.data.documentId);
    if (!document) throw notFound("文書が見つかりません");
    const saved = await saveProjectDocument(db, {
      projectId,
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
      detail: { projectId, documentId: document.id }
    });
    return c.json({ projectDocument: saved, document }, 201);
  });

  app.get("/projects/:projectId/documents", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "viewer");
    const items = await listProjectDocuments(db, projectId);
    const documents = await Promise.all(items.map((item) => getDocumentById(db, item.sourceDocumentId)));
    return c.json({
      projectDocuments: items.map((item, i) => ({ ...item, document: documents[i] ?? null }))
    });
  });

  app.patch("/projects/:projectId/documents/:projectDocumentId", async (c) => {
    const parsed = updateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "更新内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "editor");
    const existing = await getProjectDocument(db, c.req.param("projectDocumentId"));
    if (!existing || existing.projectId !== projectId) throw notFound("保存文書が見つかりません");
    const updated = await updateProjectDocument(db, existing.id, parsed.data);
    await createAuditLog(db, { userId: c.get("userId"), action: "document.update", resourceType: "project_document", resourceId: existing.id });
    return c.json({ projectDocument: updated });
  });

  app.delete("/projects/:projectId/documents/:projectDocumentId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "editor");
    const existing = await getProjectDocument(db, c.req.param("projectDocumentId"));
    if (!existing || existing.projectId !== projectId) throw notFound("保存文書が見つかりません");
    await deleteProjectDocument(db, existing.id);
    await createAuditLog(db, { userId: c.get("userId"), action: "document.delete", resourceType: "project_document", resourceId: existing.id });
    return c.body(null, 204);
  });

  return app;
}
