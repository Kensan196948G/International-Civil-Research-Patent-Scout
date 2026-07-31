import { describe, expect, it } from "vitest";
import { renderReport } from "../src/reports";
import type { Comparison, ResearchProject, SourceDocument } from "@icrps/contracts";

const project: ResearchProject = {
  id: "p1",
  ownerUserId: "u1",
  title: "低炭素コンクリート調査",
  description: "R&D 用",
  status: "active",
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

const docs: SourceDocument[] = [
  {
    id: "d1",
    sourceType: "paper",
    title: "Example Paper",
    originalTitle: null,
    abstract: "Abstract text",
    bodyText: null,
    url: "https://example.com",
    doi: "10.1000/example",
    patentNumber: null,
    publicationNumber: null,
    authors: ["A"],
    inventors: null,
    applicants: null,
    country: null,
    publicationDate: "2024-01-01",
    sourceName: "Crossref",
    licenseNote: null,
    contentHash: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

describe("renderReport", () => {
  it("renders summary report with references", () => {
    const md = renderReport({
      reportType: "summary",
      project,
      query: null,
      documents: docs,
      comparison: null,
      title: "調査レポート"
    });
    expect(md).toContain("# 調査レポート");
    expect(md).toContain("低炭素コンクリート調査");
    expect(md).toContain("10.1000/example");
    expect(md).toContain("調査支援情報");
    expect(md).toContain("専門家確認");
  });

  it("renders comparison table", () => {
    const comparison: Comparison = {
      id: "c1",
      projectId: "p1",
      title: "比較",
      comparisonAxes: ["技術概要"],
      rows: [{ technologyName: "技術A", values: { 技術概要: "概要A" }, sourceDocumentIds: ["d1"] }],
      notes: ["要専門家確認"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const md = renderReport({
      reportType: "technical_comparison",
      project,
      query: null,
      documents: docs,
      comparison,
      title: "比較レポート"
    });
    expect(md).toContain("| 比較項目 | 技術A |");
    expect(md).toContain("要専門家確認");
  });
});
