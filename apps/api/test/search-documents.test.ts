import { describe, expect, it } from "vitest";
import type { Db } from "../src/db";
import { searchDocumentsByText } from "../src/repositories";

function fakeDb(): Db {
  return async (query, params = []) => {
    if (query.includes("FROM source_documents")) {
      expect(params[0]).toBe("%低炭素コンクリート%");
      expect(params[1]).toBe("低炭素コンクリート");
      return [
        {
          id: "d1",
          source_type: "paper",
          title: "低炭素コンクリートのレビュー",
          original_title: null,
          abstract: "要旨",
          body_text: null,
          url: "https://example.com/1",
          doi: "10.1/1",
          patent_number: null,
          publication_number: null,
          patent_status: null,
          classifications: null,
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
      ];
    }
    return [];
  };
}

describe("searchDocumentsByText", () => {
  it("queries with ILIKE pattern and trigram ordering", async () => {
    const docs = await searchDocumentsByText(fakeDb(), "低炭素コンクリート", 10);
    expect(docs).toHaveLength(1);
    expect(docs[0]?.title).toContain("低炭素");
  });
});
