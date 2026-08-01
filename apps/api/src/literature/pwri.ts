// 土木研究所 論文・刊行物検索（thesis.pwri.go.jp）の新着一覧を取得する
import type { SearchConnectorResult } from "@icrps/contracts";
import { allMatches, cleanText, fetchHtml, twoDigitYearToFull } from "./parse.js";

const HOME_URL = "https://thesis.pwri.go.jp/";

export interface PwriRow {
  date: string;
  title: string;
  url: string;
  authors: string;
  team: string;
  publication: string;
}

export function parsePwriNewArrivals(html: string): PwriRow[] {
  const rows = allMatches(html, /<tr>([\s\S]*?)<\/tr>/g);
  const out: PwriRow[] = [];
  for (const row of rows) {
    const dateMatch = /<td[^>]*>\s*([0-9]{2})-([0-9]{2})-([0-9]{2})\s*<\/td>/.exec(row);
    const linkMatch = /<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/.exec(row);
    if (!dateMatch || !linkMatch) continue;
    const cells = allMatches(row, /<td[^>]*>([\s\S]*?)<\/td>/g).map((c) => cleanText(c, 200));
    if (cells.length < 5) continue;
    const yy = Number(dateMatch[1]);
    const mm = dateMatch[2];
    const dd = dateMatch[3];
    if (!Number.isInteger(yy) || !mm || !dd) continue;
    out.push({
      date: `${twoDigitYearToFull(yy)}-${mm}-${dd}`,
      title: cleanText(linkMatch[2], 500),
      url: cleanText(linkMatch[1], 300).replace(/^http:\/\//, "https://"),
      authors: cells[2] ?? "",
      team: cells[3] ?? "",
      publication: cells[4] ?? ""
    });
  }
  return out;
}

export async function collectPwri(): Promise<SearchConnectorResult[]> {
  const html = await fetchHtml(HOME_URL, { timeoutMs: 25000, retries: 3 });
  const rows = parsePwriNewArrivals(html);
  const seen = new Set<string>();
  return rows.flatMap((row): SearchConnectorResult[] => {
    if (!row.url || !row.title || seen.has(row.url)) return [];
    seen.add(row.url);
    const authors = row.authors
      .split(/[／、,，/]/)
      .map((a) => a.trim())
      .filter(Boolean);
    return [
      {
        sourceType: "paper",
        title: row.title,
        url: row.url,
        authors: authors.length ? authors : undefined,
        publicationDate: row.date,
        sourceName: row.publication || "土木研究所 論文・刊行物検索",
        snippet: row.team ? `担当: ${row.team}` : undefined
      }
    ];
  });
}
