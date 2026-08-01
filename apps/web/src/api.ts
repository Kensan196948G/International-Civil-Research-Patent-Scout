import type {
  AuthResponse,
  Comparison,
  DashboardStats,
  ProjectDocument,
  Report,
  ResearchProject,
  SearchQuery,
  SourceDocument,
  User
} from "@icrps/contracts";

const TOKEN_KEY = "icrps_token";

export interface LiteratureItem {
  id: string;
  sourceType: string;
  title: string;
  originalTitle: string | null;
  abstract: string | null;
  url: string | null;
  doi: string | null;
  authors: string[];
  publicationDate: string | null;
  sourceName: string | null;
  sourceLabel: string;
  createdAt: string;
}

function createTokenStore() {
  try {
    const ls = globalThis.localStorage;
    if (ls && typeof ls.getItem === "function" && typeof ls.setItem === "function") {
      return {
        get: () => ls.getItem(TOKEN_KEY),
        set: (value: string) => ls.setItem(TOKEN_KEY, value),
        clear: () => ls.removeItem(TOKEN_KEY)
      };
    }
  } catch {
    // localStorage 非対応環境ではメモリ保存
  }
  let memory: string | null = null;
  return {
    get: () => memory,
    set: (value: string) => {
      memory = value;
    },
    clear: () => {
      memory = null;
    }
  };
}

const tokenStore = createTokenStore();

export function getToken(): string | null {
  return tokenStore.get();
}

export function setToken(token: string): void {
  tokenStore.set(token);
}

