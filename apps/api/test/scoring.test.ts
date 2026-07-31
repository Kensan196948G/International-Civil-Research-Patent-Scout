import { describe, expect, it } from "vitest";
import { contentHash, dedupeAndScore, dedupeKey, normalizeTitle, relevanceScore } from "../src/scoring";
import type { SearchConnectorResult } from "@icrps/contracts";

const paper: SearchConnectorResult = {
  sourceType: "paper",
  title: "Low carbon concrete for civil engineering",
  abstract: "This paper studies low carbon concrete mixtures and their mechanical properties.",
  doi: "10.1000/example",
  url: "https://doi.org/10.1000/example",
  sourceName: "Crossref",
  publicationDate: "2024-01-01"
};

describe("normalizeTitle", () => {
  it("normalizes case and separators", () => {
    expect(normalizeTitle("  Low-Carbon  Concrete!! ")).toBe("low carbon concrete");
  });
});

describe("dedupeKey", () => {
  it("uses doi with priority", () => {
    expect(dedupeKey(paper)).toBe("doi:10.1000/example");
  });

  it("uses patent number when doi is absent", () => {
    expect(dedupeKey({ ...paper, doi: undefined, patentNumber: "US1234567A" })).toBe("patent:US1234567A");
  });
});

describe("contentHash", () => {
  it("generates stable hash", () => {
    expect(contentHash(paper)).toBe(contentHash({ ...paper, abstract: "different" }));
  });
});

describe("relevanceScore", () => {
  it("scores paper with keyword hits higher than unrelated", () => {
    const high = relevanceScore("low carbon concrete", paper);
    const low = relevanceScore("tunnel boring machine", paper);
    expect(high).toBeGreaterThan(low);
  });
});

describe("dedupeAndScore", () => {
  it("deduplicates by doi and sorts by score", () => {
    const dup: SearchConnectorResult = { ...paper, title: "Duplicate title", abstract: "other" };
    const unrelated: SearchConnectorResult = {
      sourceType: "web",
      title: "About fishing",
      snippet: "nothing relevant",
      url: "https://example.com/fishing"
    };
    const items = dedupeAndScore("low carbon concrete", [paper, dup, unrelated]);
    expect(items).toHaveLength(2);
    expect(items[0]!.score).toBeGreaterThanOrEqual(items[1]!.score);
  });
});
