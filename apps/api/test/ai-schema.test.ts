import { afterEach, describe, expect, it, vi } from "vitest";
import type { SourceDocument } from "@icrps/contracts";
import { callLlmJson, LlmOutputValidationError, summarizeDocument, validateJsonOutput } from "../src/ai";
import type { WorkerEnv } from "../src/env";

const ENV: WorkerEnv = {
  APP_ENV: "test",
  APP_URL: "http://localhost",
  DATABASE_URL: "postgres://x",
  JWT_SECRET: "test-secret",
  JWT_EXPIRES_IN: "12h",
  OPENAI_API_KEY: "test-key",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org",
  ESPACENET_OPS_URL: "https://ops.epo.org/3.2"
};

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claim: { type: "string" },
          sourceUrl: { type: "string" },
          quote: { type: "string" }
        },
        required: ["claim", "sourceUrl", "quote"]
      }
    }
  },
  required: ["summary"],
  additionalProperties: true
};

function chatResponse(content: string): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage: { prompt_tokens: 0, completion_tokens: 0 }
    }),
    { status: 200 }
  );
}

const doc: SourceDocument = {
  id: "d1",
  sourceType: "paper",
  title: "Example Paper",
  originalTitle: null,
  abstract: "Abstract text",
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

describe("validateJsonOutput", () => {
  it("accepts a valid summary object", () => {
    expect(() =>
      validateJsonOutput({ summary: "ok", keyPoints: ["a"], evidence: [{ claim: "c", sourceUrl: "u", quote: "q" }] }, SUMMARY_SCHEMA)
    ).not.toThrow();
  });

  it("rejects missing required keys", () => {
    expect(() => validateJsonOutput({ keyPoints: [] }, SUMMARY_SCHEMA)).toThrow(LlmOutputValidationError);
  });

  it("rejects wrong scalar types", () => {
    expect(() => validateJsonOutput({ summary: 123 }, SUMMARY_SCHEMA)).toThrow("must be a string");
  });

  it("rejects arrays with non-string items", () => {
    expect(() => validateJsonOutput({ summary: "ok", keyPoints: ["a", 1] }, SUMMARY_SCHEMA)).toThrow(
      "array of strings"
    );
  });

  it("rejects nested evidence missing required fields", () => {
    expect(() =>
      validateJsonOutput({ summary: "ok", evidence: [{ claim: "c" }] }, SUMMARY_SCHEMA)
    ).toThrow("missing required key");
  });
});

describe("callLlmJson retry", () => {
  it("retries once on schema validation failure and succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(chatResponse(JSON.stringify({ summary: 123 })))
      .mockResolvedValueOnce(chatResponse(JSON.stringify({ summary: "ok", keyPoints: ["a"] })));
    vi.stubGlobal("fetch", fetchMock);
    const result = await callLlmJson({ system: "s", user: "u" }, ENV, SUMMARY_SCHEMA);
    expect(result).toMatchObject({ summary: "ok", keyPoints: ["a"] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("throws after two invalid attempts", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(chatResponse(JSON.stringify({ summary: 123 })))
        .mockResolvedValueOnce(chatResponse(JSON.stringify({ summary: 123 })))
    );
    await expect(callLlmJson({ system: "s", user: "u" }, ENV, SUMMARY_SCHEMA)).rejects.toThrow(
      LlmOutputValidationError
    );
  });

  it("does not retry API errors", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("boom", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(callLlmJson({ system: "s", user: "u" }, ENV, SUMMARY_SCHEMA)).rejects.toThrow(
      "LLM API error 500"
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("summarizeDocument fallback", () => {
  it("returns the rule-based fallback when LLM output is invalid twice", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(chatResponse(JSON.stringify({ summary: 123 })))
        .mockResolvedValueOnce(chatResponse(JSON.stringify({ summary: 123 })))
    );
    const output = await summarizeDocument(doc, "standard", "ja", ENV);
    expect(output.modelName).toBe("rule-based-fallback");
    expect(output.promptVersion).toBe("v1-fallback");
    expect(output.summaryText).toContain("【要約】Example Paper");
  });
});
