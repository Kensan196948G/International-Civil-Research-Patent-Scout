// Worker と Node の両環境で動作する環境変数解決
export interface WorkerEnv {
  APP_ENV: string;
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
}

export const DEFAULTS = {
  APP_ENV: "development",
  APP_URL: "http://localhost:8787",
  JWT_EXPIRES_IN: "12h",
  OPENAI_BASE_URL: "https://api.openai.com/v1",
  AI_MODEL: "gpt-4o-mini",
  CROSSREF_API_URL: "https://api.crossref.org",
  OPENALEX_API_URL: "https://api.openalex.org"
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
    APP_URL: get("APP_URL") ?? DEFAULTS.APP_URL,
    DATABASE_URL: required("DATABASE_URL"),
    JWT_SECRET: required("JWT_SECRET"),
    JWT_EXPIRES_IN: get("JWT_EXPIRES_IN") ?? DEFAULTS.JWT_EXPIRES_IN,
    OPENAI_API_KEY: get("OPENAI_API_KEY"),
    OPENAI_BASE_URL: get("OPENAI_BASE_URL") ?? DEFAULTS.OPENAI_BASE_URL,
    AI_MODEL: get("AI_MODEL") ?? DEFAULTS.AI_MODEL,
    CROSSREF_API_URL: get("CROSSREF_API_URL") ?? DEFAULTS.CROSSREF_API_URL,
    OPENALEX_API_URL: get("OPENALEX_API_URL") ?? DEFAULTS.OPENALEX_API_URL,
    SERP_API_KEY: get("SERP_API_KEY")
  };
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
