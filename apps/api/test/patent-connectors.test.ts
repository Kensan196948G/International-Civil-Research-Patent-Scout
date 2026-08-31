import { afterEach, describe, expect, it, vi } from "vitest";
import type { WorkerEnv } from "../src/env";
import {
  buildEspacenetQuery,
  getEspacenetToken,
  mapEspacenetSearchResult,
  mapSerpGooglePatentsResults,
  searchEspacenet,
  searchGooglePatents,
  searchGooglePatentsSerpApi
} from "../src/connectors";

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

const OPS_SEARCH = {
  "ops:world-patent-data": {
    "ops:search-result": {
      "@total-result-count": "1",
      "ops:documents": {
        "ops:document": [
          {
            "ops:bibliographic-data": {
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
              titles: {
                title: [
                  { $: "低炭素コンクリート", "@lang": "ja" },
                  { $: "Low carbon concrete", "@lang": "en" }
                ]
              },
              abstracts: {
                abstract: [{ $: "海洋環境向けの低炭素コンクリート", "@lang": "ja" }]
              },
              parties: {
                applicants: {
                  applicant: [{ "applicant-name": { name: { $: "建設技術研究所" } } }]
                },
                inventors: {
                  inventor: [{ "inventor-name": { name: { $: "山田 太郎" } } }]
                }
              }
            }
          }
        ]
      }
    }
  }
};

// Google Patents 検索結果ページの HTML スナップショット（2026-08 時点の構造）
const GOOGLE_PATENTS_LIST_HTML = `<!doctype html>
<html lang="ja"><head><title>低炭素コンクリート - Google Patents</title></head>
<body>
<search-results>
  <result>
    <a href="/patent/US11854321B2/en" aria-label="Low carbon concrete composition">
      Low carbon concrete composition
    </a>
    <a href="/patent/JP2024123456A/ja" aria-label="低炭素コンクリート">
      低炭素コンクリート
    </a>
    <a href="/patent/EP4123456A1/en" aria-label="Low-carbon binder">
      Low-carbon binder
    </a>
    <a href="/patent/XX-not-a-number/en" aria-label="Invalid number">Invalid number</a>
  </result>
</search-results>
</body></html>`;

const GOOGLE_PATENTS_SNIPPET_HTML = `<!doctype html>
<html><body>
<h3 class="result-title">
  <a href="/patent/JP2024000001A">高耐久コンクリートの製造方法</a>
</h3>
<span class="result-snippet">海洋環境の飛沫帯で使用する高耐久コンクリート。</span>
<h3 class="result-title">
  <a href="/patent/CN1187654321A">Low-carbon cement</a>
</h3>
<span class="result-snippet">slag based binder for marine structures</span>
</body></html>`;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("buildEspacenetQuery", () => {
  it("builds text with date range and country filters", () => {
    const q = buildEspacenetQuery({
      query: '低炭素"コンクリート',
      yearFrom: 2015,
      yearTo: 2026,
      countries: ["JP", "US"]
    });
    expect(q).toContain('txt = "低炭素コンクリート"');
    expect(q).toContain('pd within "2015-01-01 2026-12-31"');
    expect(q).toContain("(pn = JP OR pn = US)");
  });
});

describe("mapEspacenetSearchResult", () => {
  it("maps bibliographic data to a patent result", () => {
    const results = mapEspacenetSearchResult(OPS_SEARCH);
    expect(results).toHaveLength(1);
    const r = results[0]!;
    expect(r.sourceType).toBe("patent");
    expect(r.title).toBe("低炭素コンクリート");
    expect(r.originalTitle).toBe("Low carbon concrete");
    expect(r.patentNumber).toBe("JP2020123456A");
    expect(r.applicants).toEqual(["建設技術研究所"]);
    expect(r.inventors).toEqual(["山田 太郎"]);
    expect(r.publicationDate).toBe("2020-06-01");
    expect(r.url).toContain("pn%3DJP2020123456A");
  });
});

describe("getEspacenetToken", () => {
  it("requests a client credentials token with basic auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ access_token: "token-123" }), { status: 200 })
    );
    vi.stubGlobal("fetch", fetchMock);
    const token = await getEspacenetToken({ ...ENV, ESPACENET_OPS_KEY: "consumer-key", ESPACENET_OPS_SECRET: "consumer-secret" });
    expect(token).toBe("token-123");
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://ops.epo.org/3.2/auth/accesstoken");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization ?? "").toMatch(/^Basic /);
    expect(init.body).toBe("grant_type=client_credentials");
  });
});

