import { afterEach, describe, expect, it, vi } from "vitest";
import type { SearchConnectorResult } from "@icrps/contracts";
import type { WorkerEnv } from "../src/env";

vi.mock("../src/repositories.js", () => ({
  completeSearchQuery: vi.fn(),
  createAuditLog: vi.fn(),
  failSearchQuery: vi.fn(),
  findDocumentsByContentHashes: vi.fn(),
  getSearchQuery: vi.fn(),
  insertDocumentsForSearch: vi.fn(),
  insertSearchResultsBatch: vi.fn(),
  normalizeContentHash: vi.fn(),
  setSearchQueryRunning: vi.fn()
}));
vi.mock("../src/connectors.js", () => ({ runConnectors: vi.fn() }));
vi.mock("../src/scoring.js", () => ({ dedupeAndScore: vi.fn() }));
vi.mock("../src/keywords.js", () => ({ expandKeywords: vi.fn() }));
vi.mock("../src/settings.js", () => ({ getActiveAiProvider: vi.fn() }));
vi.mock("../src/audit.js", () => ({ createAuditLog: vi.fn() }));

import { createAuditLog } from "../src/audit";
import { runConnectors } from "../src/connectors";
import { expandKeywords } from "../src/keywords";
import {
  completeSearchQuery,
  failSearchQuery,
  findDocumentsByContentHashes,
  getSearchQuery,
  insertDocumentsForSearch,
  insertSearchResultsBatch,
  normalizeContentHash,
  setSearchQueryRunning
} from "../src/repositories";
import { dedupeAndScore } from "../src/scoring";
import { getActiveAiProvider } from "../src/settings";
import { runSearchJob } from "../src/routes/search";

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

const result: SearchConnectorResult = {
  sourceType: "paper",
  title: "Low carbon concrete",
  url: "https://example.test/paper",
  doi: "10.1000/example",
  abstract: "durability in splash zone"
};

afterEach(() => {
  vi.clearAllMocks();
});

describe("runSearchJob (非同期検索ジョブ)", () => {
  it("transitions queued → running → completed and persists results", async () => {
    vi.mocked(getSearchQuery).mockResolvedValue({
      id: "q1",
      userId: "u1",
      projectId: null,
      queryText: "low carbon concrete",
      expandedQueries: null,
      sourceTypes: ["paper"],
      filters: { languageMode: "bilingual", countries: [], maxResults: 5 },
      status: "queued",
      executedAt: null,
      createdAt: new Date().toISOString()
    });
    vi.mocked(getActiveAiProvider).mockResolvedValue(null);
    vi.mocked(expandKeywords).mockResolvedValue({
      keywords: [],
      translatedQueries: [],
      synonymsJa: [],
      synonymsEn: []
    });
    vi.mocked(runConnectors).mockResolvedValue({ results: [result], failures: [] });
    vi.mocked(dedupeAndScore).mockReturnValue([{ result, score: 0.9, matchedKeywords: ["low"] }]);
    vi.mocked(normalizeContentHash).mockResolvedValue("hash1");
    vi.mocked(findDocumentsByContentHashes).mockResolvedValue([]);
    vi.mocked(insertDocumentsForSearch).mockResolvedValue([{ id: "d1", contentHash: "hash1" }]);
    vi.mocked(insertSearchResultsBatch).mockResolvedValue(undefined);
    vi.mocked(completeSearchQuery).mockResolvedValue(undefined);
    vi.mocked(createAuditLog).mockResolvedValue(undefined);

    await runSearchJob("q1", ENV);

    expect(setSearchQueryRunning).toHaveBeenCalledWith(expect.anything(), "q1");
    expect(runConnectors).toHaveBeenCalledOnce();
    expect(insertSearchResultsBatch).toHaveBeenCalledOnce();
    expect(completeSearchQuery).toHaveBeenCalledWith(
      expect.anything(),
      "q1",
      expect.anything(),
      []
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ userId: "u1", action: "search.execute", resourceId: "q1" })
    );
    expect(failSearchQuery).not.toHaveBeenCalled();
  });

  it("marks the query failed when the pipeline throws", async () => {
    vi.mocked(getSearchQuery).mockResolvedValue({
      id: "q1",
      userId: "u1",
      projectId: null,
      queryText: "low carbon",
      expandedQueries: null,
      sourceTypes: ["paper"],
      filters: {},
      status: "queued",
      executedAt: null,
      createdAt: new Date().toISOString()
    });
    vi.mocked(getActiveAiProvider).mockResolvedValue(null);
    vi.mocked(expandKeywords).mockRejectedValue(new Error("expansion failed"));
    vi.mocked(failSearchQuery).mockResolvedValue(undefined);

    await runSearchJob("q1", ENV);

    expect(failSearchQuery).toHaveBeenCalledWith(
      expect.anything(),
      "q1",
      expect.arrayContaining([expect.stringContaining("expansion failed")])
    );
    expect(completeSearchQuery).not.toHaveBeenCalled();
  });
});
