import { describe, expect, it } from "vitest";
import { Hono } from "hono";
import { authRoutes } from "../src/routes/auth";
import type { WorkerEnv } from "../src/env";
import { HttpError } from "../src/errors";

function makeEnv(extra: Partial<WorkerEnv> = {}): WorkerEnv {
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
    ESPACENET_OPS_URL: "https://ops.epo.org/3.2",
    ...extra
  };
}

function authApp() {
  const app = new Hono<{ Bindings: WorkerEnv }>();
  app.route("/api/auth", authRoutes());
  app.onError((err, c) => {
    if (err instanceof HttpError) {
      return c.json({ error: { code: err.code, message: err.message } }, err.status as 400 | 401 | 403 | 404 | 409 | 500);
    }
    return c.json({ error: { code: "internal_error", message: "server error" } }, 500);
  });
  return app;
}

describe("SSO status and Microsoft OAuth URL", () => {
  it("reports provider availability", async () => {
    const app = authApp();
    const res = await app.request("/api/auth/sso", {}, makeEnv());
    expect(res.status).toBe(200);
    const body = (await res.json()) as { google: boolean; microsoft: boolean };
    expect(body).toEqual({ google: false, microsoft: false });

    const res2 = await app.request(
      "/api/auth/sso",
      {},
      makeEnv({ GOOGLE_CLIENT_ID: "g", GOOGLE_CLIENT_SECRET: "s", MICROSOFT_CLIENT_ID: "m", MICROSOFT_CLIENT_SECRET: "ms" })
    );
    expect(((await res2.json()) as { google: boolean; microsoft: boolean })).toEqual({ google: true, microsoft: true });
  });

  it("returns 400 when Microsoft SSO is not configured", async () => {
    const res = await authApp().request("/api/auth/sso/microsoft/url", {}, makeEnv());
    expect(res.status).toBe(400);
  });

  it("builds the Microsoft authorize URL with required parameters", async () => {
    const env = makeEnv({ MICROSOFT_CLIENT_ID: "client-id", MICROSOFT_CLIENT_SECRET: "secret" });
    const res = await authApp().request("/api/auth/sso/microsoft/url", {}, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { url: string };
    expect(body.url).toContain("https://login.microsoftonline.com/common/oauth2/v2.0/authorize");
    expect(body.url).toContain("client_id=client-id");
    expect(body.url).toContain(encodeURIComponent("http://localhost:8787/api/auth/sso/microsoft/callback"));
    expect(body.url).toContain("scope=openid+profile+email");
  });
});