describe("searchEspacenet", () => {
  it("returns empty when credentials are not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const results = await searchEspacenet({ query: "低炭素コンクリート" }, ENV);
    expect(results).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fetches token then search results", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "tok" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(OPS_SEARCH), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const results = await searchEspacenet(
      { query: "低炭素コンクリート", maxResults: 10 },
      { ...ENV, ESPACENET_OPS_KEY: "key", ESPACENET_OPS_SECRET: "secret" }
    );
    expect(results).toHaveLength(1);
    expect(results[0]?.sourceName).toBe("Espacenet (OPS)");
    const searchUrl = String(fetchMock.mock.calls[1]?.[0]);
    expect(searchUrl).toContain("/rest-services/search?q=");
    expect(searchUrl).toContain("Range=1-10");
  });
});

describe("searchGooglePatents", () => {
  it("parses the current result-list HTML snapshot", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(GOOGLE_PATENTS_LIST_HTML, { status: 200 }))
    );
    const results = await searchGooglePatents({ query: "low carbon concrete", maxResults: 10 });
    expect(results).toHaveLength(3);
    expect(results[0]).toMatchObject({
      sourceType: "patent",
      publicationNumber: "US11854321B2",
      patentNumber: "US11854321B2",
      country: "US",
      title: "Low carbon concrete composition",
      url: "https://patents.google.com/patent/US11854321B2/ja",
      sourceName: "Google Patents"
    });
    expect(results[1]).toMatchObject({
      publicationNumber: "JP2024123456A",
      country: "JP",
      title: "低炭素コンクリート"
    });
    // 不正な番号（XX...）はスキップされる
    expect(results[2]).toMatchObject({ publicationNumber: "EP4123456A1", title: "Low-carbon binder" });
  });

  it("falls back to snippet markup when anchor-list structure changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(GOOGLE_PATENTS_SNIPPET_HTML, { status: 200 }))
    );
    const results = await searchGooglePatents({ query: "高耐久コンクリート", maxResults: 10 });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      publicationNumber: "JP2024000001A",
      title: "高耐久コンクリートの製造方法",
      snippet: "海洋環境の飛沫帯で使用する高耐久コンクリート。"
    });
    expect(results[1]).toMatchObject({ publicationNumber: "CN1187654321A", snippet: "slag based binder for marine structures" });
  });

  it("returns empty array when no patent links are found", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("<html><body>no results</body></html>", { status: 200 })));
    const results = await searchGooglePatents({ query: "nonexistent query" });
    expect(results).toEqual([]);
  });

  it("propagates fetch failure so the pipeline records the patent source as failed", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(searchGooglePatents({ query: "low carbon" })).rejects.toThrow("network down");
  });
});

describe("mapSerpGooglePatentsResults", () => {
  it("maps organic results with patent metadata", () => {
    const results = mapSerpGooglePatentsResults({
      organic_results: [
        {
          title: "Low carbon concrete composition",
          link: "https://patents.google.com/patent/US2020123456A1/en",
          publication_number: "US2020123456A1",
          assignee: "Civil Construction Co.",
          inventor: ["John Smith", "Jane Doe"],
          publication_date: "2024-03-15",
          patent_status: "Granted",
          snippet: "A marine environment concrete."
        }
      ]
    });
    expect(results).toHaveLength(1);
    const r = results[0]!;
    expect(r.patentNumber).toBe("US2020123456A1");
    expect(r.country).toBe("US");
    expect(r.applicants).toEqual(["Civil Construction Co."]);
    expect(r.inventors).toEqual(["John Smith", "Jane Doe"]);
    expect(r.publicationDate).toBe("2024-03-15");
    expect(r.snippet).toContain("[Granted]");
  });
});

describe("searchGooglePatentsSerpApi", () => {
  it("returns empty when SERP_API_KEY is not configured", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await searchGooglePatentsSerpApi({ query: "low carbon concrete" }, ENV)).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("queries the google_patents engine", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          organic_results: [
            {
              title: "Concrete mix",
              link: "https://patents.google.com/patent/JP2024000001A/ja",
              publication_number: "JP2024000001A"
            }
          ]
        }),
        { status: 200 }
      )
    );
    vi.stubGlobal("fetch", fetchMock);
    const results = await searchGooglePatentsSerpApi(
      { query: "コンクリート", maxResults: 5 },
      { ...ENV, SERP_API_KEY: "serp-key" }
    );
    expect(results).toHaveLength(1);
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain("engine=google_patents");
  });
});
