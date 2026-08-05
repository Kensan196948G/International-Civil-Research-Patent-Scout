import { afterEach, describe, expect, it, vi } from "vitest";
import type { SourceDocument } from "@icrps/contracts";
import { getCitationInfo, mapCrossrefWork, mapOpenAlexWork, mapOpenAlexWorks } from "../src/citations";
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

const doc: SourceDocument = {
  id: "d1",
  sourceType: "paper",
  title: "Example",
  originalTitle: null,
  abstract: "Abstract",
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
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("citation mappers", () => {
  it("maps Crossref work data", () => {
    const result = mapCrossrefWork({
      message: {
        "is-referenced-by-count": 42,
        reference: [{ DOI: "10.1000/ref1", "article-title": "Reference 1" }, { DOI: "10.1000/ref2" }]
      }
    });
    expect(result.citedByCount).toBe(42);
    expect(result.referenceCount).toBe(2);
    expect(result.references).toEqual([
      { doi: "10.1000/ref1", title: "Reference 1" },
      { doi: "10.1000/ref2", title: undefined }
    ]);
  });

  it("maps OpenAlex work and cited-by works", () => {
    expect(mapOpenAlexWork({ id: "W123", cited_by_count: 7 })).toEqual({ openalexId: "W123", citedByCount: 7 });
    const works = mapOpenAlexWorks({
      results: [
        { id: "W1", doi: "https://doi.org/10.1000/a", title: "A" },
        { id: "W2", doi: "10.1000/b", title: "B" }
      ]
    });
    expect(works[0]?.doi).toBe("10.1000/a");
    expect(works[1]?.title).toBe("B");
  });
});

describe("getCitationInfo", () => {
  it("returns empty for documents without DOI", async () => {
    const info = await getCitationInfo({ ...doc, doi: null }, ENV);
    expect(info.doi).toBeNull();
    expect(info.citedByCount).toBeNull();
  });

  it("fetches Crossref and OpenAlex citation data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ message: { "is-referenced-by-count": 3, reference: [] } }), { status: 200 })
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: "W123", cited_by_count: 3 }), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            results: [{ id: "W9", doi: "https://doi.org/10.1000/citing", title: "Citing paper" }]
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    const info = await getCitationInfo(doc, ENV);
    expect(info.citedByCount).toBe(3);
    expect(info.referenceCount).toBe(0);
    expect(info.citedBy).toHaveLength(1);
    expect(info.citedBy[0]?.title).toBe("Citing paper");
  });
});
