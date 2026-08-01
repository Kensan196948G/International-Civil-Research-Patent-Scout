// 国土交通省 関東地方整備局 技術情報（ktr.mlit.go.jp/gijyutu）の新着一覧を取得する
import type { SearchConnectorResult } from "@icrps/contracts";
import { cleanText, fetchHtml } from "./parse.js";
import type { WebLink } from "./mlit.js";

const BASE_URL = "https://www.ktr.mlit.go.jp";
const GIJYUTU_URL = `${BASE_URL}/gijyutu/index.html`;

function isArticlePath(path: string): boolean {
  return /^\/(gijyutu\/|eizen\/gijyutu\/)/.test(path) &&
    !/index\.html$|#|\.pdf$|\.css$/.test(path);
}

export function parseKtrGijyutuLinks(html: string): WebLink[] {
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

export async function collectKtr(): Promise<SearchConnectorResult[]> {
  const html = await fetchHtml(GIJYUTU_URL, { timeoutMs: 25000, retries: 3 });
  return parseKtrGijyutuLinks(html).map((link): SearchConnectorResult => ({
    sourceType: "web",
    title: link.title,
    url: link.url,
    sourceName: "関東地方整備局 技術情報"
  }));
}
