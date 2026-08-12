// Cookie ベース認証（HttpOnly JWT + CSRF ダブルサブミット）
// Bearer クライアントは引き続き許可し、Cookie 利用時のみ CSRF 検査を適用する
import type { Context, Next } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { randomToken } from "./auth.js";
import { resolveEnv } from "./env.js";
import { HttpError } from "./errors.js";
import type { AppEnv } from "./types.js";

export const TOKEN_COOKIE = "icrps_token";
export const CSRF_COOKIE = "icrps_csrf";

function cookieOptions(c: Context<AppEnv>, maxAgeSeconds: number, httpOnly: boolean) {
  const env = resolveEnv(c.env);
  return {
    httpOnly,
    sameSite: "Lax" as const,
    secure: env.APP_URL.startsWith("https://"),
    path: "/",
    maxAge: maxAgeSeconds
  };
}

export function setAuthCookies(c: Context<AppEnv>, token: string, maxAgeSeconds: number): void {
  setCookie(c, TOKEN_COOKIE, token, cookieOptions(c, maxAgeSeconds, true));
  setCookie(c, CSRF_COOKIE, randomToken(), cookieOptions(c, maxAgeSeconds, false));
}

export function clearAuthCookies(c: Context<AppEnv>): void {
  deleteCookie(c, TOKEN_COOKIE, { path: "/" });
  deleteCookie(c, CSRF_COOKIE, { path: "/" });
}

export function tokenFromCookie(c: Context<AppEnv>): string | null {
  return getCookie(c, TOKEN_COOKIE) ?? null;
}

export function csrfFromCookie(c: Context<AppEnv>): string | null {
  return getCookie(c, CSRF_COOKIE) ?? null;
}

export async function csrfGuard(c: Context<AppEnv>, next: Next): Promise<Response | void> {
  const method = c.req.method;
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return next();
  // Cookie 認証を利用していない（Bearer 専用）リクエストは CSRF 検査対象外
  if (!tokenFromCookie(c)) return next();
  const csrf = csrfFromCookie(c);
  const header = c.req.header("x-csrf-token");
  if (!csrf || !header || header !== csrf) {
    throw new HttpError(403, "csrf_invalid", "CSRF トークンが不正です。ページを再読み込みして再試行してください");
  }
  return next();
}
