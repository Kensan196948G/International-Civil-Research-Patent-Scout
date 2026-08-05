// 共有型定義：API・Web・Worker 間で共通利用する。

export type Role = "admin" | "user" | "viewer";
export type SourceType = "web" | "paper" | "patent" | "pdf";
export type LanguageMode = "ja" | "en" | "auto" | "bilingual";
export type SearchStatus = "queued" | "running" | "completed" | "failed";
export type ProjectStatus = "active" | "archived" | "completed";
export type SummaryType = "short" | "detailed" | "technical" | "patent";
export type ReportType =
  | "summary"
  | "technical_comparison"
  | "patent_survey"
  | "paper_review"
  | "proposal_research";
export type ProjectDocumentStatus = "saved" | "reviewed" | "excluded";
export type ProjectMemberRole = "viewer" | "editor" | "admin";
export type TeamMemberRole = "viewer" | "editor" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ResearchProject {
  id: string;
  ownerUserId: string;
  title: string;
  description: string | null;
  status: ProjectStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  teamId?: string | null;
}

export interface Team {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamMemberRole;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: ProjectMemberRole;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    name: string;
  } | null;
}

export interface SearchParams {
  query: string;
  languageMode?: LanguageMode;
  sourceTypes?: SourceType[];
  countries?: string[];
  yearFrom?: number;
  yearTo?: number;
  includeSynonyms?: boolean;
  includeTranslation?: boolean;
  maxResults?: number;
}

export interface ExpandedKeywords {
  originalQuery: string;
  translatedQueries: string[];
  synonymsJa: string[];
  synonymsEn: string[];
  recommendedSearchQueries: string[];
}

export interface SearchConnectorResult {
  externalId?: string;
  sourceType: SourceType;
  title: string;
  originalTitle?: string;
  abstract?: string;
  snippet?: string;
  url?: string;
  doi?: string;
  patentNumber?: string;
  publicationNumber?: string;
  patentStatus?: string;
  classifications?: string[];
  authors?: string[];
  inventors?: string[];
  applicants?: string[];
  country?: string;
  publicationDate?: string;
  sourceName?: string;
  score?: number;
}

export interface SourceDocument {
  id: string;
  sourceType: SourceType;
  title: string;
  originalTitle: string | null;
  abstract: string | null;
  bodyText: string | null;
  url: string | null;
  doi: string | null;
  patentNumber: string | null;
  publicationNumber: string | null;
  patentStatus?: string | null;
  classifications?: string[] | null;
  authors: string[] | null;
  inventors: string[] | null;
  applicants: string[] | null;
  country: string | null;
  publicationDate: string | null;
  sourceName: string | null;
  licenseNote: string | null;
  contentHash: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResultItem {
  documentId: string;
  sourceType: SourceType;
  title: string;
  originalTitle: string | null;
  summary: string | null;
  url: string | null;
  publicationDate: string | null;
  relevanceScore: number | null;
  doi: string | null;
  patentNumber: string | null;
  patentStatus?: string | null;
  country?: string | null;
  inventors?: string[] | null;
  applicants?: string[] | null;
  sourceName: string | null;
}

export interface SearchQuery {
  id: string;
  userId: string;
  projectId: string | null;
  queryText: string;
  expandedQueries: ExpandedKeywords | null;
  sourceTypes: SourceType[];
  filters: Record<string, unknown> | null;
  status: SearchStatus;
  executedAt: string | null;
  createdAt: string;
  results?: SearchResultItem[];
  failureSources?: string[];
}

export interface ProjectDocument {
  id: string;
  projectId: string;
  sourceDocumentId: string;
  userNote: string | null;
  tags: string[];
  importance: number | null;
  status: ProjectDocumentStatus;
  createdAt: string;
  updatedAt: string;
  document?: SourceDocument;
}

export interface Evidence {
  claim: string;
  sourceUrl: string;
  quote: string;
}

export interface AiSummary {
  id: string;
  sourceDocumentId: string;
  summaryType: SummaryType;
  language: string;
  summaryText: string;
  keyPoints: string[] | null;
  merits: string[] | null;
  demerits: string[] | null;
  applicationConditions: string[] | null;
  risks: string[] | null;
  citations: Evidence[] | null;
  modelName: string | null;
  promptVersion: string | null;
  createdAt: string;
}

export interface ComparisonRow {
  technologyName: string;
  values: Record<string, string>;
  sourceDocumentIds: string[];
}

export interface Comparison {
  id: string;
  projectId: string;
  title: string;
  comparisonAxes: string[];
  rows: ComparisonRow[];
  notes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  projectId: string;
  title: string;
  reportType: ReportType;
  contentMarkdown: string;
  exportFileUrl: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  detail: Record<string, unknown> | null;
  createdAt: string;
}

export interface DashboardStats {
  projectCount: number;
  savedDocumentCount: number;
  reportCount: number;
  searchCount: number;
  recentProjects: ResearchProject[];
  recentReports: Report[];
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export const REPORT_TYPES: Record<ReportType, string> = {
  summary: "調査概要レポート",
  technical_comparison: "技術比較レポート",
  patent_survey: "特許調査レポート",
  paper_review: "論文レビュー",
  proposal_research: "技術提案下調べ"
};

export const SOURCE_TYPE_LABELS: Record<SourceType, string> = {
  web: "一般Web",
  paper: "論文",
  patent: "特許",
  pdf: "PDF"
};

export const DISCLAIMER =
  "本システムのAI要約・比較結果は、公開情報に基づく調査支援情報です。特許の権利判断、設計判断、施工可否、安全性判断を保証するものではありません。重要な判断には、原典確認および専門家確認を行ってください。";
