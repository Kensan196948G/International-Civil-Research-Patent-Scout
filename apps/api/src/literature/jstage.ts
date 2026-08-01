// J-STAGE WebAPI（公式 Atom/OpenSearch API）から土木建設関連論文のメタデータを取得する
// マニュアル: https://www.jstage.jst.go.jp/static/files/ja/manual_api.pdf（Ver.2.0）
import type { SearchConnectorResult } from "@icrps/contracts";
import { allMatches, cleanText, fetchHtml, firstMatch, firstMatchFlexible, sleep } from "./parse.js";

const API_BASE = "https://api.jstage.jst.go.jp/searchapi/do";
const MATERIALS = ["土木", "建設", "構造"] as const;
const PAGE_SIZE = 1000;
const MAX_PAGES = 3;
const LOOKBACK_YEARS = 1;

export interface JStageEntry {
  titleJa: string;
  titleEn: string;
  linkEn: string;
  authors: string[];
  materialJa: string;
  doi: string;
  pubyear: string;
  updated: string;
}

export function parseJStageEntries(xml: string): JStageEntry[] {
  return allMatches(xml, /<entry>([\s\S]*?)<\/entry>/g).map((entry): JStageEntry => {
    const titleJa = cleanText(
      firstMatch(entry, /<article_title>[\s\S]*?<ja>\s*<!\[CDATA\[([\s\S]*?)\]\]>/),
      500
    );
    const titleEn = cleanText(
      firstMatch(entry, /<article_title>[\s\S]*?<en>\s*<!\[CDATA\[([\s\S]*?)\]\]>/),
      500
    );
    const linkEn = cleanText(
      firstMatchFlexible(entry, /<article_link>\s*<en>\s*(?:<!\[CDATA\[([\s\S]*?)\]\]>|([^<]*?))\s*<\/en>/),
      500
    );
    const authors = allMatches(
      entry,
      /<author>[\s\S]*?<ja>[\s\S]*?<name>\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*<\/name>/g
    ).map((name) => cleanText(name, 200));
    const materialJa = cleanText(
      firstMatch(entry, /<material_title>[\s\S]*?<ja>\s*<!\[CDATA\[([\s\S]*?)\]\]>/),
      200
    );
    const doi = firstMatch(entry, /<prism:doi>([^<]*)<\/prism:doi>/);
    const pubyear = firstMatch(entry, /<pubyear>([^<]*)<\/pubyear>/);
    const updated = firstMatch(entry, /<updated>([^<]*)<\/updated>/);
    return {
      titleJa: titleJa || titleEn,
      titleEn,
      linkEn,
      authors,
      materialJa,
      doi: doi ? cleanText(doi, 200) : "",
      pubyear: pubyear ? cleanText(pubyear, 20) : "",
      updated: updated ? cleanText(updated, 40) : ""
    };
  });
}

export async function collectJStage(): Promise<SearchConnectorResult[]> {
  const now = new Date();
  const yearTo = now.getFullYear();
  const yearFrom = yearTo - LOOKBACK_YEARS;
  const results: SearchConnectorResult[] = [];
  const seen = new Set<string>();

  for (const material of MATERIALS) {
    let start = 1;
    for (let page = 0; page < MAX_PAGES; page++) {
      const url =
        `${API_BASE}?service=3&material=${encodeURIComponent(material)}` +
        `&pubyearfrom=${yearFrom}&pubyearto=${yearTo}&start=${start}&count=${PAGE_SIZE}&sortflg=1&lang=ja`;
      const xml = await fetchHtml(url, { timeoutMs: 30000, retries: 3 });
      const entries = parseJStageEntries(xml);
      if (entries.length === 0) break;

      for (const entry of entries) {
        if (!entry.linkEn && !entry.doi) continue;
        const key = entry.doi || entry.linkEn;
        if (seen.has(key)) continue;
        seen.add(key);
        results.push({
          sourceType: "paper",
          title: entry.titleJa || "(タイトル不明)",
          originalTitle: entry.titleEn || undefined,
          url: entry.linkEn || undefined,
          doi: entry.doi || undefined,
          authors: entry.authors.length ? entry.authors : undefined,
          publicationDate: entry.pubyear ? `${entry.pubyear}-01-01` : undefined,
          sourceName: entry.materialJa || "J-STAGE"
        });
      }

      const total = Number(firstMatch(xml, /<opensearch:totalResults>([0-9]+)</) ?? "0");
      start += PAGE_SIZE;
      if (entries.length < PAGE_SIZE || start > total || start > PAGE_SIZE * MAX_PAGES) break;
      await sleep(600);
    }
    await sleep(600);
  }
  return results;
}
