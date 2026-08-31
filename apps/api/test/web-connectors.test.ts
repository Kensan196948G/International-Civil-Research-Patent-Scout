import { afterEach, describe, expect, it, vi } from "vitest";
import type { WorkerEnv } from "../src/env";
import { searchDuckDuckGo, searchSerpApi } from "../src/connectors";

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

// DuckDuckGo HTML 検索結果のスナップショット（2026-08 時点の構造）
const DUCKDUCKGO_RESULT_HTML = `<!doctype html>
<html lang="ja"><body>
<div class="result results_links results_links_deep web-result">
  <h2 class="result__title">
    <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.test%2Fconcrete">
      低炭素コンクリートの実証研究
    </a>
  </h2>
  <a class="result__snippet" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.test%2Fconcrete">
    海洋環境の飛沫帯で使用する低炭素コンクリートの耐久性実証データ。
  </a>
</div>
<div class="result results_links results_links_deep web-result">
  <h2 class="result__title">
    <a class="result__a" href="https://example.org/paper2">
      Low-carbon binder systems
    </a>
  </h2>
  <a class="result__snippet" href="https://example.org/paper2">
    slag based binders for splash zone structures
  </a>
</div>
</body></html>`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("searchDuckDuckGo", () => {
  it("parses the current result HTML snapshot (uddg redirect decode included)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(DUCKDUCKGO_RESULT_HTML, { status: 200 })));
    const results = await searchDuckDuckGo({ query: "low carbon concrete", maxResults: 10 });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      sourceType: "web",
      title: "低炭素コンクリートの実証研究",
      snippet: "海洋環境の飛沫帯で使用する低炭素コンクリートの耐久性実証データ。",
      url: "https://example.test/concrete",
      sourceName: "DuckDuckGo"
    });
    expect(results[1]).toMatchObject({
      title: "Low-carbon binder systems",
      snippet: "slag based binders for splash zone structures",
      url: "https://example.org/paper2"
    });
  });

  it("returns empty array when result markup is absent", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html><body>no results</body></html>", { status: 200 })));
    const results = await searchDuckDuckGo({ query: "nonexistent" });
    expect(results).toEqual([]);
  });

  it("propagates fetch failure so the pipeline records the web source as failed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));
    await expect(searchDuckDuckGo({ query: "low carbon" })).rejects.toThrow("timeout");
  });
});

describe("searchSerpApi", () => {
  it("returns empty when SERP_API_KEY is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const results = await searchSerpApi({ query: "low carbon" }, ENV);
    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("maps Google organic results from SerpAPI", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            organic_results: [
              { title: "Concrete durability", link: "https://example.test", snippet: "marine splash zone" }
            ]
          }),
          { status: 200 }
        )
      )
    );
    const results = await searchSerpApi({ query: "concrete" }, { ...ENV, SERP_API_KEY: "key" });
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      sourceType: "web",
      title: "Concrete durability",
      url: "https://example.test",
      snippet: "marine splash zone",
      sourceName: "Google (SerpAPI)"
    });
  });
});
