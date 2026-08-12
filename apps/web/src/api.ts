import type {
  AuthResponse,
  Comparison,
  DashboardStats,
  ProjectDocument,
  ProjectMember,
  Report,
  ResearchProject,
  SearchQuery,
  SourceDocument,
  Team,
  TeamMember,
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

export interface NotificationItem {
  id: string;
  watchTopicId: string | null;
  sourceDocumentId: string | null;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  queryText: string;
  sourceTypes: string[];
  status: string;
  executedAt: string | null;
  createdAt: string;
  resultCount: number;
  isBookmarked: boolean;
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

async function requestBlob(path: string, options: { method?: string; body?: unknown } = {}): Promise<Blob> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  if (!response.ok) throw new ApiError(response.status, "export_failed", "エクスポートに失敗しました");
  return response.blob();
}

export const api = {
  health: () => request<{ ok: boolean; db: string }>("/api/health", { auth: false }),
  register: (input: { email: string; password: string; name: string }) =>
    request<AuthResponse>("/api/auth/register", { method: "POST", body: input, auth: false }),
  login: (input: { email: string; password: string }) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: input, auth: false }),
  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    request<{ ok: boolean }>("/api/auth/change-password", { method: "POST", body: input }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/api/auth/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: boolean }>("/api/auth/reset-password", { method: "POST", body: { token, newPassword } }),
  magicLink: (email: string) => request<{ ok: boolean }>("/api/auth/magic-link", { method: "POST", body: { email } }),
  magicLinkVerify: (token: string) =>
    request<AuthResponse>("/api/auth/magic-link/verify", { method: "POST", body: { token } }),
  ssoStatus: () => request<{ google: boolean }>("/api/auth/sso", { auth: false }),
  ssoGoogleUrl: () => request<{ url: string }>("/api/auth/sso/google/url", { auth: false }),
  ssoGoogleCallback: (code: string) =>
    request<AuthResponse>(`/api/auth/sso/google/callback?code=${encodeURIComponent(code)}`, { auth: false }),
  me: () => request<{ user: User }>("/api/auth/me"),
  teams: {
    list: () => request<{ teams: Team[] }>("/api/teams"),
    create: (name: string) => request<{ team: Team }>("/api/teams", { method: "POST", body: { name } }),
    rename: (teamId: string, name: string) =>
      request<{ team: Team }>(`/api/teams/${teamId}`, { method: "PATCH", body: { name } }),
    members: {
      list: (teamId: string) => request<{ members: TeamMember[] }>(`/api/teams/${teamId}/members`),
      add: (teamId: string, input: { email: string; role: string }) =>
        request<{ member: TeamMember }>(`/api/teams/${teamId}/members`, { method: "POST", body: input }),
      update: (teamId: string, userId: string, role: string) =>
        request<{ member: TeamMember }>(`/api/teams/${teamId}/members/${userId}`, {
          method: "PATCH",
          body: { role }
        }),
      remove: (teamId: string, userId: string) =>
        request<void>(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" })
    },
    stats: (teamId: string) =>
      request<{
        stats: { memberCount: number; projectCount: number; documentCount: number; reportCount: number; comparisonCount: number };
      }>(`/api/teams/${teamId}/stats`)
  },
  projects: {
    list: () => request<{ projects: ResearchProject[] }>("/api/projects"),
    create: (input: { title: string; description?: string; tags?: string[] }) =>
      request<{ project: ResearchProject }>("/api/projects", { method: "POST", body: input }),
    get: (id: string) =>
      request<{
        project: ResearchProject;
        documents: ProjectDocument[];
        comparisons: Comparison[];
        reports: Report[];
        members: ProjectMember[];
      }>(
        `/api/projects/${id}`
      ),
    update: (id: string, input: Partial<{ title: string; description: string; status: string; tags: string[] }>) =>
      request<{ project: ResearchProject }>(`/api/projects/${id}`, { method: "PATCH", body: input }),
    archive: (id: string) => request<{ project: ResearchProject }>(`/api/projects/${id}`, { method: "DELETE" }),
    transfer: (id: string, email: string) =>
      request<{ project: ResearchProject }>(`/api/projects/${id}/transfer`, { method: "POST", body: { email } }),
    setTeam: (id: string, teamId: string | null) =>
      request<{ project: ResearchProject }>(`/api/projects/${id}/team`, { method: "POST", body: { teamId } }),
    members: {
      list: (projectId: string) => request<{ members: ProjectMember[] }>(`/api/projects/${projectId}/members`),
      add: (projectId: string, input: { email: string; role: string }) =>
        request<{ member: ProjectMember }>(`/api/projects/${projectId}/members`, { method: "POST", body: input }),
      update: (projectId: string, userId: string, role: string) =>
        request<{ member: ProjectMember }>(`/api/projects/${projectId}/members/${userId}`, {
          method: "PATCH",
          body: { role }
        }),
      remove: (projectId: string, userId: string) =>
        request<void>(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" })
    },
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
    get: (id: string) => request<SearchQuery>(`/api/search/${id}`),
    history: (limit = 20) => request<{ history: SearchHistoryItem[] }>(`/api/search/history?limit=${limit}`),
    bookmarks: (limit = 50) => request<{ bookmarks: SearchHistoryItem[] }>(`/api/search/bookmarks?limit=${limit}`),
    bookmark: (id: string, bookmarked: boolean) =>
      request<{ ok: boolean; bookmarked: boolean }>(`/api/search/${id}/bookmark`, {
        method: "PATCH",
        body: { bookmarked }
      })
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
      }),
    reviewSummary: (
      documentId: string,
      summaryId: string,
      input: { status: "pending" | "approved" | "rejected" | "edited"; summaryText?: string }
    ) =>
      request<{ summary: import("@icrps/contracts").AiSummary }>(
        `/api/documents/${documentId}/summaries/${summaryId}`,
        { method: "PATCH", body: input }
      ),
    import: (input: {
      sourceType: string;
      title: string;
      originalTitle?: string | null;
      abstract?: string | null;
      url?: string | null;
      doi?: string | null;
      patentNumber?: string | null;
      publicationNumber?: string | null;
      authors?: string[];
      inventors?: string[];
      applicants?: string[];
      country?: string | null;
      publicationDate?: string | null;
      sourceName?: string | null;
      projectId?: string | null;
    }) =>
      request<{ document: SourceDocument; created: boolean }>("/api/documents/import", {
        method: "POST",
        body: input
      }),
    similar: (id: string, limit = 10) =>
      request<{ items: Array<{ document: SourceDocument; score: number; matchedTerms: string[] }> }>(
        `/api/documents/${id}/similar?limit=${limit}`
      ),
    citations: (id: string) =>
      request<{
        citation: {
          doi: string | null;
          citedByCount: number | null;
          referenceCount: number | null;
          references: Array<{ doi: string; title?: string }>;
          citedBy: Array<{ doi?: string; title?: string; openalexId?: string }>;
          fetchedAt: string;
        };
      }>(`/api/documents/${id}/citations`),
    patentFamily: (id: string) =>
      request<{
        family: {
          mode: "ops" | "db" | "none";
          familyId: string | null;
          members: Array<{
            patentNumber: string;
            country: string | null;
            kind: string | null;
            publicationDate: string | null;
            title: string | null;
            applicants: string[];
            source: "ops" | "db";
          }>;
          note?: string;
        };
      }>(`/api/documents/${id}/patent-family`)
  },
  comparisons: {
    create: (projectId: string, input: { title?: string; documentIds: string[]; axes: string[] }) =>
      request<{ comparison: Comparison }>(`/api/projects/${projectId}/comparisons`, { method: "POST", body: input }),
    get: (id: string) => request<{ comparison: Comparison }>(`/api/comparisons/${id}`),
    update: (id: string, input: Partial<{ title: string; axes: string[]; rows: unknown[]; notes: string[] }>) =>
      request<{ comparison: Comparison }>(`/api/comparisons/${id}`, { method: "PATCH", body: input })
  },
  reports: {
    create: (
      projectId: string,
      input: { title: string; reportType: string; documentIds?: string[]; comparisonId?: string; audience?: string }
    ) =>
      request<{ report: Report }>(`/api/projects/${projectId}/reports`, { method: "POST", body: input }),
    get: (id: string) => request<{ report: Report }>(`/api/reports/${id}`),
    exportFile: (id: string, format: "markdown" | "word" | "excel" | "html") =>
      requestBlob(`/api/reports/${id}/export?format=${format}`, { method: "POST" })
  },
  watch: {
    list: () => request<{ topics: Array<{ id: string; displayName: string; terms: string | null; keyword: string; frequency: string; enabled: boolean; createdAt: string }> }>("/api/watch"),
    create: (input: { displayName: string; terms?: string; keyword: string; frequency: string }) =>
      request<{ topic: { id: string } }>("/api/watch", { method: "POST", body: input }),
    update: (id: string, input: Partial<{ displayName: string; terms: string; keyword: string; frequency: string; enabled: boolean }>) =>
      request<{ topic: { id: string; enabled: boolean } }>(`/api/watch/${id}`, { method: "PATCH", body: input }),
    remove: (id: string) => request<void>(`/api/watch/${id}`, { method: "DELETE" }),
    runNow: () =>
      request<{
        results: Array<{ topicId: string; keyword: string; fetched: number; inserted: number; notified: number }>;
        message?: string;
      }>("/api/watch/run", { method: "POST" })
  },
  notifications: {
    list: (limit = 50) => request<{ notifications: NotificationItem[] }>(`/api/notifications?limit=${limit}`),
    unreadCount: () => request<{ count: number }>("/api/notifications/unread-count"),
    markRead: (id: string) => request<{ ok: boolean }>(`/api/notifications/${id}/read`, { method: "POST" }),
    markAllRead: () => request<{ ok: boolean; count: number }>("/api/notifications/read-all", { method: "POST" })
  },
  chat: {
    send: (message: string) =>
      request<{ reply: string; cites: Array<{ n: string; title: string; url: string }>; mode: "ai" | "rule" }>("/api/chat", {
        method: "POST",
        body: { message }
      })
  },
  fit: {
    check: (input: {
      workType: string;
      environment: string;
      designStrength: string;
      cover: string;
      serviceLife: string;
      co2Target: string;
      candidates: string;
    }) =>
      request<{
        mode: "rule";
        note: string;
        items: Array<{
          candidate: string;
          verdict: "有力" | "条件付き可" | "要確認";
          confidence: number;
          docs: Array<{
            id: string;
            title: string;
            abstract: string | null;
            url: string | null;
            sourceName: string | null;
            score: number;
            matchedTerms: string[];
          }>;
        }>;
      }>("/api/fit", { method: "POST", body: input })
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
    auditLogs: () =>
      request<{
        auditLogs: Array<{
          id: string;
          userId: string | null;
          userName: string | null;
          action: string;
          createdAt: string;
          detail: unknown;
        }>;
      }>("/api/admin/audit-logs"),
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
    stats: () =>
      request<{
        stats: {
          totalUsers: number;
          adminUsers: number;
          totalProjects: number;
          totalDocuments: number;
          documentsByType: Array<{ sourceType: string; count: number }>;
          totalSearches: number;
          totalComparisons: number;
          totalReports: number;
          totalWatchTopics: number;
          ingestRuns: number;
          lastIngestRunAt: string | null;
        };
      }>("/api/admin/stats"),
    usage: (days = 30) =>
      request<{
        usage: {
          totalCalls: number;
          totalInputTokens: number;
          totalOutputTokens: number;
          totalCost: number;
          byModel: Array<{ provider: string; model: string; calls: number; inputTokens: number; outputTokens: number; cost: number }>;
          recent: Array<{
            id: string;
            action: string;
            provider: string;
            model: string;
            inputTokens: number;
            outputTokens: number;
            costEstimate: number;
            createdAt: string;
          }>;
        };
      }>(`/api/admin/usage?days=${days}`),
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
