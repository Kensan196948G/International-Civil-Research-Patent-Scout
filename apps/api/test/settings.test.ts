import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decryptSecret, encryptSecret } from "../src/crypto";
import type { Db } from "../src/db";
import {
  clearAiProvider,
  getAiSettings,
  saveAiSettings,
  testAiConnection
} from "../src/settings";

const ENV = {
  APP_ENV: "test",
  APP_URL: "http://localhost",
  DATABASE_URL: "postgres://x",
  JWT_SECRET: "test-secret-123",
  JWT_EXPIRES_IN: "12h",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org"
};

function fakeDb(store: Map<string, Record<string, unknown>>): Db {
  return async (query, params) => {
    const key = String(params?.[0] ?? "");
    if (query.includes("FROM app_settings WHERE key = $1")) {
      const value = store.get(key);
      return value ? [{ value: JSON.stringify(value) }] : [];
    }
    if (query.includes("INSERT INTO app_settings")) {
      store.set(key, JSON.parse(String(params?.[1] ?? "{}")) as Record<string, unknown>);
      return [];
    }
    if (query.includes("DELETE FROM app_settings")) {
      store.delete(key);
      return [];
    }
    return [];
  };
}

describe("crypto", () => {
  it("encrypts and decrypts secrets with AES-GCM", async () => {
    const encrypted = await encryptSecret("sk-deepseek-secret", "secret");
    expect(encrypted).not.toContain("sk-deepseek-secret");
    expect(await decryptSecret(encrypted, "secret")).toBe("sk-deepseek-secret");
  });

  it("returns null for wrong secret or corrupted payload", async () => {
    const encrypted = await encryptSecret("value", "secret");
    expect(await decryptSecret(encrypted, "other")).toBeNull();
    expect(await decryptSecret("not-json", "secret")).toBeNull();
  });
});

describe("ai settings", () => {
  const store = new Map<string, Record<string, unknown>>();
  let db: Db;

  beforeEach(() => {
    store.clear();
    db = fakeDb(store);
  });

  it("saves, reads and clears provider keys without exposing plaintext in storage", async () => {
    await saveAiSettings(db, ENV, {
      deepseek: { apiKey: "sk-ds-abc", model: "deepseek-chat" },
      anthropic: { apiKey: "sk-ant-xyz", model: "claude-sonnet-4-5" }
    });
    const stored = store.get("ai_providers") as {
      deepseek?: { key?: string };
      anthropic?: { key?: string };
    };
    expect(stored?.deepseek?.key).toBeDefined();
    expect(JSON.stringify(stored)).not.toContain("sk-ds-abc");
    expect(JSON.stringify(stored)).not.toContain("sk-ant-xyz");

    const settings = await getAiSettings(db, ENV);
    expect(settings.deepseek.apiKey).toBe("sk-ds-abc");
    expect(settings.anthropic.apiKey).toBe("sk-ant-xyz");
    expect(settings.deepseek.model).toBe("deepseek-chat");

    await clearAiProvider(db, ENV, "deepseek");
    const cleared = await getAiSettings(db, ENV);
    expect(cleared.deepseek.apiKey).toBeNull();
    expect(cleared.anthropic.apiKey).toBe("sk-ant-xyz");
  });

  it("keeps existing key when saving without apiKey", async () => {
    await saveAiSettings(db, ENV, { deepseek: { apiKey: "sk-keep" } });
    await saveAiSettings(db, ENV, { deepseek: { model: "deepseek-reasoner" } });
    const settings = await getAiSettings(db, ENV);
    expect(settings.deepseek.apiKey).toBe("sk-keep");
    expect(settings.deepseek.model).toBe("deepseek-reasoner");
  });
});

describe("testAiConnection", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls DeepSeek chat completions with bearer auth", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await testAiConnection("deepseek", { apiKey: "sk-test", model: "deepseek-chat" });
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.deepseek.com/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer sk-test");
  });

  it("calls Anthropic messages API with x-api-key header", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    const result = await testAiConnection("anthropic", { apiKey: "sk-ant-test" });
    expect(result.ok).toBe(true);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://api.anthropic.com/v1/messages");
    expect((init.headers as Record<string, string>)["x-api-key"]).toBe("sk-ant-test");
    expect((init.headers as Record<string, string>)["anthropic-version"]).toBe("2023-06-01");
  });

  it("reports failure with status detail", async () => {
    fetchMock.mockResolvedValue(new Response('{"error":{"message":"invalid api key"}}', { status: 401 }));
    const result = await testAiConnection("deepseek", { apiKey: "bad" });
    expect(result.ok).toBe(false);
    expect(result.message).toContain("401");
    expect(result.message).toContain("invalid api key");
  });
});
