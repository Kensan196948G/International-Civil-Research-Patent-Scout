import { describe, expect, it } from "vitest";
import type { Db } from "../src/db";
import { answerChat } from "../src/chat";

const ENV = {
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

function fakeDb(docs: Array<Record<string, unknown>>): Db {
  return async (query, _params) => {
    if (query.includes("FROM project_documents pd")) return docs;
    if (query.includes("FROM source_documents")) return docs;
    if (query.includes("FROM watch_topics")) return [];
    return [];
  };
}

describe("answerChat (rule fallback)", () => {
  it("answers with citations from matching saved documents", async () => {
    const db = fakeDb([
      {
        id: "d1",
        source_type: "paper",
        title: "低炭素コンクリートのレビュー",
        original_title: null,
        abstract: "低炭素コンクリートの適用条件と耐久性について整理した。",
        body_text: null,
        url: "https://example.com/1",
        doi: "10.1/1",
        patent_number: null,
        publication_number: null,
        authors: null,
        inventors: null,
        applicants: null,
        country: null,
        publication_date: null,
        source_name: "Crossref",
        license_note: null,
        content_hash: null,
        created_at: "2026-08-01T00:00:00Z",
        updated_at: "2026-08-01T00:00:00Z"
      }
    ]);
    const result = await answerChat(db, ENV, null, "user-1", "低炭素コンクリートの適用条件は？");
    expect(result.mode).toBe("rule");
    expect(result.reply).toContain("低炭素コンクリートのレビュー");
    expect(result.cites.length).toBeGreaterThanOrEqual(1);
    expect(result.cites[0]).toMatchObject({ n: "1", title: "低炭素コンクリートのレビュー", url: "https://example.com/1" });
  });

  it("reports no match when no document hits", async () => {
    const db = fakeDb([]);
    const result = await answerChat(db, ENV, null, "user-1", "トンネル掘進の制御方法は？");
    expect(result.mode).toBe("rule");
    expect(result.reply).toContain("見つかりませんでした");
  });

  it("searches global documents when no saved documents exist", async () => {
    const db = fakeDb([
      {
        id: "g1",
        source_type: "paper",
        title: "低炭素コンクリートの海洋適用",
        original_title: null,
        abstract: "飛沫帯での耐久性評価。",
        body_text: null,
        url: "https://example.com/g1",
        doi: "10.1/g1",
        patent_number: null,
        publication_number: null,
        authors: null,
        inventors: null,
        applicants: null,
        country: null,
        publication_date: null,
        source_name: "収集文献",
        license_note: null,
        content_hash: null,
        created_at: "2026-08-01T00:00:00Z",
        updated_at: "2026-08-01T00:00:00Z"
      }
    ]);
    const result = await answerChat(db, ENV, null, "user-1", "低炭素コンクリートの適用条件は？");
    expect(result.mode).toBe("rule");
    expect(result.reply).toContain("低炭素コンクリートの海洋適用");
  });
});
