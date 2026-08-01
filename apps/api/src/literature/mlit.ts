// 国土交通省 技術調査（mlit.go.jp/tec）の新着一覧ページから技術情報リンクを取得する
import type { SearchConnectorResult } from "@icrps/contracts";
import { cleanText, fetchHtml } from "./parse.js";

const BASE_URL = "https://www.mlit.go.jp";
const TEC_URL = `${BASE_URL}/tec/`;

export interface WebLink {
  title: string;
  url: string;
}

function isArticlePath(path: string): boolean {
  return /^\/(tec\/|report\/press\/kanbo08_)/.test(path) &&
    !/index\.html$|#|constplan|sosei|\.pdf$|\.css$/.test(path);
}

export function parseMlitTecLinks(html: string): WebLink[] {
  const out: WebLink[] = [];
  const seen = new Set<string>();
  for (const m of html.matchAll(/href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const raw = m[1]!.trim();
    const title = cleanText(m[2], 200);
    if (!title || title.length < 2) continue;
    let url: string | undefined;
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      url = raw.split(/\s+/)[0];
    } else if (raw.startsWith("/")) {
      url = `${BASE_URL}${raw.split(/\s+/)[0]}`;
    }
    if (!url) continue;
    const path = url.replace(BASE_URL, "");
    if (!isArticlePath(path)) continue;
    if (seen.has(url)) continue;
    seen.add(url);
    out.push({ title, url });
  }
  return out;
}

export async function collectMlit(): Promise<SearchConnectorResult[]> {
  const html = await fetchHtml(TEC_URL, { timeoutMs: 25000, retries: 3 });
  return parseMlitTecLinks(html).map((link): SearchConnectorResult => ({
    sourceType: "web",
    title: link.title,
    url: link.url,
    sourceName: "国土交通省 技術調査"
  }));
}
