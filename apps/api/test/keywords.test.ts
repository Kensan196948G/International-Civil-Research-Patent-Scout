import { describe, expect, it } from "vitest";
import { fallbackExpansion } from "../src/keywords";

describe("fallbackExpansion", () => {
  it("expands known civil terms to English", () => {
    const result = fallbackExpansion("低炭素コンクリート", "bilingual");
    expect(result.translatedQueries).toContain("low carbon");
    expect(result.translatedQueries).toContain("concrete");
  });

  it("keeps unknown query as-is", () => {
    const result = fallbackExpansion("量子ドット道路標識", "ja");
    expect(result.originalQuery).toBe("量子ドット道路標識");
    expect(result.translatedQueries[0]).toBe("量子ドット道路標識");
  });
});
