import { describe, expect, it } from "vitest";
import {
  contentHash,
  dedupeAndScore,
  dedupeKey,
  normalizeTitle,
  relevanceScore,
  similarityScore,
  tokenizeForSimilarity
} from "../src/scoring";
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

describe("similarityScore", () => {
  it("scores related civil engineering documents higher than unrelated ones", () => {
    const related = similarityScore(
      "低炭素コンクリートの海洋環境における塩害耐久性",
      "海洋環境の飛沫帯で使用する低炭素コンクリートの耐久性評価"
    );
    const unrelated = similarityScore(
      "低炭素コンクリートの海洋環境における塩害耐久性",
      "トンネル掘進機の切削ビット交換頻度に関する研究"
    );
    expect(related.score).toBeGreaterThan(unrelated.score);
    expect(related.matchedTerms.length).toBeGreaterThan(0);
  });

  it("returns zero for completely different documents", () => {
    const result = similarityScore("abc def ghi", "xyz qrs tuv");
    expect(result.score).toBe(0);
    expect(result.matchedTerms).toEqual([]);
  });

  it("tokenizes Japanese text into bigrams", () => {
    const tokens = tokenizeForSimilarity("低炭素コンクリート");
    expect(tokens.has("低炭")).toBe(true);
    expect(tokens.has("コン")).toBe(true);
  });

  it("adds bonus for shared applicants and classification codes", () => {
    const textA = "コンクリート組成物";
    const textB = "コンクリート混合物";
    const base = similarityScore(textA, textB);
    const withMeta = similarityScore(textA, textB, {
      applicantsA: ["建設技術研究所"],
      applicantsB: ["（株）建設技術研究所"],
      classificationsA: ["E04G 23/00"],
      classificationsB: ["E04G23/00"]
    });
    expect(withMeta.score).toBeGreaterThan(base.score);
    expect(withMeta.matchedTerms).toContain("E04G23/00");
  });
});
