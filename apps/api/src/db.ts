import { neon } from "@neondatabase/serverless";
import postgres from "postgres";
import type { WorkerEnv } from "./env.js";

export type Db = (query: string, params?: unknown[]) => Promise<Array<Record<string, unknown>>>;

const pgPools = new Map<string, ReturnType<typeof postgres>>();

export function createDb(env: WorkerEnv): Db {
  // ローカル Postgres 等 neon.tech 以外のホストは pg TCP ドライバ (postgres.js) を使う。
  if (!/neon\.tech(:\d+)?$/.test(new URL(env.DATABASE_URL).host)) {
    let pg = pgPools.get(env.DATABASE_URL);
    if (!pg) {
      pg = postgres(env.DATABASE_URL, { max: 5 });
      pgPools.set(env.DATABASE_URL, pg);
    }
    return async (query, params) => {
      const rows = await pg!.unsafe(query, (params ?? []) as never[]);
      return rows as unknown as Array<Record<string, unknown>>;
    };
  }
  const sql = neon(env.DATABASE_URL, { arrayMode: false });
  return async (query, params) => {
    const rows = await sql.query(query, (params ?? []) as unknown[]);
    return rows as unknown as Array<Record<string, unknown>>;
  };
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function rowTo<T>(row: Record<string, unknown> | undefined): T | null {
  return (row as T | undefined) ?? null;
}

export function parseJsonArray(value: unknown, fallback: unknown[] = []): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function parseJsonObject(value: unknown, fallback: Record<string, unknown> | null = null): Record<string, unknown> | null {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, unknown>;
    } catch {
      return fallback;
    }
  }
  return fallback;
}
