import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { renderReport } from "../reports.js";
import {
  createReport,
  getComparison,
  getDocumentsByIds,
  getProject,
  getReport
} from "../repositories.js";
import type { ReportType } from "@icrps/contracts";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  reportType: z.enum(["summary", "technical_comparison", "patent_survey", "paper_review", "proposal_research"]),
  documentIds: z.array(z.string().uuid()).max(100).optional(),
  comparisonId: z.string().uuid().optional(),
  outputFormat: z.enum(["markdown"]).default("markdown")
});

async function assertProjectOwnership(db: ReturnType<typeof createDb>, userId: string, projectId: string) {
  const project = await getProject(db, userId, projectId);
  if (!project) throw notFound("プロジェクトが見つかりません");
  return project;
}

export function reportRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/projects/:projectId/reports", async (c) => {
    const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "レポート条件が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const project = await assertProjectOwnership(db, c.get("userId")!, c.req.param("projectId"));
    const documents = parsed.data.documentIds?.length
      ? await getDocumentsByIds(db, parsed.data.documentIds)
      : [];
    const comparison = parsed.data.comparisonId
      ? await getComparison(db, parsed.data.comparisonId)
      : null;
    if (parsed.data.comparisonId && comparison && comparison.projectId !== project.id) {
      throw new HttpError(403, "forbidden", "この比較表はプロジェクトに属していません");
    }
    if (parsed.data.comparisonId && !comparison) throw notFound("比較表が見つかりません");
    const markdown = renderReport({
      reportType: parsed.data.reportType as ReportType,
      project,
      query: null,
      documents,
      comparison,
      title: parsed.data.title
    });
    const report = await createReport(db, {
      projectId: project.id,
      title: parsed.data.title,
      reportType: parsed.data.reportType,
      contentMarkdown: markdown,
      createdBy: c.get("userId")!
    });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "report.create",
      resourceType: "report",
      resourceId: report.id,
      detail: { projectId: project.id, reportType: parsed.data.reportType }
    });
    return c.json({ report }, 201);
  });

  app.get("/reports/:reportId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const report = await getReport(db, c.req.param("reportId"));
    if (!report) throw notFound("レポートが見つかりません");
    await assertProjectOwnership(db, c.get("userId")!, report.projectId);
    return c.json({ report });
  });

  app.post("/reports/:reportId/export", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const report = await getReport(db, c.req.param("reportId"));
    if (!report) throw notFound("レポートが見つかりません");
    await assertProjectOwnership(db, c.get("userId")!, report.projectId);
    await createAuditLog(db, { userId: c.get("userId"), action: "report.export", resourceType: "report", resourceId: report.id });
    return c.text(report.contentMarkdown, 200, {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-${report.id}.md"`
    });
  });

  return app;
}
