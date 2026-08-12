// AI 呼び出しのユーザー単位レート制限（単一インスタンス前提・メモリ保持）
import type { Context } from "hono";
import type { AppEnv } from "./types.js";
import { aiRateLimitPerHour, resolveEnv } from "./env.js";
import { rateLimit } from "./rate-limit.js";

export function aiRateLimited(c: Context<AppEnv>): { allowed: boolean; retryAfterSeconds: number } {
  const env = resolveEnv(c.env);
  const userId = c.get("userId") ?? "anonymous";
  return rateLimit(`ai:${userId}`, aiRateLimitPerHour(env), 60 * 60 * 1000);
}
