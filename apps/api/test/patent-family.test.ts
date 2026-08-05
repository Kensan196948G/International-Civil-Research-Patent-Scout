import { afterEach, describe, expect, it, vi } from "vitest";
import type { Db } from "../src/db";
import type { WorkerEnv } from "../src/env";
import { getPatentFamily, mapOpsFamily } from "../src/patent-family";

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

const OPS_FAMILY = {
  "ops:world-patent-data": {
    "ops:family": {
      "@family-id": "123456",
      "ops:family-member": [
        {
          "publication-reference": {
            "document-id": [
              {
                "@document-id-type": "docdb",
                country: { $: "JP" },
                "doc-number": { $: "2020123456" },
                kind: { $: "A" },
                date: { $: "2020-06-01" }
              }
            ]
          },
          "invention-title": { $: "低炭素コンクリート" },
          parties: {
            applicants: {
              applicant: [{ "applicant-name": { name: { $: "建設技術研究所" } } }]
            }
          }
        },
        {
          "publication-reference": {
            "document-id": [
              {
                "@document-id-type": "docdb",
                country: { $: "US" },
                "doc-number": { $: "2020123456" },
                kind: { $: "B2" },
                date: { $: "2021-03-02" }
              }
            ]
          },
          "invention-title": { $: "Low carbon concrete" }
        }
      ]
    }
  }
};

function baseDoc(overrides: Record<string, unknown> = {}) {
  return {
    id: "d1",
    sourceType: "patent",
    title: "低炭素コンクリート組成物",
    originalTitle: null,
    abstract: "海洋環境向けの低炭素コンクリート",
    bodyText: null,
    url: "https://example.com",
    doi: null,
    patentNumber: "JP2020123456A",
    publicationNumber: "JP2020123456A",
    patentStatus: null,
    classifications: ["E04G23/00"],
    authors: null,
    inventors: ["山田 太郎"],
    applicants: ["建設技術研究所"],
    country: "JP",
    publicationDate: "2020-06-01",
    sourceName: "Espacenet (OPS)",
    licenseNote: null,
    contentHash: null,
    createdAt: "2026-08-01T00:00:00Z",
    updatedAt: "2026-08-01T00:00:00Z",
    ...overrides
  };
}

function fakeDb(rows: Array<Record<string, unknown>>): Db {
  return async (query) => {
    if (query.includes("FROM source_documents WHERE id <> $1")) return rows;
    return [];
  };
}

function toRow(doc: Record<string, unknown>): Record<string, unknown> {
  return {
    id: doc.id,
    source_type: doc.sourceType,
    title: doc.title,
    original_title: doc.originalTitle,
    abstract: doc.abstract,
    body_text: doc.bodyText,
    url: doc.url,
    doi: doc.doi,
    patent_number: doc.patentNumber,
    publication_number: doc.publicationNumber,
    patent_status: doc.patentStatus,
    classifications: doc.classifications,
    authors: doc.authors,
    inventors: doc.inventors,
    applicants: doc.applicants,
    country: doc.country,
    publication_date: doc.publicationDate,
    source_name: doc.sourceName,
    license_note: doc.licenseNote,
    content_hash: doc.contentHash,
    created_at: doc.createdAt,
    updated_at: doc.updatedAt
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("mapOpsFamily", () => {
  it("maps family members from OPS response", () => {
    const result = mapOpsFamily(OPS_FAMILY);
    expect(result.familyId).toBe("123456");
    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toMatchObject({
      patentNumber: "JP2020123456A",
      country: "JP",
      publicationDate: "2020-06-01",
      applicants: ["建設技術研究所"]
    });
    expect(result.members[1]?.patentNumber).toBe("US2020123456B2");
  });
});

describe("getPatentFamily", () => {
  it("returns none without a patent number", async () => {
    const result = await getPatentFamily(baseDoc({ patentNumber: null }), fakeDb([]), ENV);
    expect(result.mode).toBe("none");
  });

  it("fetches INPADOC family via OPS when keys are configured", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(OPS_FAMILY), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const result = await getPatentFamily(
      baseDoc(),
      fakeDb([]),
      { ...ENV, ESPACENET_OPS_KEY: "key", ESPACENET_OPS_SECRET: "secret" }
    );
    expect(result.mode).toBe("ops");
    expect(result.members.length).toBeGreaterThan(0);
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("/rest-services/family/publication/JP/2020123456/A");
  });

  it("falls back to DB candidates without OPS keys", async () => {
    const candidate = baseDoc({
      id: "d2",
      patentNumber: "US2020123456B2",
      country: "US",
      title: "低炭素コンクリート混合物とその製造方法",
      applicants: ["建設技術研究所"],
      classifications: ["E04G23/00"]
    });
    const result = await getPatentFamily(baseDoc(), fakeDb([toRow(candidate)]), ENV);
    expect(result.mode).toBe("db");
    expect(result.members.some((m) => m.patentNumber === "US2020123456B2")).toBe(true);
  });
});
