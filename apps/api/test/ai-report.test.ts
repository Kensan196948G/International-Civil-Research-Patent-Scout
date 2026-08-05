import { afterEach, describe, expect, it, vi } from "vitest";
import type { Comparison, ResearchProject, SourceDocument } from "@icrps/contracts";
import { generateReportWithAi } from "../src/ai-report";
import type { WorkerEnv } from "../src/env";

const ENV: WorkerEnv = {
  APP_ENV: "test",
  APP_URL: "http://localhost",
  DATABASE_URL: "postgres://x",
  JWT_SECRET: "test-secret",
  JWT_EXPIRES_IN: "12h",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org",
  ESPACENET_OPS_URL: "https://ops.epo.org/3.2"
};

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

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("generateReportWithAi", () => {
  it("falls back to the template when no LLM provider is configured", async () => {
    const result = await generateReportWithAi(
      {
        reportType: "summary",
        project,
        query: null,
        documents: docs,
        summaries: new Map(),
        comparison: null,
        title: "調査レポート"
      },
      ENV,
      null
    );
    expect(result.mode).toBe("template");
    expect(result.markdown).toContain("# 調査レポート");
    expect(result.markdown).toContain("10.1000/example");
  });

  it("uses LLM output and appends references when provider is configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    title: "AI レポート",
                    contentMarkdown: "## 調査結果\n\n主要な知見を整理しました。",
                    keyFindings: ["知見1"],
                    risks: ["要専門家確認"],
                    references: ["[1] Example Paper"]
                  })
                }
              }
            ]
          }),
          { status: 200 }
        )
      )
    );
    const result = await generateReportWithAi(
      {
        reportType: "technical_comparison",
        project,
        query: null,
        documents: docs,
        summaries: new Map(),
        comparison,
        title: "比較レポート"
      },
      ENV,
      { provider: "openai", apiKey: "sk-test", model: "gpt-test", baseUrl: "https://api.openai.com/v1" }
    );
    expect(result.mode).toBe("ai");
    expect(result.markdown).toContain("## 調査結果");
    expect(result.markdown).toContain("## 参考資料");
    expect(result.markdown).toContain("[1] Example Paper");
    expect(result.markdown).toContain("専門家確認");
  });

  it("falls back to template when LLM returns invalid output", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "not-json" } }]
          }),
          { status: 200 }
        )
      )
    );
    const result = await generateReportWithAi(
      {
        reportType: "patent_survey",
        project,
        query: null,
        documents: docs,
        summaries: new Map(),
        comparison: null,
        title: "特許調査"
      },
      ENV,
      { provider: "openai", apiKey: "sk-test", model: "gpt-test", baseUrl: "https://api.openai.com/v1" }
    );
    expect(result.mode).toBe("template");
    expect(result.markdown).toContain("特許調査");
  });
});
