import type { SearchConnectorResult, SearchParams, SourceType } from "@icrps/contracts";
import { normalizeClassifications } from "./classification.js";
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

export async function fetchJson(
  url: string,
  env: WorkerEnv,
  headers: Record<string, string> = {},
  retries = 2,
  init: { method?: string; body?: string } = {}
): Promise<unknown> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await withTimeout(
        fetch(url, { ...init, headers, signal: AbortSignal.timeout(8000) }),
        9000
      );
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

// ---- Espacenet OPS ----

function opsValue(node: unknown): string | undefined {
  if (typeof node === "string") return node;
  if (node && typeof node === "object") {
    const value = (node as { $?: unknown }).$;
    if (typeof value === "string") return value;
  }
  return undefined;
}

function deepGet(obj: unknown, keys: string[]): unknown {
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === "object" && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return [value];
  return [];
}

function pickLang(items: unknown[], lang: string): string | undefined {
  for (const item of items) {
    const node = item as Record<string, unknown>;
    if (node["@lang"] === lang) {
      const text = opsValue(item);
      if (text) return text;
    }
  }
  return items.map(opsValue).find((v): v is string => !!v);
}

function extractEspacenetDocumentId(biblio: Record<string, unknown>): {
  country?: string;
  docNumber?: string;
  kind?: string;
  date?: string;
} {
  const ref = deepGet(biblio, ["publication-reference", "document-id"]);
  const docs = asArray(ref);
  const docdb = docs.find((d) => (d as Record<string, unknown>)["@document-id-type"] === "docdb");
  const target = (docdb ?? docs[0]) as Record<string, unknown> | undefined;
  if (!target) return {};
  return {
    country: opsValue(target.country),
    docNumber: opsValue(target["doc-number"]),
    kind: opsValue(target.kind),
    date: opsValue(target.date)
  };
}

function extractParties(biblio: Record<string, unknown>): {
  applicants: string[];
  inventors: string[];
} {
  const names = (section: unknown): string[] =>
    asArray(section)
      .map((entry) => {
        const record = entry as Record<string, unknown>;
        const nameNode = record["applicant-name"] ?? record["inventor-name"];
        return opsValue(deepGet(nameNode, ["name"])) ?? opsValue(deepGet(nameNode, ["name", "$"]));
      })
      .filter((v): v is string => !!v);
  return {
    applicants: names(deepGet(biblio, ["parties", "applicants", "applicant"])),
    inventors: names(deepGet(biblio, ["parties", "inventors", "inventor"]))
  };
}

/** OPS 検索レスポンス（JSON 化された bibliographic-data）から特許メタデータへ変換する */
export function mapEspacenetSearchResult(data: unknown): SearchConnectorResult[] {
  const documents = asArray(deepGet(data, ["ops:world-patent-data", "ops:search-result", "ops:documents", "ops:document"]));
  return documents.flatMap((doc): SearchConnectorResult[] => {
    const biblio = (deepGet(doc, ["ops:bibliographic-data"]) ??
      deepGet(doc, ["bibliographic-data"]) ??
      doc) as Record<string, unknown>;
    const id = extractEspacenetDocumentId(biblio);
    if (!id.country || !id.docNumber) return [];
    const patentNumber = `${id.country}${id.docNumber}${id.kind ?? ""}`;
    const title = pickLang(asArray(deepGet(biblio, ["titles", "title"])), "ja");
    const abstract = pickLang(asArray(deepGet(biblio, ["abstracts", "abstract"])), "ja");
    const parties = extractParties(biblio);
    const classifications = normalizeClassifications(
      asArray(deepGet(biblio, ["classifications-ipcr", "classification-ipcr"]))
        .map((entry) => opsValue(deepGet(entry, ["text"])))
        .filter((v): v is string => !!v)
        .slice(0, 20)
    );
    return [
      {
        sourceType: "patent",
        title: title ?? `${patentNumber}（タイトル未取得）`,
        originalTitle: pickLang(asArray(deepGet(biblio, ["titles", "title"])), "en"),
        abstract: abstract ?? undefined,
        url: `https://worldwide.espacenet.com/patent/search?q=pn%3D${encodeURIComponent(patentNumber)}`,
        patentNumber,
        publicationNumber: patentNumber,
        classifications: classifications ?? undefined,
        inventors: parties.inventors.length ? parties.inventors : undefined,
        applicants: parties.applicants.length ? parties.applicants : undefined,
        country: id.country,
        publicationDate: id.date ? id.date.slice(0, 10) : undefined,
        sourceName: "Espacenet (OPS)"
      }
    ];
  });
}

