import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { signToken, requireAuth } from "../src/auth";
import { csrfGuard, setAuthCookies, TOKEN_COOKIE, CSRF_COOKIE } from "../src/auth-cookie";
import type { AppEnv } from "../src/types";
import { HttpError } from "../src/errors";

function makeEnv() {
  return {
    APP_ENV: "test",
    APP_URL: "http://localhost:8787",
    DATABASE_URL: "postgres://test",
    JWT_SECRET: "test-secret",
    JWT_EXPIRES_IN: "12h",
    OPENAI_BASE_URL: "https://api.openai.com/v1",
    AI_MODEL: "gpt-4o-mini",
    CROSSREF_API_URL: "https://api.crossref.org",
    OPENALEX_API_URL: "https://api.openalex.org",
    ESPACENET_OPS_URL: "https://ops.epo.org/3.2"
  };
}

function guardedApp() {
  const app = new Hono<AppEnv>();
  app.use("*", csrfGuard);
  app.post("/x", (c) => c.json({ ok: true }));
  app.get("/y", (c) => c.json({ ok: true }));
  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json({ error: { code: err.code, message: err.message } }, err.status as 400 | 401 | 403 | 404 | 409 | 500);
    }
    return c.json({ error: { code: "internal_error", message: "server error" } }, 500);
  });
  return app;
}

describe("csrfGuard", () => {
  it("allows non-GET without cookie (Bearer-only client)", async () => {
    const res = await guardedApp().request("/x", { method: "POST" });
    expect(res.status).toBe(200);
  });

  it("rejects cookie-authenticated POST without CSRF header", async () => {
    const res = await guardedApp().request("/x", {
      method: "POST",
      headers: { Cookie: `${TOKEN_COOKIE}=jwt; ${CSRF_COOKIE}=csrf` }
    });
    expect(res.status).toBe(403);
  });

  it("rejects mismatched CSRF token", async () => {
    const res = await guardedApp().request("/x", {
      method: "POST",
      headers: {
        Cookie: `${TOKEN_COOKIE}=jwt; ${CSRF_COOKIE}=csrf`,
        "X-CSRF-Token": "other"
      }
    });
    expect(res.status).toBe(403);
  });

  it("accepts matching CSRF token", async () => {
    const res = await guardedApp().request("/x", {
      method: "POST",
      headers: {
        Cookie: `${TOKEN_COOKIE}=jwt; ${CSRF_COOKIE}=csrf`,
        "X-CSRF-Token": "csrf"
      }
    });
    expect(res.status).toBe(200);
  });

  it("allows GET with cookie (no CSRF needed)", async () => {
    const res = await guardedApp().request("/y", {
      headers: { Cookie: `${TOKEN_COOKIE}=jwt; ${CSRF_COOKIE}=csrf` }
    });
    expect(res.status).toBe(200);
  });
});

describe("setAuthCookies", () => {
  it("sets HttpOnly token cookie and CSRF cookie", async () => {
    const app = new Hono<AppEnv>();
    app.get("/login", (c) => {
      setAuthCookies(c, "jwt-value", 3600);
      return c.json({ ok: true });
    });
    const res = await app.request("/login", {}, makeEnv());
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`${TOKEN_COOKIE}=jwt-value`);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie).toContain(`${CSRF_COOKIE}=`);
  });
});

describe("requireAuth with cookie", () => {
  it("accepts a valid JWT from the token cookie", async () => {
    const app = new Hono<AppEnv>();
    app.get("/me", requireAuth, (c) => c.json({ ok: true, userId: c.get("userId") }));
    const token = await signToken("user-1", "user", "test-secret", "1h");
    const res = await app.request("/me", {
      headers: { Cookie: `${TOKEN_COOKIE}=${token}` }
    }, makeEnv());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { userId?: string };
    expect(body.userId).toBe("user-1");
  });
});
