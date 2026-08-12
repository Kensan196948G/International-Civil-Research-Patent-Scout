import type {
  Comparison,
  ReportType,
  ResearchProject,
  SearchQuery,
  SourceDocument
} from "@icrps/contracts";
import { REPORT_TYPES, DISCLAIMER } from "@icrps/contracts";

function md(text: string | null | undefined): string {
  return (text ?? "").replace(/\|/g, "\\|").replace(/\r/g, "").trim();
}

function docList(documents: SourceDocument[]): string {
  if (documents.length === 0) return "- 保存済み文献はありません。";
  return documents
    .map((d) => {
      const id = d.doi ? ` DOI: ${d.doi}` : d.patentNumber ? ` 公開番号: ${d.patentNumber}` : "";
      return `- ${md(d.title)}${id} — ${md(d.url ?? d.sourceName ?? "出典不明")}`;
    })
    .join("\n");
}

function comparisonTable(comparison: Comparison | null): string {
  if (!comparison || comparison.rows.length === 0) return "（比較表はまだありません）";
  const header = `| 比較項目 | ${comparison.rows.map((r) => md(r.technologyName).replace(/\n/g, " ")).join(" | ")} |`;
  const sep = `| --- | ${comparison.rows.map(() => "---").join(" | ")} |`;
  const rows = comparison.comparisonAxes
    .map((axis) => {
      const cells = comparison.rows.map((r) => md(r.values[axis] ?? "—").replace(/\n/g, " "));
      return `| ${md(axis)} | ${cells.join(" | ")} |`;
    })
    .join("\n");
  const notes = comparison.notes.length ? `\n注意: ${comparison.notes.map(md).join(" / ")}` : "";
  return `${header}\n${sep}\n${rows}${notes}`;
}

function searchConditions(query: SearchQuery | null): string {
  if (!query) return "（検索条件なし）";
  return `- 検索語: ${md(query.queryText)}\n- 対象ソース: ${query.sourceTypes.join(", ")}`;
}

export function renderReport(input: {
  reportType: ReportType;
  project: ResearchProject | null;
  query: SearchQuery | null;
  documents: SourceDocument[];
  comparison: Comparison | null;
  title: string;
  audience?: string;
}): string {
  const { reportType, project, query, documents, comparison, title } = input;
  const generatedAt = new Date().toISOString();
  const sections: string[] = [];
  sections.push(`# ${md(title)}`, "", `> 生成日時: ${generatedAt}`, "");
  sections.push(`## 1. 調査概要`, `- 調査テーマ: ${md(project?.title ?? "未設定")}`);
  if (project?.description) sections.push(`- 調査目的: ${md(project.description)}`);
  if (input.audience) sections.push(`- 想定読者: ${md(input.audience)}`);
  sections.push("", `## 2. 検索条件`, searchConditions(query), "");
  if (reportType === "technical_comparison") {
    sections.push(`## 3. 比較表`, comparisonTable(comparison), "", `## 4. 各技術の詳細`, docList(documents), "");
  } else if (reportType === "patent_survey") {
    const patents = documents.filter((d) => d.sourceType === "patent");
    const others = documents.filter((d) => d.sourceType !== "patent");
    sections.push(
      `## 3. 主要特許一覧`,
      patents.length ? docList(patents) : "- 特許が取得できていません。",
      "",
      `## 4. 関連する論文・資料`,
      others.length ? docList(others) : "- なし",
      ""
    );
  } else if (reportType === "paper_review") {
    sections.push(`## 3. 関連論文`, docList(documents), "");
  } else {
    sections.push(`## 3. 主要な発見`, docList(documents), "");
  }
  sections.push(
    `## 5. 注意点・未確認事項`,
    `- AI要約は公開情報に基づく調査支援情報です。`,
    `- 特許・設計・施工・安全性の最終判断には原典確認と専門家確認が必要です。`,
    "",
    `## 6. 参考文献・出典`,
    docList(documents),
    "",
    `---`,
    ``,
    `> ${DISCLAIMER}`,
    `> テンプレート: ${REPORT_TYPES[reportType]}（${reportType}）`
  );
  return sections.join("\n");
}
