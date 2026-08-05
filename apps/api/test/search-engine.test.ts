import { afterEach, describe, expect, it, vi } from "vitest";
import type { Db } from "../src/db";
import type { WorkerEnv } from "../src/env";
import { mapMeilisearchHits, reindexMeilisearch, searchDocuments } from "../src/search-engine";

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

function fakeDb(rows: Array<Record<string, unknown>>): Db {
  return async (query) => {
    if (query.includes("FROM source_documents")) return rows;
    return [];
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mapMeilisearchHits", () => {
  it("maps hits to source documents", () => {
    const docs = mapMeilisearchHits({
      hits: [
        {
          id: "d1",
          sourceType: "paper",
          title: "Low carbon concrete",
          doi: "10.1/1",
          classifications: ["E04G23/00"],
          createdAt: "2026-01-01T00:00:00Z",
          updatedAt: "2026-01-01T00:00:00Z"
        }
      ]
    });
    expect(docs[0]?.title).toBe("Low carbon concrete");
    expect(docs[0]?.classifications).toEqual(["E04G23/00"]);
  });
});

describe("searchDocuments", () => {
  it("falls back to trigram when Meilisearch is not configured", async () => {
    const docs = await searchDocuments(ENV, fakeDb([]), "低炭素", 10);
    expect(docs).toEqual([]);
  });

  it("uses Meilisearch when configured and falls back on error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    const docs = await searchDocuments(
      { ...ENV, MEILISEARCH_HOST: "http://meili:7700" },
      fakeDb([
        {
          id: "d1",
          source_type: "paper",
          title: "fallback",
          original_title: null,
          abstract: null,
          body_text: null,
          url: null,
          doi: null,
          patent_number: null,
          publication_number: null,
          patent_status: null,
          classifications: null,
          authors: null,
          inventors: null,
          applicants: null,
          country: null,
          publication_date: null,
          source_name: null,
          license_note: null,
          content_hash: null,
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z"
        }
      ]),
      "低炭素",
      10
    );
    expect(docs).toHaveLength(1);
  });
});

describe("reindexMeilisearch", () => {
  it("does nothing when Meilisearch is not configured", async () => {
    const result = await reindexMeilisearch(fakeDb([]), ENV);
    expect(result).toEqual({ indexed: 0, batches: 0 });
  });

  it("posts documents in batches", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 202 }));
    vi.stubGlobal("fetch", fetchMock);
    const rows = Array.from({ length: 5 }, (_, i) => ({
      id: `d${i}`,
      source_type: "paper",
      title: `Doc ${i}`,
      original_title: null,
      abstract: null,
      body_text: null,
      url: null,
      doi: null,
      patent_number: null,
      publication_number: null,
      patent_status: null,
      classifications: null,
      authors: null,
      inventors: null,
      applicants: null,
      country: null,
      publication_date: null,
      source_name: null,
      license_note: null,
      content_hash: null,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z"
    }));
    const result = await reindexMeilisearch(fakeDb(rows), { ...ENV, MEILISEARCH_HOST: "http://meili:7700" });
    expect(result).toEqual({ indexed: 5, batches: 1 });
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("/indexes/source_documents/documents");
  });
});
