import type { SearchConnectorResult, SearchParams, SourceType } from "@icrps/contracts";
import type { WorkerEnv } from "./env.js";
import { normalizeUrl } from "./scoring.js";

export interface ConnectorFailure {
  name: string;
  error: string;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function fetchJson(url: string, env: WorkerEnv, headers: Record<string, string> = {}, retries = 2): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(fetch(url, { headers, signal: AbortSignal.timeout(8000) }), 9000);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}

async function fetchText(url: string, retries = 1): Promise<string> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(
        fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; CivilResearchPatentScout/0.1; research@example.local)",
            "Accept-Language": "ja,en"
          },
          signal: AbortSignal.timeout(8000)
        }),
        9000
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}

function cleanTitle(value: unknown): string {
  const s = typeof value === "string" ? value : "";
  return s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 500);
}

function yearToQuery(params: SearchParams): string {
  const filters: string[] = [];
  if (params.yearFrom) filters.push(`from-pub-date:${params.yearFrom}-01-01`);
  if (params.yearTo) filters.push(`until-pub-date:${params.yearTo}-12-31`);
  return filters.join(",");
}

export async function searchCrossref(params: SearchParams, env: WorkerEnv): Promise<SearchConnectorResult[]> {
  const base = env.CROSSREF_API_URL.replace(/\/$/, "");
  const filters = yearToQuery(params);
  const url = `${base}/works?query=${encodeURIComponent(params.query)}&rows=${Math.min(params.maxResults ?? 20, 50)}&select=DOI,title,abstract,author,issued,publisher,type,URL${
    filters ? `&filter=${encodeURIComponent(filters)}` : ""
  }`;
  const data = (await fetchJson(url, env, { "User-Agent": "CivilResearchPatentScout/0.1 (mailto:research@example.local)" })) as {
    message?: { items?: Array<Record<string, unknown>> };
  };
  const items = data.message?.items ?? [];
  return items.map((item): SearchConnectorResult => {
    const titleRaw = item.title;
    const title = cleanTitle(Array.isArray(titleRaw) ? (titleRaw[0] ?? "") : titleRaw);
    const issued = (item.issued as { "date-parts"?: Array<Array<number>> } | undefined)?.["date-parts"]?.[0]?.[0];
    const authors = Array.isArray(item.author)
      ? item.author.map((a: Record<string, unknown>) => `${a.given ?? ""} ${a.family ?? ""}`.trim()).filter(Boolean)
      : [];
    return {
      sourceType: "paper",
      title,
      abstract: typeof item.abstract === "string" ? cleanTitle(item.abstract) : undefined,
      url: typeof item.URL === "string" ? item.URL : `https://doi.org/${String(item.DOI)}`,
      doi: item.DOI == null ? undefined : String(item.DOI),
      authors: authors.length ? authors : undefined,
      publicationDate: issued ? `${issued}-01-01` : undefined,
      sourceName: "Crossref"
    };
  });
}

export async function searchOpenAlex(params: SearchParams, env: WorkerEnv): Promise<SearchConnectorResult[]> {
  const base = env.OPENALEX_API_URL.replace(/\/$/, "");
  const filters: string[] = [];
  if (params.yearFrom) filters.push(`from_publication_date:${params.yearFrom}-01-01`);
  if (params.yearTo) filters.push(`to_publication_date:${params.yearTo}-12-31`);
  const url = `${base}/works?search=${encodeURIComponent(params.query)}&per-page=${Math.min(params.maxResults ?? 20, 50)}${
    filters.length ? `&filter=${encodeURIComponent(filters.join(","))}` : ""
  }&mailto=research@example.local`;
  const data = (await fetchJson(url, env, { "User-Agent": "CivilResearchPatentScout/0.1" })) as {
    results?: Array<Record<string, unknown>>;
  };
  const results = data.results ?? [];
  return results.map((item): SearchConnectorResult => {
    const authorships = Array.isArray(item.authorships) ? item.authorships : [];
    const authors = authorships
      .map((a: Record<string, unknown>) => (a.author as Record<string, unknown> | undefined)?.display_name)
      .filter((v): v is string => typeof v === "string");
    const inverted = item.abstract_inverted_index;
    const abstract = typeof inverted === "object" && inverted !== null
      ? reconstructAbstract(inverted as Record<string, number[]>)
      : undefined;
    return {
      sourceType: "paper",
      title: cleanTitle(item.title),
      abstract,
      url: typeof item.doi === "string" ? item.doi : undefined,
      doi: typeof item.doi === "string" ? item.doi.replace("https://doi.org/", "") : undefined,
      authors: authors.length ? authors : undefined,
      publicationDate: typeof item.publication_date === "string" ? item.publication_date : undefined,
      sourceName: "OpenAlex",
      externalId: typeof item.id === "string" ? item.id : undefined
    };
  });
}

function reconstructAbstract(inverted: Record<string, number[]>): string {
  const positions = new Map<number, string>();
  for (const [word, indexes] of Object.entries(inverted)) {
    for (const i of indexes) positions.set(i, word);
  }
  return [...positions.keys()]
    .sort((a, b) => a - b)
    .map((i) => positions.get(i) ?? "")
    .join(" ")
    .slice(0, 2000);
}

