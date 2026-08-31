import { describe, expect, it } from "vitest";
import type { Db } from "../src/db";
import { estimateCost, extractLlmUsage, recordLlmUsage } from "../src/usage";

describe("estimateCost", () => {
  it("estimates cost from token counts", () => {
    const cost = estimateCost("openai", "gpt-4o-mini", 1_000_000, 500_000);
    expect(cost).toBeCloseTo(0.15 + 0.3, 6);
  });

  it("uses default rate for unknown models", () => {
    expect(estimateCost("openai", "unknown-model", 0, 1_000_000)).toBeCloseTo(3, 6);
  });
});

describe("extractLlmUsage", () => {
  it("parses OpenAI-style usage", () => {
    expect(extractLlmUsage({ usage: { prompt_tokens: 10, completion_tokens: 5 } }, "openai")).toEqual({
      inputTokens: 10,
      outputTokens: 5
    });
  });

  it("parses Anthropic-style usage", () => {
    expect(extractLlmUsage({ usage: { input_tokens: 7, output_tokens: 3 } }, "anthropic")).toEqual({
      inputTokens: 7,
      outputTokens: 3
    });
  });

  it("returns zeros when usage is missing", () => {
    expect(extractLlmUsage({}, "openai")).toEqual({ inputTokens: 0, outputTokens: 0 });
  });
});

describe("recordLlmUsage", () => {
  it("skips zero-token records", async () => {
    let called = false;
    const db: Db = async () => {
      called = true;
      return [];
    };
    await recordLlmUsage(db, {
      action: "chat.answer",
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 0,
      outputTokens: 0
    });
    expect(called).toBe(false);
  });

  it("inserts usage rows with cost estimate", async () => {
    let query = "";
    let params: unknown[] = [];
    const db: Db = async (q, p = []) => {
      query = q;
      params = p;
      return [];
    };
    await recordLlmUsage(db, {
      action: "chat.answer",
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 1000,
      outputTokens: 500
    });
    expect(query).toContain("INSERT INTO llm_usage");
    expect(params[0]).toBeNull();
    expect(params[4]).toBe(1000);
    expect(params[5]).toBe(500);
    expect(Number(params[6])).toBeGreaterThan(0);
    expect(params[7]).toBe(0);
  });

  it("records execution time when provided", async () => {
    let params: unknown[] = [];
    const db: Db = async (_q, p = []) => {
      params = p;
      return [];
    };
    await recordLlmUsage(db, {
      action: "chat.answer",
      provider: "openai",
      model: "gpt-4o-mini",
      inputTokens: 100,
      outputTokens: 50,
      durationMs: 1234
    });
    expect(params[7]).toBe(1234);
  });
});
