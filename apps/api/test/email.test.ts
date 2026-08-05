import { afterEach, describe, expect, it, vi } from "vitest";
import { buildInvitationEmail, sendEmail } from "../src/email";
import type { WorkerEnv } from "../src/env";

const ENV: WorkerEnv = {
  APP_ENV: "test",
  APP_URL: "http://localhost",
  DATABASE_URL: "postgres://x",
  JWT_SECRET: "test-secret",
  JWT_EXPIRES_IN: "12h",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org",
  ESPACENET_OPS_URL: "https://ops.epo.org/3.2"
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendEmail", () => {
  it("does nothing when Resend key or from address is missing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(await sendEmail({ to: "a@example.com", subject: "s", text: "t" }, ENV)).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts to Resend API with auth header and returns success", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const ok = await sendEmail(
      { to: "user@example.com", subject: "[ICRPS] 新着", text: "本文" },
      { ...ENV, RESEND_API_KEY: "re_123", EMAIL_FROM: "ICRPS <noreply@example.com>" }
    );
    expect(ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_123");
    expect(String(init.body)).toContain("user@example.com");
    expect(String(init.body)).toContain("noreply@example.com");
  });

  it("returns false on API error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("error", { status: 422 })));
    const ok = await sendEmail(
      { to: "user@example.com", subject: "s", text: "t" },
      { ...ENV, RESEND_API_KEY: "re_123", EMAIL_FROM: "ICRPS <noreply@example.com>" }
    );
    expect(ok).toBe(false);
  });
});

describe("buildInvitationEmail", () => {
  it("builds a project invitation message", () => {
    const message = buildInvitationEmail({
      projectTitle: "低炭素コンクリート調査",
      role: "editor",
      appUrl: "https://icrps.example.com",
      invitedEmail: "user@example.com"
    });
    expect(message.to).toBe("user@example.com");
    expect(message.subject).toContain("低炭素コンクリート調査");
    expect(message.text).toContain("編集（editor）");
    expect(message.text).toContain("https://icrps.example.com");
  });
});
