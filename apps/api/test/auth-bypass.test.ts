/**
 * MVP 公開デモ用のログイン認証バイパス。
 * - APP_ENV=production では AUTH_BYPASS=true でも必ず 401（安全装置）
 * - AUTH_BYPASS 未設定なら従来どおり 401
 * - 有効時は未ログインでも通過し、DB の admin として扱われる
 * - DB から利用者を引けなければ 401（フェイルクローズ）
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { Hono } from "hono";
import type { AppEnv } from "../src/types";
import { HttpError } from "../src/errors";

const findFirstAdminUser = vi.fn();
const findUserByEmail = vi.fn();

vi.mock("../src/repositories.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/repositories")>();
  return {
    ...actual,
    findFirstAdminUser: (...args: unknown[]) => findFirstAdminUser(...args),
    findUserByEmail: (...args: unknown[]) => findUserByEmail(...args)
  };
});

vi.mock("../src/db.js", () => ({ createDb: () => vi.fn() }));

const { requireAuth } = await import("../src/auth");

function makeEnv(extra: Record<string, string> = {}) {
  return {
    APP_ENV: "mvp",
    APP_URL: "http://localhost:8787",
    DATABASE_URL: "postgres://test",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "12h",
    OPENAI_BASE_URL: "https://api.openai.com/v1",
    AI_MODEL: "gpt-4o-mini",
    CROSSREF_API_URL: "https://api.crossref.org",
    OPENALEX_API_URL: "https://api.openalex.org",
    ESPACENET_OPS_URL: "https://ops.epo.org/3.2",
    ...extra
  };
}

function app() {
  const a = new Hono<AppEnv>();
  a.use("/p", requireAuth);
  a.get("/p", (c) => c.json({ userId: c.get("userId"), role: c.get("role") }));
  a.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json({ error: err.code }, err.status as 401 | 403 | 500);
    }
    return c.json({ error: "internal" }, 500);
  });
  return a;
}

const ADMIN = { id: "u-admin", email: "admin@icrps.local", role: "admin" };

beforeEach(() => {
  findFirstAdminUser.mockReset();
  findUserByEmail.mockReset();
});

describe("requireAuth の MVP バイパス", () => {
  it("AUTH_BYPASS 未設定なら未ログインは 401", async () => {
    const res = await app().request("/p", {}, makeEnv());
    expect(res.status).toBe(401);
    expect(findFirstAdminUser).not.toHaveBeenCalled();
  });

  it("AUTH_BYPASS=true かつ APP_ENV=mvp なら未ログインでも通過する", async () => {
    findFirstAdminUser.mockResolvedValue(ADMIN);
    const res = await app().request("/p", {}, makeEnv({ AUTH_BYPASS: "true" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "u-admin", role: "admin" });
  });

  it("APP_ENV=production では AUTH_BYPASS=true でも 401（安全装置）", async () => {
    findFirstAdminUser.mockResolvedValue(ADMIN);
    const res = await app().request("/p", {}, makeEnv({ APP_ENV: "production", AUTH_BYPASS: "true" }));
    expect(res.status).toBe(401);
    expect(findFirstAdminUser).not.toHaveBeenCalled();
  });

  it("AUTH_BYPASS_EMAIL 指定時はそのユーザーを使う", async () => {
    findUserByEmail.mockResolvedValue({ id: "u-2", email: "demo@icrps.local", role: "viewer" });
    const res = await app().request("/p", {}, makeEnv({ AUTH_BYPASS: "true", AUTH_BYPASS_EMAIL: "demo@icrps.local" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ userId: "u-2", role: "viewer" });
    expect(findUserByEmail).toHaveBeenCalled();
  });

  it("利用者を引けなければ 401（フェイルクローズ）", async () => {
    findFirstAdminUser.mockResolvedValue(null);
    const res = await app().request("/p", {}, makeEnv({ AUTH_BYPASS: "true" }));
    expect(res.status).toBe(401);
  });

  it("DB エラー時も 401（フェイルクローズ）", async () => {
    findFirstAdminUser.mockRejectedValue(new Error("db down"));
    const res = await app().request("/p", {}, makeEnv({ AUTH_BYPASS: "true" }));
    expect(res.status).toBe(401);
  });
});