/** OPS 検索クエリ組み立て（テキスト＋公開日＋国） */
export function buildEspacenetQuery(params: SearchParams): string {
  const parts: string[] = [];
  if (params.yearFrom || params.yearTo) {
    const from = params.yearFrom ? `${params.yearFrom}-01-01` : "1900-01-01";
    const to = params.yearTo ? `${params.yearTo}-12-31` : "2100-12-31";
    parts.push(`pd within "${from} ${to}"`);
  }
  const countries = params.countries?.length ? params.countries.slice(0, 10) : [];
  if (countries.length === 1) parts.push(`pn = ${countries[0]}`);
  else if (countries.length > 1) parts.push(`(${countries.map((c) => `pn = ${c}`).join(" OR ")})`);
  const filter = parts.length ? ` AND ${parts.join(" AND ")}` : "";
  return `txt = "${params.query.replace(/"/g, "")}"${filter}`;
}

export async function getEspacenetToken(env: WorkerEnv): Promise<string> {
  const key = env.ESPACENET_OPS_KEY;
  const secret = env.ESPACENET_OPS_SECRET;
  if (!key || !secret) throw new Error("ESPACENET_OPS_KEY / ESPACENET_OPS_SECRET が未設定です");
  const base = env.ESPACENET_OPS_URL.replace(/\/+$/, "");
  const credentials = btoa(`${key}:${secret}`);
  const response = await fetch(`${base}/auth/accesstoken`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials",
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Espacenet OPS auth failed HTTP ${response.status}`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Espacenet OPS auth response has no access_token");
  return data.access_token;
}

export async function searchEspacenet(params: SearchParams, env: WorkerEnv): Promise<SearchConnectorResult[]> {
  if (!env.ESPACENET_OPS_KEY || !env.ESPACENET_OPS_SECRET) return [];
  const token = await getEspacenetToken(env);
  const base = env.ESPACENET_OPS_URL.replace(/\/+$/, "");
  const n = Math.min(params.maxResults ?? 20, 50);
  const url = `${base}/rest-services/search?q=${encodeURIComponent(buildEspacenetQuery(params))}&Range=1-${n}`;
  const data = await fetchJson(url, env, {
    Authorization: `Bearer ${token}`,
    Accept: "application/json"
  });
  return mapEspacenetSearchResult(data);
}

// ---- SerpAPI Google Patents エンジン ----

export function mapSerpGooglePatentsResults(data: unknown): SearchConnectorResult[] {
  const organic = ((data as { organic_results?: Array<Record<string, unknown>> })?.organic_results ?? []).slice(0, 50);
  return organic.flatMap((item): SearchConnectorResult[] => {
    const title = cleanTitle(item.title);
    if (!title) return [];
    const number =
      (typeof item.publication_number === "string" ? item.publication_number : undefined) ??
      (typeof item.patent_id === "string" ? item.patent_id : undefined);
    const inventors =
      typeof item.inventor === "string"
        ? [item.inventor]
        : Array.isArray(item.inventor)
          ? item.inventor.map(String)
          : undefined;
    const applicants = typeof item.assignee === "string" ? [item.assignee] : undefined;
    const status = typeof item.patent_status === "string" ? item.patent_status : undefined;
    const snippet = typeof item.snippet === "string" ? item.snippet : undefined;
    return [
      {
        sourceType: "patent",
        title,
        snippet: status ? `[${status}] ${snippet ?? ""}`.trim() : snippet,
        url: typeof item.link === "string" ? item.link : undefined,
        patentNumber: number,
        publicationNumber: number,
        inventors: inventors?.length ? inventors : undefined,
        applicants: applicants?.length ? applicants : undefined,
        country: number ? number.slice(0, 2) : undefined,
        publicationDate: typeof item.publication_date === "string" ? item.publication_date.slice(0, 10) : undefined,
        sourceName: "Google Patents (SerpAPI)"
      }
    ];
  });
}

export async function searchGooglePatentsSerpApi(params: SearchParams, env: WorkerEnv): Promise<SearchConnectorResult[]> {
  if (!env.SERP_API_KEY) return [];
  const url = `https://serpapi.com/search.json?engine=google_patents&q=${encodeURIComponent(
    params.query
  )}&num=${Math.min(params.maxResults ?? 20, 50)}&api_key=${encodeURIComponent(env.SERP_API_KEY)}`;
  const data = await fetchJson(url, env);
  return mapSerpGooglePatentsResults(data);
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
    tasks.push(
      env.SERP_API_KEY
        ? { name: "Google Patents (SerpAPI)", run: () => searchGooglePatentsSerpApi(params, env) }
        : { name: "Google Patents", run: () => searchGooglePatents(params) }
    );
    if (env.ESPACENET_OPS_KEY && env.ESPACENET_OPS_SECRET) {
      tasks.push({ name: "Espacenet OPS", run: () => searchEspacenet(params, env) });
    }
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
