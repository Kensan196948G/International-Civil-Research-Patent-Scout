// 技術分類コード（IPC / CPC）の標準化
// 例: "e04g 23/00" → "E04G23/00"

const IPC_RE = /^([A-H])(\d{2})([A-Z])?(\d{1,4})?(?:\/(\d{1,6}))?$/;

export function normalizeClassificationCode(code: string): string | null {
  const normalized = code.trim().toUpperCase().replace(/\s+/g, "");
  const m = IPC_RE.exec(normalized);
  if (!m) return null;
  return `${m[1]}${m[2]}${m[3] ?? ""}${m[4] ?? ""}${m[5] ? `/${m[5]}` : ""}`;
}

export function normalizeClassifications(codes: string[] | null | undefined): string[] | null {
  if (!codes?.length) return null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const code of codes) {
    const normalized = normalizeClassificationCode(code);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out.length ? out : null;
}

/** IPC セクション（A〜H）を返す */
export function ipcSection(code: string): string | null {
  const m = /^([A-H])/.exec(code.trim().toUpperCase());
  return m ? (m[1] ?? null) : null;
}