export async function searchGooglePatents(params: SearchParams): Promise<SearchConnectorResult[]> {
  const url = `https://patents.google.com/?q=${encodeURIComponent(params.query)}&num=${Math.min(params.maxResults ?? 20, 50)}${
    params.countries?.length ? `&country=${encodeURIComponent(params.countries.join(","))}` : ""
  }`;
  const html = await fetchText(url);
  const results: SearchConnectorResult[] = [];
  const linkRe = /href="\/patent\/([A-Z]{2}\d+[A-Z0-9]*)\/([a-z]{2})[^"]*"[^>]*>([^<]+)<\/a>/g;
  let m: RegExpExecArray | null;
  while (results.length < (params.maxResults ?? 20)) {
    m = linkRe.exec(html);
    if (!m) break;
    const publicationNumber = m[1]!;
    const title = cleanTitle(m[3]);
    if (!title) continue;
    results.push({
      sourceType: "patent",
      title,
      publicationNumber,
      patentNumber: publicationNumber,
      url: `https://patents.google.com/patent/${publicationNumber}/ja`,
      country: publicationNumber.slice(0, 2),
      sourceName: "Google Patents",
      abstract: undefined
    });
  }
  if (results.length === 0) {
    // スニペットを含むフォールバックパース
    const itemRe = /<h3[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>[\s\S]{0,500}?<span class="result-snippet">([^<]+)<\/span>/g;
    while (results.length < (params.maxResults ?? 20)) {
      const match = itemRe.exec(html);
      if (!match) break;
      const m = match;
      const href = m[1]!;
      const pub = /\/patent\/([A-Z]{2}\d+[A-Z0-9]*)/.exec(href)?.[1];
      if (!pub) continue;
      const title = cleanTitle(m[2]);
      const snippet = cleanTitle(m[3]);
      results.push({
        sourceType: "patent",
        title,
        publicationNumber: pub,
        patentNumber: pub,
        url: `https://patents.google.com${href.startsWith("/") ? href : `/${href}`}`,
        country: pub.slice(0, 2),
        snippet,
        sourceName: "Google Patents"
      });
    }
  }
  return results;
}

export async function searchDuckDuckGo(params: SearchParams): Promise<SearchConnectorResult[]> {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(params.query)}`;
  const html = await fetchText(url);
  const results: SearchConnectorResult[] = [];
  const itemRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]{0,800}?<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
  while (results.length < (params.maxResults ?? 20)) {
    const match = itemRe.exec(html);
    if (!match) break;
    const m = match;
    const rawUrl = m[1]!.replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, "");
    const decoded = /^https?:\/\//.test(rawUrl) ? rawUrl : decodeURIComponent(rawUrl);
    const title = cleanTitle(m[2]);
    const snippet = cleanTitle(m[3]);
    results.push({
      sourceType: "web",
      title,
      snippet,
      url: normalizeUrl(decoded),
      sourceName: "DuckDuckGo"
    });
  }
  return results;
}

export async function searchSerpApi(params: SearchParams, env: WorkerEnv): Promise<SearchConnectorResult[]> {
  if (!env.SERP_API_KEY) return [];
  const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(params.query)}&num=${Math.min(
    params.maxResults ?? 20,
    50
  )}&api_key=${encodeURIComponent(env.SERP_API_KEY)}`;
  const data = (await fetchJson(url, env)) as { organic_results?: Array<Record<string, unknown>> };
  return (data.organic_results ?? []).map((item): SearchConnectorResult => ({
    sourceType: "web",
    title: cleanTitle(item.title),
    snippet: typeof item.snippet === "string" ? item.snippet : undefined,
    url: typeof item.link === "string" ? item.link : undefined,
    sourceName: "Google (SerpAPI)"
  }));
}

export async function runConnectors(
  params: SearchParams,
  env: WorkerEnv
): Promise<{ results: SearchConnectorResult[]; failures: ConnectorFailure[] }> {
  const sourceTypes: SourceType[] = params.sourceTypes?.length ? params.sourceTypes : ["web", "paper", "patent"];
  const tasks: Array<{ name: string; run: () => Promise<SearchConnectorResult[]> }> = [];
  if (sourceTypes.includes("paper")) {
    tasks.push({ name: "Crossref", run: () => searchCrossref(params, env) });
    tasks.push({ name: "OpenAlex", run: () => searchOpenAlex(params, env) });
  }
  if (sourceTypes.includes("patent")) {
    tasks.push({ name: "Google Patents", run: () => searchGooglePatents(params) });
  }
  if (sourceTypes.includes("web")) {
    tasks.push(
      env.SERP_API_KEY
        ? { name: "SerpAPI", run: () => searchSerpApi(params, env) }
        : { name: "DuckDuckGo", run: () => searchDuckDuckGo(params) }
    );
  }
  const settled = await Promise.allSettled(tasks.map((t) => t.run()));
  const results: SearchConnectorResult[] = [];
  const failures: ConnectorFailure[] = [];
  settled.forEach((s, i) => {
    const task = tasks[i]!;
    if (s.status === "fulfilled") {
      results.push(...s.value);
    } else {
      failures.push({ name: task.name, error: s.reason instanceof Error ? s.reason.message : String(s.reason) });
    }
  });
  return { results, failures };
}
