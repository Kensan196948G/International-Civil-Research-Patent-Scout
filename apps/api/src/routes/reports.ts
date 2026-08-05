import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { resolveEnv } from "../env.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { requireProjectAccess } from "../access.js";
import { generateReportWithAi } from "../ai-report.js";
import { getActiveAiProvider } from "../settings.js";
import { renderExcelDocument, renderPrintHtml, renderWordDocument } from "../reports-export.js";
import {
  createReport,
  getComparison,
  getDocumentsByIds,
  getLatestProjectSearch,
  getProjectById,
  getReport,
  listSummariesByDocumentIds
} from "../repositories.js";
import type { ReportType } from "@icrps/contracts";

const createSchema = z.object({
  title: z.string().min(1).max(500),
  reportType: z.enum(["summary", "technical_comparison", "patent_survey", "paper_review", "proposal_research"]),
  documentIds: z.array(z.string().uuid()).max(100).optional(),
  comparisonId: z.string().uuid().optional(),
  outputFormat: z.enum(["markdown"]).default("markdown")
});

export function reportRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/projects/:projectId/reports", async (c) => {
    const parsed = createSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "レポート条件が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "editor");
    const project = await getProjectById(db, projectId);
    if (!project) throw notFound("プロジェクトが見つかりません");
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
    const query = await getLatestProjectSearch(db, project.id);
    const summaries = await listSummariesByDocumentIds(
      db,
      documents.map((d) => d.id)
    );
    const provider = await getActiveAiProvider(db, resolveEnv(c.env));
    const rendered = await generateReportWithAi(
      {
        reportType: parsed.data.reportType as ReportType,
        project,
        query,
        documents,
        summaries,
        comparison,
        title: parsed.data.title
      },
      resolveEnv(c.env),
      provider
    );
    const markdown = rendered.markdown;
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
      detail: {
        projectId: project.id,
        reportType: parsed.data.reportType,
        mode: rendered.mode,
        model: rendered.modelName,
        documentCount: documents.length
      }
    });
    return c.json({ report }, 201);
  });

  app.get("/reports/:reportId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const report = await getReport(db, c.req.param("reportId"));
    if (!report) throw notFound("レポートが見つかりません");
    await requireProjectAccess(db, c.get("userId")!, report.projectId, "viewer");
    return c.json({ report });
  });

  app.post("/reports/:reportId/export", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const report = await getReport(db, c.req.param("reportId"));
    if (!report) throw notFound("レポートが見つかりません");
    await requireProjectAccess(db, c.get("userId")!, report.projectId, "viewer");
    await createAuditLog(db, { userId: c.get("userId"), action: "report.export", resourceType: "report", resourceId: report.id });
    const format = c.req.query("format") ?? "markdown";
    if (format === "word") {
      return c.html(renderWordDocument(report.contentMarkdown, report.title), 200, {
        "Content-Disposition": `attachment; filename="report-${report.id}.doc"`
      });
    }
    if (format === "excel") {
      return c.html(renderExcelDocument(report.contentMarkdown, report.title), 200, {
        "Content-Disposition": `attachment; filename="report-${report.id}.xls"`
      });
    }
    if (format === "html") {
      return c.html(renderPrintHtml(report.contentMarkdown, report.title), 200);
    }
    return c.text(report.contentMarkdown, 200, {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="report-${report.id}.md"`
    });
  });

  return app;
}
