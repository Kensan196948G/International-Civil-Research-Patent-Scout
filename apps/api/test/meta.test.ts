import { describe, expect, it } from "vitest";
import { clampMeta, normalizeContentHash } from "../src/repositories.js";

describe("clampMeta", () => {
  it("truncates values longer than the column limit", () => {
    expect(clampMeta("a".repeat(300), 255)).toHaveLength(255);
    expect(clampMeta("a".repeat(300), 50)).toHaveLength(50);
  });

  it("keeps short values and nulls as-is", () => {
    expect(clampMeta("short", 255)).toBe("short");
    expect(clampMeta(null, 255)).toBeNull();
    expect(clampMeta(undefined, 255)).toBeNull();
  });
});

describe("normalizeContentHash", () => {
  it("keeps short keys unchanged for compatibility with existing rows", async () => {
    expect(await normalizeContentHash("10.5555/icrps-demo-0001")).toBe("10.5555/icrps-demo-0001");
    expect(await normalizeContentHash(null)).toBeNull();
    expect(await normalizeContentHash(undefined)).toBeNull();
  });

  it("hashes long keys (over varchar(128)) to a deterministic 64-char hex", async () => {
    const long = `https://example.com/long/${"x".repeat(200)}`;
    const hash = await normalizeContentHash(long);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await normalizeContentHash(long)).toBe(hash);
  });
});
