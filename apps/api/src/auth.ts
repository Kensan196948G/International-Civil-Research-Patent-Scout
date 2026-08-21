import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import type { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import type { Role } from "@icrps/contracts";
import { resolveEnv, expiresInToSeconds, type WorkerEnv } from "./env.js";
import type { AppEnv } from "./types.js";
import { forbidden, unauthorized } from "./errors.js";
import { createDb } from "./db.js";
import { findFirstAdminUser, findUserByEmail, findUserById } from "./repositories.js";
import { TOKEN_COOKIE } from "./auth-cookie.js";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signToken(
  userId: string,
  role: Role,
  secret: string,
  expiresIn = "12h"
): Promise<string> {
  const seconds = expiresInToSeconds(expiresIn);
  return new SignJWT({ role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${seconds}s`)
    .sign(secretKey(secret));
}

export interface TokenPayload {
  sub: string;
  role: Role;
}

export async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secretKey(secret), { algorithms: ["HS256"] });
  if (!payload.sub) throw unauthorized("トークンが不正です");
  return { sub: payload.sub, role: (payload.role as Role) ?? "user" };
}

export type AuthContext = {
  userId: string;
  role: Role;
};

/**
 * MVP 公開デモ用のログイン認証バイパス。
 * AUTH_BYPASS === "true" かつ APP_ENV が production 以外のときだけ有効（安全装置）。
 * AUTH_BYPASS_EMAIL 未指定なら在籍中の admin を1件採用し、
 * 該当ユーザーが居なければ認証しない（フェイルクローズ）。
 */
async function applyAuthBypass(c: Context<AppEnv>, env: WorkerEnv): Promise<boolean> {
  if (env.AUTH_BYPASS !== "true" || env.APP_ENV === "production") return false;
  const db = createDb(env);
  // Neon (serverless HTTP) は稀に一時エラーを返す。デモ URL がその都度ログイン画面へ
  // 落ちないよう、一時エラーに限り 1 度だけ再試行する。失敗時はフェイルクローズ。
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const user = env.AUTH_BYPASS_EMAIL
        ? await findUserByEmail(db, env.AUTH_BYPASS_EMAIL)
        : await findFirstAdminUser(db);
      if (!user) return false;
      c.set("userId", user.id);
      c.set("role", user.role);
      return true;
    } catch {
      if (attempt === 1) return false;
      await new Promise((r) => setTimeout(r, 120));
    }
  }
  return false;
}

export async function requireAuth(c: Context<AppEnv>, next: Next): Promise<Response> {
  const env = resolveEnv(c.env);
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : getCookie(c, TOKEN_COOKIE);
  if (!token) {
    if (await applyAuthBypass(c, env)) {
      await next();
      return c.res;
    }
    throw unauthorized();
  }
  try {
    const payload = await verifyToken(token, env.JWT_SECRET);
    c.set("userId", payload.sub);
    c.set("role", payload.role);
    await next();
    return c.res;
  } catch (err) {
    if (err instanceof Error && "status" in err && (err as { status: number }).status === 401) throw err;
    throw unauthorized("トークンの有効期限が切れています");
  }
}

export async function requireAdmin(c: Context<AppEnv>, next: Next): Promise<Response> {
  const userId = c.get("userId");
  if (!userId) throw unauthorized("認証が必要です");
  // トークンのロールではなく DB の現在ロールで判定する（ロール変更を即時反映）
  const env = resolveEnv(c.env);
  const db = createDb(env);
  const user = await findUserById(db, userId);
  if (!user || user.role !== "admin") throw forbidden("管理者権限が必要です");
  c.set("role", "admin");
  await next();
  return c.res;
}
