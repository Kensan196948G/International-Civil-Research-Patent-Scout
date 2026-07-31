import type { SearchConnectorResult } from "@icrps/contracts";

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u3040-\u30ff\u4e00-\u9faf]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.search = "";
    return u.href.replace(/\/$/, "");
  } catch {
    return url.replace(/\/+$/, "");
  }
}

export function dedupeKey(result: SearchConnectorResult): string {
  if (result.doi) return `doi:${result.doi.toLowerCase()}`;
  if (result.patentNumber) return `patent:${result.patentNumber.toUpperCase()}`;
  if (result.url) return `url:${normalizeUrl(result.url)}`;
  return `title:${normalizeTitle(result.title)}`;
}

export function contentHash(result: SearchConnectorResult): string | null {
  const base = result.doi ?? result.patentNumber ?? result.url;
  if (!base) return null;
  const data = new TextEncoder().encode(base.toLowerCase());
  let hash = 0;
  for (const byte of data) {
    hash = (hash << 5) - hash + byte;
    hash |= 0;
  }
  return `sha1sim-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

const RELIABILITY: Record<string, number> = {
  paper: 0.9,
  patent: 0.9,
  pdf: 0.6,
  web: 0.5
};

export function sourceReliability(result: SearchConnectorResult): number {
  const base = RELIABILITY[result.sourceType] ?? 0.5;
  const name = result.sourceName?.toLowerCase() ?? "";
  if (/crossref|openalex|semantic scholar|uspto|wipo|espacenet|j-platpat|gov|go\.jp|ac\.jp|edu/.test(name)) {
    return Math.min(1, base + 0.25);
  }
  if (/blog|wordpress|hatena/.test(name)) return base - 0.15;
  return base;
}

export function freshnessScore(dateStr: string | undefined): number {
  if (!dateStr) return 0.5;
  const year = Number(dateStr.slice(0, 4));
  if (!Number.isFinite(year)) return 0.5;
  const age = new Date().getFullYear() - year;
  if (age <= 1) return 1;
  if (age <= 3) return 0.85;
  if (age <= 5) return 0.7;
  if (age <= 10) return 0.5;
  return 0.3;
}

export function keywordMatch(query: string, result: SearchConnectorResult): number {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 0;
  const haystack = `${result.title} ${result.originalTitle ?? ""} ${result.abstract ?? ""} ${result.snippet ?? ""}`.toLowerCase();
  const hits = words.filter((w) => haystack.includes(w)).length;
  return hits / words.length;
}

export function relevanceScore(query: string, result: SearchConnectorResult): number {
  const keyword = keywordMatch(query, result);
  const reliability = sourceReliability(result);
  const freshness = freshnessScore(result.publicationDate);
  const importance = result.sourceType === "patent" ? 0.6 : 0.5;
  const preference = 0.5;
  return Math.round(
    (keyword * 0.35 + reliability * 0.2 + freshness * 0.15 + importance * 0.15 + preference * 0.15) * 100
  );
}

export function dedupeAndScore(
  query: string,
  results: SearchConnectorResult[]
): Array<{ result: SearchConnectorResult; score: number; matchedKeywords: string[] }> {
  const seen = new Map<string, SearchConnectorResult>();
  for (const result of results) {
    const key = dedupeKey(result);
    if (!seen.has(key)) seen.set(key, result);
  }
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return [...seen.values()]
    .map((result) => {
      const haystack = `${result.title} ${result.abstract ?? ""} ${result.snippet ?? ""}`.toLowerCase();
      return {
        result,
        score: relevanceScore(query, result),
        matchedKeywords: words.filter((w) => haystack.includes(w))
      };
    })
    .sort((a, b) => b.score - a.score);
}
