// ITC Digital Library（itc.scix.net）の年別一覧と論文詳細ページからメタデータを取得する
import type { SearchConnectorResult } from "@icrps/contracts";
import { allMatches, cleanText, fetchHtml, firstMatch, sleep } from "./parse.js";

const BASE_URL = "https://itc.scix.net";
const LOOKBACK_YEARS = 1;
const DETAIL_DELAY_MS = 500;
const MAX_DETAIL_FETCHES = 100;

export interface ItcDetail {
  title: string;
  authors: string;
  summary: string;
  year: string;
  series: string;
  keywords: string;
  pdfUrl: string;
}

export function parseItcYearPage(html: string): string[] {
  return [...new Set(allMatches(html, /href="\/paper\/([^"]+)"/g))];
}

export function parseItcYears(html: string): string[] {
  return [...new Set(allMatches(html, /href="\/papers\/year\/([0-9]{4})"/g))].sort();
}

function detailCell(html: string, label: string): string | null {
  return firstMatch(
    html,
    new RegExp(`<td class="table-dark text-right"[^>]*>${label}<\\/td>\\s*<td[^>]*>([\\s\\S]*?)<\\/td>`)
  );
}

export function parseItcDetail(html: string): ItcDetail {
  return {
    title: cleanText(detailCell(html, "Paper title:"), 500),
    authors: cleanText(detailCell(html, "Authors:"), 500),
    summary: cleanText(detailCell(html, "Summary:"), 3000),
    year: cleanText(detailCell(html, "Year of publication:"), 20),
    series: cleanText(detailCell(html, "Series:"), 200),
    keywords: cleanText(detailCell(html, "Keywords:"), 500),
    pdfUrl: firstMatch(html, /<a href="(\/pdfs\/[^"]+)"/) ?? ""
  };
}

export async function collectItc(options: {
  fetchKnown?: (urls: string[]) => Promise<Set<string>>;
  maxDetailFetches?: number;
} = {}): Promise<SearchConnectorResult[]> {
  const now = new Date();
  const year = now.getFullYear();
  let years: number[];
  try {
    const yearList = parseItcYears(await fetchHtml(`${BASE_URL}/years`, { timeoutMs: 20000, retries: 2 }));
    years = yearList.length ? yearList.slice(-(LOOKBACK_YEARS + 1)).map(Number) : [year - 1, year - 2];
  } catch {
    years = [year - 1, year - 2];
  }
  const ids = new Set<string>();

  for (const y of years) {
    const html = await fetchHtml(`${BASE_URL}/papers/year/${y}`, { timeoutMs: 30000, retries: 3 });
    for (const id of parseItcYearPage(html)) ids.add(id);
    await sleep(400);
  }

  const results: SearchConnectorResult[] = [];
  const urls = [...ids].map((id) => `${BASE_URL}/paper/${id}`);
  const known = options.fetchKnown ? await options.fetchKnown(urls) : new Set<string>();
  let detailFetches = 0;
  for (const id of ids) {
    const url = `${BASE_URL}/paper/${id}`;
    if (known.has(url)) continue;
    if (detailFetches >= (options.maxDetailFetches ?? MAX_DETAIL_FETCHES)) break;
    const html = await fetchHtml(url, { timeoutMs: 20000, retries: 2 });
    detailFetches += 1;
    const detail = parseItcDetail(html);
    if (!detail.title) continue;
    const authors = detail.authors
      .split(/[、,，;；]/)
      .map((a) => a.trim())
      .filter(Boolean);
    results.push({
      sourceType: "paper",
      title: detail.title,
      abstract: detail.summary || undefined,
      url,
      authors: authors.length ? authors : undefined,
      publicationDate: detail.year ? `${detail.year}-01-01` : undefined,
      sourceName: detail.series ? `ITC Digital Library（${detail.series}）` : "ITC Digital Library",
      snippet: detail.keywords ? `キーワード: ${detail.keywords}` : undefined,
      externalId: id
    });
    await sleep(DETAIL_DELAY_MS);
  }
  return results;
}
