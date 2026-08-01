// 土木建設技術文献コレクタ共通ヘルパー
// robots.txt・利用規約・レートを尊重し、メタデータ（タイトル・著者・要旨・DOI/URL）のみを扱う

export function cleanText(value: unknown, max = 500): string {
  const s = typeof value === "string" ? value : "";
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/\s+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim()
    .slice(0, max);
}

export function firstMatch(text: string, re: RegExp): string | null {
  const m = re.exec(text);
  return m ? (m[1] ?? null) : null;
}

/** 複数キャプチャ（CDATA またはプレーンテキスト）から最初の値を持つものを返す */
export function firstMatchFlexible(text: string, re: RegExp): string | null {
  const m = re.exec(text);
  if (!m) return null;
  const found = m.find((g, i) => i > 0 && g !== undefined && g !== "");
  return found ?? null;
}

export function allMatches(text: string, re: RegExp): string[] {
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  return [...text.matchAll(new RegExp(re.source, flags))].map((m) => m[1] ?? "");
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHtml(
  url: string,
  options: { timeoutMs?: number; retries?: number } = {}
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 20000;
  const retries = options.retries ?? 2;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; ICRPS-LiteratureBot/0.1; +https://github.com/Kensan196948G/International-Civil-Research-Patent-Scout)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ja,en;q=0.8"
        },
        signal: AbortSignal.timeout(timeoutMs)
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      lastError = err;
      if (attempt < retries) await sleep(500 * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("fetch failed");
}

/** 2桁年度を西暦に変換（今年以前なら 2000 年代、それ以降は 1900 年代） */
export function twoDigitYearToFull(yy: number): number {
  const currentYY = new Date().getFullYear() % 100;
  return yy <= currentYY ? 2000 + yy : 1900 + yy;
}

/** 引用等で使う URL 文字列から HTML エンティティを除去して返す */
export function decodeUrl(raw: string): string {
  return raw
    .trim()
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
