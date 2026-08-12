// AI レポート本文生成
// - LLM が保存文献・要約・比較表から Markdown レポートを生成する
// - LLM 未設定・失敗時は既存テンプレート（renderReport）へフォールバック
import type {
  AiSummary,
  Comparison,
  ReportType,
  ResearchProject,
  SearchQuery,
  SourceDocument
} from "@icrps/contracts";
import { DISCLAIMER, REPORT_TYPES } from "@icrps/contracts";
import type { WorkerEnv } from "./env.js";
import type { ActiveAiProvider } from "./settings.js";
import { callLlmJson } from "./ai.js";
import { renderReport } from "./reports.js";

export interface AiReportInput {
  reportType: ReportType;
  project: ResearchProject | null;
  query: SearchQuery | null;
  documents: SourceDocument[];
  summaries: Map<string, AiSummary>;
  comparison: Comparison | null;
  title: string;
  audience?: string;
}

export interface AiReportResult {
  markdown: string;
  modelName: string;
  promptVersion: string;
  mode: "ai" | "template";
}

const REPORT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    contentMarkdown: { type: "string" },
    keyFindings: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    references: { type: "array", items: { type: "string" } }
  },
  required: ["title", "contentMarkdown"],
  additionalProperties: true
} as const;

export async function generateReportWithAi(
  input: AiReportInput,
  env: WorkerEnv,
  provider: ActiveAiProvider | null,
  userId?: string
): Promise<AiReportResult> {
  const templateMarkdown = renderReport({
    reportType: input.reportType,
    project: input.project,
    query: input.query,
    documents: input.documents,
    comparison: input.comparison,
    title: input.title
  });
  if (!provider) {
    return { markdown: templateMarkdown, modelName: "rule-based-fallback", promptVersion: "v1-template", mode: "template" };
  }
  try {
    const numberedDocs = input.documents
      .map((d, i) => {
        const summary = input.summaries.get(d.id);
        return `${i + 1}. ${d.title}
  種別: ${d.sourceType === "patent" ? "特許" : d.sourceType === "paper" ? "論文" : "Web"}
  出典: ${d.url ?? d.sourceName ?? "不明"}${d.doi ? ` / DOI: ${d.doi}` : ""}${d.patentNumber ? ` / 公開番号: ${d.patentNumber}` : ""}
  要旨: ${(summary?.summaryText ?? d.abstract ?? "要旨なし").slice(0, 800)}`;
      })
      .join("\n\n");
    const comparisonText = input.comparison
      ? `比較表: ${input.comparison.title}\n軸: ${input.comparison.comparisonAxes.join("、")}\n${input.comparison.rows
          .map(
            (r) =>
              `- ${r.technologyName}: ${input.comparison?.comparisonAxes
                .map((axis) => `${axis}=${r.values[axis] ?? "—"}`)
                .join(" / ")}`
          )
          .join("\n")}`
      : "比較表なし";
    const result = await callLlmJson(
      {
        system:
          "あなたは土木技術調査の専門アシスタントです。与えられた文献・要約・比較表に基づき、調査レポートを日本語の Markdown で作成してください。出典にない断定は避け、推測は「推測」と明記してください。文献への引用は [1] 形式で番号を明記してください。JSON で {title, contentMarkdown, keyFindings[], risks[], references[]} を出力してください。",
        user: JSON.stringify({
          reportType: input.reportType,
      reportTypeLabel: REPORT_TYPES[input.reportType],
      audience: input.audience ?? "",
      title: input.title,
          project: input.project ? { title: input.project.title, description: input.project.description } : null,
          searchQuery: input.query
            ? { queryText: input.query.queryText, expanded: input.query.expandedQueries }
            : null,
          documents: numberedDocs,
          comparison: comparisonText
        }),
        meta: { action: "report.generate", userId }
      },
      env,
      REPORT_SCHEMA,
      provider
    );
    if (!result || typeof result.contentMarkdown !== "string" || !result.contentMarkdown.trim()) {
      throw new Error("AI レポート出力が空です");
    }
    const risks = Array.isArray(result.risks) ? result.risks.map(String) : [];
    const references = Array.isArray(result.references)
      ? result.references.map(String)
      : input.documents.map((d, i) => `[${i + 1}] ${d.title} — ${d.url ?? d.sourceName ?? "出典不明"}`);
    const markdown = [
      result.contentMarkdown.trim(),
      "",
      "---",
      "",
      "## 参考資料",
      references.length ? references.map((r) => `- ${r}`).join("\n") : "- なし",
      "",
      "## 注意点・未確認事項",
      ...(risks.length ? risks.map((r) => `- ${r}`) : ["- AI 生成内容は公開情報に基づく調査支援情報です。"]),
      "- 特許・設計・施工・安全性の最終判断には原典確認と専門家確認が必要です。",
      "",
      `> ${DISCLAIMER}`,
      `> テンプレート: ${REPORT_TYPES[input.reportType]}（AI 生成 ${input.documents.length} 文献を参照）`
    ].join("\n");
    return {
      markdown,
      modelName: provider.model,
      promptVersion: "v1-ai",
      mode: "ai"
    };
  } catch {
    return { markdown: templateMarkdown, modelName: "rule-based-fallback", promptVersion: "v1-template", mode: "template" };
  }
}
