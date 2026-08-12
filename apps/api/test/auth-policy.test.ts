import { describe, expect, it } from "vitest";
import { aiRateLimitPerHour, isEmailDomainAllowed, type WorkerEnv } from "../src/env";

function env(overrides: Partial<WorkerEnv> = {}): WorkerEnv {
  return {
    APP_ENV: "test",
    APP_URL: "http://localhost:8787",
    DATABASE_URL: "postgres://test",
    JWT_SECRET: "secret",
    JWT_EXPIRES_IN: "12h",
    OPENAI_BASE_URL: "https://api.openai.com/v1",
    AI_MODEL: "gpt-4o-mini",
    CROSSREF_API_URL: "https://api.crossref.org",
    OPENALEX_API_URL: "https://api.openalex.org",
    ESPACENET_OPS_URL: "https://ops.epo.org/3.2",
    REGISTRATION_MODE: "open",
    ALLOWED_EMAIL_DOMAINS: "",
    BOOTSTRAP_ADMIN_EMAIL: "",
    AI_RATE_LIMIT_PER_HOUR: "100",
    ...overrides
  };
}

describe("isEmailDomainAllowed", () => {
  it("allows any email in open mode", () => {
    expect(isEmailDomainAllowed("user@example.com", env())).toBe(true);
  });

  it("blocks emails outside allowed domains in domain mode", () => {
    const e = env({ REGISTRATION_MODE: "domain", ALLOWED_EMAIL_DOMAINS: "example.com,sub.example.co.jp" });
    expect(isEmailDomainAllowed("user@example.com", e)).toBe(true);
    expect(isEmailDomainAllowed("user@sub.example.co.jp", e)).toBe(true);
    expect(isEmailDomainAllowed("user@example.co.jp", e)).toBe(false);
  });

  it("blocks all registrations when domain mode has no allowlist", () => {
    const e = env({ REGISTRATION_MODE: "domain", ALLOWED_EMAIL_DOMAINS: "" });
    expect(isEmailDomainAllowed("user@example.com", e)).toBe(false);
  });
});

describe("aiRateLimitPerHour", () => {
  it("parses configured limit", () => {
    expect(aiRateLimitPerHour(env({ AI_RATE_LIMIT_PER_HOUR: "250" }))).toBe(250);
  });

  it("falls back to 100 for invalid values", () => {
    expect(aiRateLimitPerHour(env({ AI_RATE_LIMIT_PER_HOUR: "abc" }))).toBe(100);
    expect(aiRateLimitPerHour(env({ AI_RATE_LIMIT_PER_HOUR: "0" }))).toBe(100);
  });
});
