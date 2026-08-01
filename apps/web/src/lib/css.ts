import type { CSSProperties } from "react";

// スタンドアロン版テンプレートのインラインスタイル文字列を React style オブジェクトへ変換する
const cache = new Map<string, CSSProperties>();

function toCamel(name: string): string {
  let n = name;
  if (n.startsWith("-webkit-")) n = `Webkit${n.slice(8)}`;
  else if (n.startsWith("-moz-")) n = `Moz${n.slice(5)}`;
  return n.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
}

export function css(value: string): CSSProperties {
  const cached = cache.get(value);
  if (cached) return cached;
  const out: Record<string, string> = {};
  for (const part of value.split(";")) {
    const i = part.indexOf(":");
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (key && val) out[toCamel(key)] = val;
  }
  const result = out as CSSProperties;
  cache.set(value, result);
  return result;
}
