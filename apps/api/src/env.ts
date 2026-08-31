// Worker と Node の両環境で動作する環境変数解決
export interface WorkerEnv {
  APP_ENV: string;
  /** MVP 公開デモ用のログイン認証バイパス（"true" で有効）。APP_ENV=production では無視される。 */
  AUTH_BYPASS?: string;
  /** バイパス時に成りすますユーザーの email。未指定なら在籍中の admin を1件採用 */
  AUTH_BYPASS_EMAIL?: string;
  APP_URL: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  OPENAI_API_KEY?: string;
  OPENAI_BASE_URL: string;
  AI_MODEL: string;
  CROSSREF_API_URL: string;
  OPENALEX_API_URL: string;
  SERP_API_KEY?: string;
  ESPACENET_OPS_URL: string;
  ESPACENET_OPS_KEY?: string;
  ESPACENET_OPS_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  ADMIN_EMAIL?: string;
  MEILISEARCH_HOST?: string;
  MEILISEARCH_API_KEY?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
  REGISTRATION_MODE?: string;
  ALLOWED_EMAIL_DOMAINS?: string;
  BOOTSTRAP_ADMIN_EMAIL?: string;
  AI_RATE_LIMIT_PER_HOUR?: string;
  /** Cloudflare Queues バインディング（任意）。未設定時は waitUntil / Node タイマーで実行 */
  SEARCH_QUEUE?: { send: (message: unknown) => Promise<void> };
}

export const DEFAULTS = {
  APP_ENV: "development",
  APP_URL: "http://localhost:8787",
  JWT_EXPIRES_IN: "12h",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org",
  ESPACENET_OPS_URL: "https://ops.epo.org/3.2"
} as const;

export function resolveEnv(input: Partial<WorkerEnv> | undefined): WorkerEnv {
  const src = (input ?? {}) as Record<string, string | undefined>;
  const node = process.env as Record<string, string | undefined>;
  const get = (key: keyof WorkerEnv): string | undefined => src[key] ?? node[key];
  const required = (key: keyof WorkerEnv): string => {
    const v = get(key);
    if (!v) throw new Error(`missing required env: ${key}`);
    return v;
  };
  return {
    APP_ENV: get("APP_ENV") ?? DEFAULTS.APP_ENV,
    AUTH_BYPASS: get("AUTH_BYPASS"),
    AUTH_BYPASS_EMAIL: get("AUTH_BYPASS_EMAIL"),
    APP_URL: get("APP_URL") ?? DEFAULTS.APP_URL,
    DATABASE_URL: required("DATABASE_URL"),
    JWT_SECRET: required("JWT_SECRET"),
    JWT_EXPIRES_IN: get("JWT_EXPIRES_IN") ?? DEFAULTS.JWT_EXPIRES_IN,
    OPENAI_API_KEY: get("OPENAI_API_KEY"),
    OPENAI_BASE_URL: get("OPENAI_BASE_URL") ?? DEFAULTS.OPENAI_BASE_URL,
    AI_MODEL: get("AI_MODEL") ?? DEFAULTS.AI_MODEL,
    CROSSREF_API_URL: get("CROSSREF_API_URL") ?? DEFAULTS.CROSSREF_API_URL,
    OPENALEX_API_URL: get("OPENALEX_API_URL") ?? DEFAULTS.OPENALEX_API_URL,
    SERP_API_KEY: get("SERP_API_KEY"),
    ESPACENET_OPS_URL: get("ESPACENET_OPS_URL") ?? DEFAULTS.ESPACENET_OPS_URL,
    ESPACENET_OPS_KEY: get("ESPACENET_OPS_KEY"),
    ESPACENET_OPS_SECRET: get("ESPACENET_OPS_SECRET"),
    RESEND_API_KEY: get("RESEND_API_KEY"),
    EMAIL_FROM: get("EMAIL_FROM"),
    ADMIN_EMAIL: get("ADMIN_EMAIL"),
    MEILISEARCH_HOST: get("MEILISEARCH_HOST"),
    MEILISEARCH_API_KEY: get("MEILISEARCH_API_KEY"),
    GOOGLE_CLIENT_ID: get("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: get("GOOGLE_CLIENT_SECRET"),
    MICROSOFT_CLIENT_ID: get("MICROSOFT_CLIENT_ID"),
    MICROSOFT_CLIENT_SECRET: get("MICROSOFT_CLIENT_SECRET"),
    REGISTRATION_MODE: get("REGISTRATION_MODE") ?? "open",
    ALLOWED_EMAIL_DOMAINS: get("ALLOWED_EMAIL_DOMAINS") ?? "",
    BOOTSTRAP_ADMIN_EMAIL: get("BOOTSTRAP_ADMIN_EMAIL") ?? "",
    AI_RATE_LIMIT_PER_HOUR: get("AI_RATE_LIMIT_PER_HOUR") ?? "100",
    SEARCH_QUEUE: (input as Partial<WorkerEnv> | undefined)?.SEARCH_QUEUE
  };
}

export function isEmailDomainAllowed(email: string, env: WorkerEnv): boolean {
  const mode = (env.REGISTRATION_MODE ?? "open").trim().toLowerCase();
  if (mode === "open") return true;
  if (mode !== "domain") return false;
  const domains = (env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase().replace(/^\./, ""))
    .filter(Boolean);
  if (domains.length === 0) return false;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  return domains.some((allowed) => domain === allowed || domain.endsWith(`.${allowed}`));
}

export function aiRateLimitPerHour(env: WorkerEnv): number {
  const n = Number(env.AI_RATE_LIMIT_PER_HOUR ?? "100");
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 100;
}

export function expiresInToSeconds(expiresIn: string): number {
  const m = /^(\d+)([smhd])$/.exec(expiresIn.trim());
  if (!m) return 12 * 3600;
  const n = Number(m[1]);
  switch (m[2]) {
    case "s": return n;
    case "m": return n * 60;
    case "h": return n * 3600;
    case "d": return n * 86400;
    default: return 12 * 3600;
  }
}