export function clearToken(): void {
  tokenStore.clear();
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (options.auth !== false && token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  if (response.status === 401 && options.auth !== false) {
    clearToken();
    try {
      if (!window.location.pathname.startsWith("/login")) window.location.assign("/login");
    } catch {
      // jsdom 等ではナビゲーションを実行しない
    }
  }
  if (!response.ok) {
    let code = "unknown_error";
    let message = `リクエストに失敗しました (${response.status})`;
    let details: unknown;
    try {
      const body = (await response.json()) as {
        error?: { code?: string; message?: string; details?: unknown };
      };
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
      details = body.error?.details;
    } catch {
      // JSON 以外のレスポンスは既定メッセージのまま
    }
    throw new ApiError(response.status, code, message, details);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  health: () => request<{ ok: boolean; db: string }>("/api/health", { auth: false }),
  register: (input: { email: string; password: string; name: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: input, auth: false }),
  login: (input: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: input, auth: false }),
  me: () => request<{ user: User }>("/api/auth/me"),
  projects: {
    list: () => request<{ projects: ResearchProject[] }>("/api/projects"),
    create: (input: { title: string; description?: string; tags?: string[] }) =>
      request<{ project: ResearchProject }>("/api/projects", { method: "POST", body: input }),
    get: (id: string) =>
      request<{ project: ResearchProject; documents: ProjectDocument[]; comparisons: Comparison[]; reports: Report[] }>(
        `/api/projects/${id}`
      ),
    update: (id: string, input: Partial<{ title: string; description: string; status: string; tags: string[] }>) =>
      request<{ project: ResearchProject }>(`/api/projects/${id}`, { method: "PATCH", body: input }),
    archive: (id: string) => request<{ project: ResearchProject }>(`/api/projects/${id}`, { method: "DELETE" }),
    documents: {
      list: (projectId: string) =>
        request<{ projectDocuments: Array<ProjectDocument & { document: SourceDocument | null }> }>(
          `/api/projects/${projectId}/documents`
        ),
      save: (projectId: string, input: { documentId: string; tags?: string[]; importance?: number; userNote?: string }) =>
        request<{ projectDocument: ProjectDocument; document: SourceDocument }>(`/api/projects/${projectId}/documents`, {
          method: "POST",
          body: input
        }),
      update: (
        projectId: string,
        projectDocumentId: string,
        input: Partial<{ tags: string[]; importance: number; userNote: string; status: string }>
      ) =>
        request<{ projectDocument: ProjectDocument }>(`/api/projects/${projectId}/documents/${projectDocumentId}`, {
          method: "PATCH",
          body: input
        }),
      remove: (projectId: string, projectDocumentId: string) =>
        request<void>(`/api/projects/${projectId}/documents/${projectDocumentId}`, { method: "DELETE" })
    }
  },
  search: {
    start: (input: Record<string, unknown>) =>
      request<{ searchQueryId: string; status: string; partialFailures: boolean }>("/api/search", {
        method: "POST",
        body: input
      }),
    get: (id: string) => request<SearchQuery>(`/api/search/${id}`)
  },
  documents: {
    get: (id: string) =>
      request<{ document: SourceDocument; summaries: Array<import("@icrps/contracts").AiSummary> }>(
        `/api/documents/${id}`
      ),
    summarize: (id: string, input: { summaryType: string; language: string }) =>
      request<{ summary: import("@icrps/contracts").AiSummary }>(`/api/documents/${id}/summarize`, {
        method: "POST",
        body: input
      })
  },
  comparisons: {
    create: (projectId: string, input: { title?: string; documentIds: string[]; axes: string[] }) =>
      request<{ comparison: Comparison }>(`/api/projects/${projectId}/comparisons`, { method: "POST", body: input }),
    get: (id: string) => request<{ comparison: Comparison }>(`/api/comparisons/${id}`),
    update: (id: string, input: Partial<{ title: string; axes: string[]; rows: unknown[]; notes: string[] }>) =>
      request<{ comparison: Comparison }>(`/api/comparisons/${id}`, { method: "PATCH", body: input })
  },
  reports: {
    create: (projectId: string, input: { title: string; reportType: string; documentIds?: string[]; comparisonId?: string }) =>
      request<{ report: Report }>(`/api/projects/${projectId}/reports`, { method: "POST", body: input }),
    get: (id: string) => request<{ report: Report }>(`/api/reports/${id}`)
  },
  watch: {
    list: () => request<{ topics: Array<{ id: string; displayName: string; terms: string | null; keyword: string; frequency: string; enabled: boolean; createdAt: string }> }>("/api/watch"),
    create: (input: { displayName: string; terms?: string; keyword: string; frequency: string }) =>
      request<{ topic: { id: string } }>("/api/watch", { method: "POST", body: input }),
    update: (id: string, input: Partial<{ displayName: string; terms: string; keyword: string; frequency: string; enabled: boolean }>) =>
      request<{ topic: { id: string; enabled: boolean } }>(`/api/watch/${id}`, { method: "PATCH", body: input }),
    remove: (id: string) => request<void>(`/api/watch/${id}`, { method: "DELETE" })
  },
  chat: {
    send: (message: string) =>
      request<{ reply: string; cites: Array<{ n: string; title: string; url: string }>; mode: "ai" | "rule" }>("/api/chat", {
        method: "POST",
        body: { message }
      })
  },
  dashboard: {
    stats: () => request<{ stats: DashboardStats }>("/api/dashboard/stats")
  },
  literature: {
    list: (input: { q?: string; source?: string; sourceType?: string; limit?: number; offset?: number }) => {
      const params = new URLSearchParams();
      if (input.q) params.set("q", input.q);
      if (input.source && input.source !== "all") params.set("source", input.source);
      if (input.sourceType && input.sourceType !== "all") params.set("sourceType", input.sourceType);
      params.set("limit", String(input.limit ?? 50));
      params.set("offset", String(input.offset ?? 0));
      return request<{ items: LiteratureItem[]; total: number; limit: number; offset: number }>(
        `/api/literature?${params.toString()}`
      );
    }
  },
  admin: {
    users: () => request<{ users: User[] }>("/api/admin/users"),
    updateRole: (userId: string, role: string) =>
      request<{ user: User }>(`/api/admin/users/${userId}/role`, { method: "PATCH", body: { role } }),
    auditLogs: () => request<{ auditLogs: Array<{ id: string; action: string; createdAt: string; detail: unknown }> }>("/api/admin/audit-logs"),
    ingestRuns: () =>
      request<{ runs: Array<{ id: string; createdAt: string; detail: Record<string, unknown> | null }> }>(
        "/api/admin/ingest/runs"
      ),
    ingestRunNow: () =>
      request<{
        results: Array<{
          source: string;
          fetched: number;
          inserted: number;
          skipped: number;
          status: "ok" | "error";
          error?: string;
        }>;
      }>("/api/admin/ingest/run", { method: "POST" }),
    settings: {
      get: () =>
        request<{
          ai: {
            deepseek: { configured: boolean; model: string };
            anthropic: { configured: boolean; model: string };
            activeProvider: string | null;
          };
        }>("/api/admin/settings"),
      saveAi: (input: {
        deepseek?: { apiKey?: string; model?: string };
        anthropic?: { apiKey?: string; model?: string };
      }) =>
        request<{
          ai: {
            deepseek: { configured: boolean; model: string };
            anthropic: { configured: boolean; model: string };
            activeProvider: string | null;
          };
        }>("/api/admin/settings/ai", { method: "PUT", body: input }),
      testAi: (input: { provider: "deepseek" | "anthropic"; apiKey?: string; model?: string }) =>
        request<{ ok: boolean; message: string; latencyMs: number }>("/api/admin/settings/ai/test", {
          method: "POST",
          body: input
        }),
      clearAi: (provider: "deepseek" | "anthropic") =>
        request<{
          ai: {
            deepseek: { configured: boolean; model: string };
            anthropic: { configured: boolean; model: string };
            activeProvider: string | null;
          };
        }>(`/api/admin/settings/ai/${provider}`, { method: "DELETE" })
    }
  }
};
