import { describe, expect, it } from "vitest";
import { ipcSection, normalizeClassificationCode, normalizeClassifications } from "../src/classification";

describe("normalizeClassificationCode", () => {
  it("normalizes spacing and case", () => {
    expect(normalizeClassificationCode("e04g 23/00")).toBe("E04G23/00");
    expect(normalizeClassificationCode("E04G23/00")).toBe("E04G23/00");
    expect(normalizeClassificationCode(" B62D 65/02 ")).toBe("B62D65/02");
  });

  it("returns null for invalid codes", () => {
    expect(normalizeClassificationCode("X123")).toBeNull();
    expect(normalizeClassificationCode("")).toBeNull();
    expect(normalizeClassificationCode("E04G-23/00")).toBeNull();
  });
});

describe("normalizeClassifications", () => {
  it("deduplicates and filters invalid codes", () => {
    expect(normalizeClassifications(["e04g 23/00", "E04G23/00", "invalid", "B62D 65/02"])).toEqual([
      "E04G23/00",
      "B62D65/02"
    ]);
  });

  it("returns null for empty input", () => {
    expect(normalizeClassifications([])).toBeNull();
    expect(normalizeClassifications(null)).toBeNull();
  });
});

describe("ipcSection", () => {
  it("extracts the A-H section", () => {
    expect(ipcSection("E04G23/00")).toBe("E");
    expect(ipcSection("b62d 65/02")).toBe("B");
    expect(ipcSection("")).toBeNull();
  });
});
