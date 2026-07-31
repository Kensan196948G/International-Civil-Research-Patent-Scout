import { compare, hash } from "bcryptjs";
import { jwtVerify, SignJWT } from "jose";
import type { Context, Next } from "hono";
import type { Role } from "@icrps/contracts";
import { resolveEnv, expiresInToSeconds } from "./env.js";
import type { AppEnv } from "./types.js";
import { forbidden, unauthorized } from "./errors.js";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export function secretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
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

export async function requireAuth(c: Context<AppEnv>, next: Next): Promise<Response> {
  const env = resolveEnv(c.env);
  const header = c.req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw unauthorized();
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
  const role = (c.get("role") as Role | undefined) ?? "user";
  if (role !== "admin") throw forbidden("管理者権限が必要です");
  await next();
  return c.res;
}
