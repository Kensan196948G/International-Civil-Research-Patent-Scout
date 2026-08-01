import type { Db } from "./db.js";
import type { WorkerEnv } from "./env.js";
import { decryptSecret, encryptSecret } from "./crypto.js";
import { deleteAppSetting, getAppSetting, setAppSetting } from "./repositories.js";

const SETTINGS_KEY = "ai_providers";

export const DEFAULT_MODELS = {
  deepseek: "deepseek-chat",
  anthropic: "claude-sonnet-4-5"
} as const;

export const DEFAULT_BASE_URLS = {
  deepseek: "https://api.deepseek.com",
  anthropic: "https://api.anthropic.com"
} as const;

export interface AiProviderSettings {
  apiKey: string | null;
  model: string;
  baseUrl: string;
}

export interface AiSettings {
  deepseek: AiProviderSettings;
  anthropic: AiProviderSettings;
}

export type AiProviderName = "deepseek" | "anthropic";

interface StoredProvider {
  key?: string;
  model?: string;
  baseUrl?: string;
}

export async function getAiSettings(db: Db, env: WorkerEnv): Promise<AiSettings> {
  const stored = (await getAppSetting(db, SETTINGS_KEY)) as
    | { deepseek?: StoredProvider; anthropic?: StoredProvider }
    | null;
  const decrypt = async (name: AiProviderName, p?: StoredProvider): Promise<AiProviderSettings> => {
    const provider = p ?? {};
    return {
      apiKey: provider.key ? await decryptSecret(provider.key, env.JWT_SECRET) : null,
      model: provider.model ?? (DEFAULT_MODELS[name] ?? "deepseek-chat"),
      baseUrl: provider.baseUrl ?? (DEFAULT_BASE_URLS[name] ?? DEFAULT_BASE_URLS.deepseek)
    };
  };
  const deepseek = await decrypt("deepseek", stored?.deepseek);
  const anthropic = await decrypt("anthropic", stored?.anthropic);
  return { deepseek, anthropic };
}

export async function saveAiSettings(
  db: Db,
  env: WorkerEnv,
  input: {
    deepseek?: { apiKey?: string; model?: string; baseUrl?: string };
    anthropic?: { apiKey?: string; model?: string; baseUrl?: string };
  }
): Promise<AiSettings> {
  const current = (await getAppSetting(db, SETTINGS_KEY)) as
    | { deepseek?: StoredProvider; anthropic?: StoredProvider }
    | null;
  const next: { deepseek?: StoredProvider; anthropic?: StoredProvider } = {};
  for (const name of ["deepseek", "anthropic"] as const) {
    const patch = input[name];
    if (!patch) continue;
    const prev = current?.[name] ?? {};
    const stored: StoredProvider = {
      key: prev.key,
      model: patch.model?.trim() || prev.model || (DEFAULT_MODELS[name] ?? "deepseek-chat"),
      baseUrl: patch.baseUrl?.trim() || prev.baseUrl || (DEFAULT_BASE_URLS[name] ?? DEFAULT_BASE_URLS.deepseek)
    };
    if (patch.apiKey) stored.key = await encryptSecret(patch.apiKey.trim(), env.JWT_SECRET);
    next[name] = stored;
  }
  await setAppSetting(db, SETTINGS_KEY, {
    ...(current ?? {}),
    ...next
  });
  return getAiSettings(db, env);
}

export async function clearAiProvider(db: Db, env: WorkerEnv, provider: AiProviderName): Promise<AiSettings> {
  const current = (await getAppSetting(db, SETTINGS_KEY)) as
    | { deepseek?: StoredProvider; anthropic?: StoredProvider }
    | null;
  const next = { ...(current ?? {}) };
  delete next[provider];
  if (Object.keys(next).length === 0) {
    await deleteAppSetting(db, SETTINGS_KEY);
  } else {
    await setAppSetting(db, SETTINGS_KEY, next);
  }
  return getAiSettings(db, env);
}

export interface ActiveAiProvider {
  provider: "openai" | "deepseek" | "anthropic";
  apiKey: string;
  model: string;
  baseUrl: string;
}

export async function getActiveAiProvider(db: Db, env: WorkerEnv): Promise<ActiveAiProvider | null> {
  const settings = await getAiSettings(db, env);
  if (settings.deepseek.apiKey) {
    return {
      provider: "deepseek",
      apiKey: settings.deepseek.apiKey,
      model: settings.deepseek.model,
      baseUrl: settings.deepseek.baseUrl
    };
  }
  if (settings.anthropic.apiKey) {
    return {
      provider: "anthropic",
      apiKey: settings.anthropic.apiKey,
      model: settings.anthropic.model,
      baseUrl: settings.anthropic.baseUrl
    };
  }
  if (env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: env.OPENAI_API_KEY,
      model: env.AI_MODEL,
      baseUrl: env.OPENAI_BASE_URL
    };
  }
  return null;
}

export async function testAiConnection(
  provider: AiProviderName,
  input: { apiKey: string; model?: string; baseUrl?: string }
): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const base = (input.baseUrl?.trim() || (DEFAULT_BASE_URLS[provider] ?? DEFAULT_BASE_URLS.deepseek)).replace(/\/+$/, "");
  const model = input.model?.trim() || (DEFAULT_MODELS[provider] ?? "deepseek-chat");
  const started = Date.now();
  try {
    let response: Response;
    if (provider === "anthropic") {
      response = await fetch(`${base}/v1/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": input.apiKey.trim(),
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{ role: "user", content: "ping" }]
        }),
        signal: AbortSignal.timeout(15000)
      });
    } else {
      response = await fetch(`${base}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${input.apiKey.trim()}`
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{ role: "user", content: "ping" }]
        }),
        signal: AbortSignal.timeout(15000)
      });
    }
    const latencyMs = Date.now() - started;
    if (!response.ok) {
      const body = (await response.text().catch(() => "")) || "";
      const detail = body.slice(0, 200).replace(/\s+/g, " ").trim();
      return {
        ok: false,
        message: `接続失敗（HTTP ${response.status}）${detail ? `: ${detail}` : ""}`,
        latencyMs
      };
    }
    return {
      ok: true,
      message: `接続成功 · ${provider} / ${model} · ${latencyMs}ms`,
      latencyMs
    };
  } catch (err) {
    return {
      ok: false,
      message: `接続エラー: ${err instanceof Error ? err.message : String(err)}`,
      latencyMs: Date.now() - started
    };
  }
}
