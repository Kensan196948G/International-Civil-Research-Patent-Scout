import type {
  AiSummary,
  AuditLog,
  Comparison,
  ProjectDocument,
  Report,
  ResearchProject,
  Role,
  SearchConnectorResult,
  SearchQuery,
  SearchResultItem,
  SourceDocument,
  User
} from "@icrps/contracts";
import { randomUUID } from "node:crypto";
import type { Db } from "./db.js";
import { parseJsonArray, parseJsonObject } from "./db.js";

// ---- row mappers ----

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    role: String(row.role) as Role,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapProject(row: Record<string, unknown>): ResearchProject {
  return {
    id: String(row.id),
    ownerUserId: String(row.owner_user_id),
    title: String(row.title),
    description: row.description == null ? null : String(row.description),
    status: String(row.status) as ResearchProject["status"],
    tags: parseJsonArray(row.tags) as string[],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapDocument(row: Record<string, unknown>): SourceDocument {
  return {
    id: String(row.id),
    sourceType: String(row.source_type) as SourceDocument["sourceType"],
    title: String(row.title),
    originalTitle: row.original_title == null ? null : String(row.original_title),
    abstract: row.abstract == null ? null : String(row.abstract),
    bodyText: row.body_text == null ? null : String(row.body_text),
    url: row.url == null ? null : String(row.url),
    doi: row.doi == null ? null : String(row.doi),
    patentNumber: row.patent_number == null ? null : String(row.patent_number),
    publicationNumber: row.publication_number == null ? null : String(row.publication_number),
    authors: parseJsonArray(row.authors) as string[] | null,
    inventors: parseJsonArray(row.inventors) as string[] | null,
    applicants: parseJsonArray(row.applicants) as string[] | null,
    country: row.country == null ? null : String(row.country),
    publicationDate: row.publication_date == null ? null : String(row.publication_date),
    sourceName: row.source_name == null ? null : String(row.source_name),
    licenseNote: row.license_note == null ? null : String(row.license_note),
    contentHash: row.content_hash == null ? null : String(row.content_hash),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapSummary(row: Record<string, unknown>): AiSummary {
  return {
    id: String(row.id),
    sourceDocumentId: String(row.source_document_id),
    summaryType: String(row.summary_type) as AiSummary["summaryType"],
    language: String(row.language),
    summaryText: String(row.summary_text),
    keyPoints: parseJsonArray(row.key_points) as string[] | null,
    merits: parseJsonArray(row.merits) as string[] | null,
    demerits: parseJsonArray(row.demerits) as string[] | null,
    applicationConditions: parseJsonArray(row.application_conditions) as string[] | null,
    risks: parseJsonArray(row.risks) as string[] | null,
    citations: parseJsonArray(row.citations) as AiSummary["citations"],
    modelName: row.model_name == null ? null : String(row.model_name),
    promptVersion: row.prompt_version == null ? null : String(row.prompt_version),
    createdAt: String(row.created_at)
  };
}

function mapComparison(row: Record<string, unknown>): Comparison {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    comparisonAxes: parseJsonArray(row.comparison_axes) as string[],
    rows: parseJsonArray(row.rows) as Comparison["rows"],
    notes: parseJsonArray(row.notes) as string[],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapReport(row: Record<string, unknown>): Report {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: String(row.title),
    reportType: String(row.report_type) as Report["reportType"],
    contentMarkdown: String(row.content_markdown),
    exportFileUrl: row.export_file_url == null ? null : String(row.export_file_url),
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

// ---- users ----

export async function findUserByEmail(db: Db, email: string): Promise<User | null> {
  const rows = await db("SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1", [email]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function findUserCredentialsByEmail(
  db: Db,
  email: string
): Promise<{ user: User; passwordHash: string } | null> {
  const rows = await db("SELECT * FROM users WHERE lower(email) = lower($1) LIMIT 1", [email]);
  const row = rows[0];
  if (!row) return null;
  return { user: mapUser(row), passwordHash: String(row.password_hash) };
}

export async function findUserById(db: Db, id: string): Promise<User | null> {
  const rows = await db("SELECT * FROM users WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapUser(rows[0]) : null;
}

export async function createUser(
  db: Db,
  input: { email: string; name: string; passwordHash: string; role?: Role }
): Promise<User> {
  const rows = await db(
    `INSERT INTO users (email, name, password_hash, role)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.email, input.name, input.passwordHash, input.role ?? "user"]
  );
  return mapUser(rows[0]!);
}

export async function listUsers(db: Db): Promise<User[]> {
  const rows = await db("SELECT * FROM users ORDER BY created_at DESC LIMIT 200");
  return rows.map(mapUser);
}

export async function updateUserRole(db: Db, id: string, role: Role): Promise<User | null> {
  const rows = await db(
    "UPDATE users SET role = $1 WHERE id = $2 RETURNING *",
    [role, id]
  );
  return rows[0] ? mapUser(rows[0]) : null;
}

// ---- projects ----

export async function listProjects(db: Db, ownerUserId: string): Promise<ResearchProject[]> {
  const rows = await db(
    "SELECT * FROM research_projects WHERE owner_user_id = $1 ORDER BY created_at DESC LIMIT 200",
    [ownerUserId]
  );
  return rows.map(mapProject);
}

export async function createProject(
  db: Db,
  input: { ownerUserId: string; title: string; description?: string | null; tags?: string[] }
): Promise<ResearchProject> {
  const rows = await db(
    `INSERT INTO research_projects (owner_user_id, title, description, tags)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.ownerUserId, input.title, input.description ?? null, JSON.stringify(input.tags ?? [])]
  );
  return mapProject(rows[0]!);
}

export async function getProject(db: Db, ownerUserId: string, projectId: string): Promise<ResearchProject | null> {
  const rows = await db(
    "SELECT * FROM research_projects WHERE id = $1 AND owner_user_id = $2 LIMIT 1",
    [projectId, ownerUserId]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function updateProject(
  db: Db,
  projectId: string,
  input: { title?: string; description?: string | null; status?: ResearchProject["status"]; tags?: string[] }
): Promise<ResearchProject | null> {
  const rows = await db(
    `UPDATE research_projects
     SET title = COALESCE($2, title),
         description = CASE WHEN $3::boolean THEN $4 ELSE description END,
         status = COALESCE($5, status),
         tags = COALESCE($6, tags)
     WHERE id = $1 RETURNING *`,
    [
      projectId,
      input.title ?? null,
      input.description !== undefined,
      input.description ?? null,
      input.status ?? null,
      input.tags ? JSON.stringify(input.tags) : null
    ]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function archiveProject(db: Db, projectId: string): Promise<ResearchProject | null> {
  const rows = await db(
    "UPDATE research_projects SET status = 'archived' WHERE id = $1 RETURNING *",
    [projectId]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

// ---- search queries ----

export async function createSearchQuery(
  db: Db,
  input: { userId: string; projectId: string | null; queryText: string; sourceTypes: string[]; filters: Record<string, unknown> | null }
): Promise<SearchQuery> {
  const rows = await db(
    `INSERT INTO search_queries (user_id, project_id, query_text, source_types, filters, status)
     VALUES ($1, $2, $3, $4, $5, 'queued') RETURNING *`,
    [input.userId, input.projectId, input.queryText, JSON.stringify(input.sourceTypes), input.filters ? JSON.stringify(input.filters) : null]
  );
  return mapSearchQuery(rows[0]!);
}

function mapSearchQuery(row: Record<string, unknown>): SearchQuery {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: row.project_id == null ? null : String(row.project_id),
    queryText: String(row.query_text),
    expandedQueries: parseJsonObject(row.expanded_queries) as SearchQuery["expandedQueries"],
    sourceTypes: parseJsonArray(row.source_types, ["web", "paper", "patent"]) as SearchQuery["sourceTypes"],
    filters: parseJsonObject(row.filters) as Record<string, unknown> | null,
    status: String(row.status) as SearchQuery["status"],
    executedAt: row.executed_at == null ? null : String(row.executed_at),
    createdAt: String(row.created_at),
    failureSources: parseJsonArray(row.failure_sources) as string[]
  };
}

export async function getSearchQuery(db: Db, id: string): Promise<SearchQuery | null> {
  const rows = await db("SELECT * FROM search_queries WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapSearchQuery(rows[0]) : null;
}

export async function setSearchQueryRunning(db: Db, id: string): Promise<void> {
  await db("UPDATE search_queries SET status = 'running' WHERE id = $1", [id]);
}

export async function completeSearchQuery(
  db: Db,
  id: string,
  expanded: SearchQuery["expandedQueries"],
  failureSources: string[]
): Promise<void> {
  await db(
    `UPDATE search_queries
     SET status = 'completed', expanded_queries = $2, failure_sources = $3, executed_at = now()
     WHERE id = $1`,
    [id, expanded ? JSON.stringify(expanded) : null, JSON.stringify(failureSources)]
  );
}

export async function failSearchQuery(db: Db, id: string, failureSources: string[]): Promise<void> {
  await db(
    "UPDATE search_queries SET status = 'failed', failure_sources = $2 WHERE id = $1",
    [id, JSON.stringify(failureSources)]
  );
}

export async function listSearchResults(db: Db, searchQueryId: string): Promise<SearchResultItem[]> {
  const rows = await db(
    `SELECT d.id AS document_id, d.source_type, d.title, d.original_title, d.abstract,
            d.url, d.publication_date, d.doi, d.patent_number, d.source_name,
            sr.relevance_score
     FROM search_results sr
     JOIN source_documents d ON d.id = sr.source_document_id
     WHERE sr.search_query_id = $1
     ORDER BY sr.rank ASC`,
    [searchQueryId]
  );
  return rows.map((r) => ({
    documentId: String(r.document_id),
    sourceType: String(r.source_type) as SearchResultItem["sourceType"],
    title: String(r.title),
    originalTitle: r.original_title == null ? null : String(r.original_title),
    summary: r.abstract == null ? null : String(r.abstract),
    url: r.url == null ? null : String(r.url),
    publicationDate: r.publication_date == null ? null : String(r.publication_date),
    relevanceScore: r.relevance_score == null ? null : Number(r.relevance_score),
    doi: r.doi == null ? null : String(r.doi),
    patentNumber: r.patent_number == null ? null : String(r.patent_number),
    sourceName: r.source_name == null ? null : String(r.source_name)
  }));
}

// ---- source documents ----

export async function findDocumentByKey(
  db: Db,
  keys: { doi?: string | null; patentNumber?: string | null; url?: string | null; contentHash?: string | null }
): Promise<SourceDocument | null> {
  if (keys.doi) {
    const rows = await db("SELECT * FROM source_documents WHERE doi = $1 LIMIT 1", [keys.doi]);
    if (rows[0]) return mapDocument(rows[0]);
  }
  if (keys.patentNumber) {
    const rows = await db("SELECT * FROM source_documents WHERE patent_number = $1 LIMIT 1", [keys.patentNumber]);
    if (rows[0]) return mapDocument(rows[0]);
  }
  if (keys.contentHash) {
    const rows = await db("SELECT * FROM source_documents WHERE content_hash = $1 LIMIT 1", [keys.contentHash]);
    if (rows[0]) return mapDocument(rows[0]);
  }
  if (keys.url) {
    const rows = await db("SELECT * FROM source_documents WHERE url = $1 LIMIT 1", [keys.url]);
    if (rows[0]) return mapDocument(rows[0]);
  }
  return null;
}

export async function insertDocument(db: Db, result: SearchConnectorResult, contentHash: string | null): Promise<SourceDocument> {
  const rows = await db(
    `INSERT INTO source_documents
       (source_type, title, original_title, abstract, url, doi, patent_number, publication_number,
        authors, inventors, applicants, country, publication_date, source_name, license_note, content_hash)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     RETURNING *`,
    [
      result.sourceType,
      result.title,
      result.originalTitle ?? null,
      result.abstract ?? result.snippet ?? null,
      result.url ?? null,
      result.doi ?? null,
      result.patentNumber ?? null,
      result.publicationNumber ?? null,
      result.authors?.length ? JSON.stringify(result.authors) : null,
      result.inventors?.length ? JSON.stringify(result.inventors) : null,
      result.applicants?.length ? JSON.stringify(result.applicants) : null,
      result.country ?? null,
      result.publicationDate ?? null,
      result.sourceName ?? null,
      "公開メタデータ・要旨を中心に利用（本文は原則保存しない）",
      contentHash
    ]
  );
  return mapDocument(rows[0]!);
}

export async function getDocumentById(db: Db, id: string): Promise<SourceDocument | null> {
  const rows = await db("SELECT * FROM source_documents WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapDocument(rows[0]) : null;
}

export async function getDocumentsByIds(db: Db, ids: string[]): Promise<SourceDocument[]> {
  if (ids.length === 0) return [];
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  const rows = await db(`SELECT * FROM source_documents WHERE id IN (${placeholders})`, ids);
  return rows.map(mapDocument);
}

export async function insertSearchResult(
  db: Db,
  input: { searchQueryId: string; sourceDocumentId: string; rank: number; relevanceScore: number; matchedKeywords: string[] }
): Promise<void> {
  await db(
    `INSERT INTO search_results (search_query_id, source_document_id, rank, relevance_score, matched_keywords)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (search_query_id, source_document_id) DO UPDATE
       SET rank = EXCLUDED.rank, relevance_score = EXCLUDED.relevance_score, matched_keywords = EXCLUDED.matched_keywords`,
    [input.searchQueryId, input.sourceDocumentId, input.rank, input.relevanceScore, JSON.stringify(input.matchedKeywords)]
  );
}

// ---- project documents ----

export async function saveProjectDocument(
  db: Db,
  input: {
    projectId: string;
    sourceDocumentId: string;
    tags?: string[];
    importance?: number | null;
    userNote?: string | null;
    status?: ProjectDocument["status"];
  }
): Promise<ProjectDocument> {
  const rows = await db(
    `INSERT INTO project_documents (project_id, source_document_id, tags, importance, user_note, status)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (project_id, source_document_id) DO UPDATE
       SET tags = EXCLUDED.tags,
           importance = EXCLUDED.importance,
           user_note = EXCLUDED.user_note,
           status = EXCLUDED.status,
           updated_at = now()
     RETURNING *`,
    [
      input.projectId,
      input.sourceDocumentId,
      JSON.stringify(input.tags ?? []),
      input.importance ?? null,
      input.userNote ?? null,
      input.status ?? "saved"
    ]
  );
  return mapProjectDocument(rows[0]!);
}

function mapProjectDocument(row: Record<string, unknown>): ProjectDocument {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    sourceDocumentId: String(row.source_document_id),
    userNote: row.user_note == null ? null : String(row.user_note),
    tags: parseJsonArray(row.tags) as string[],
    importance: row.importance == null ? null : Number(row.importance),
    status: String(row.status) as ProjectDocument["status"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

export async function listProjectDocuments(db: Db, projectId: string): Promise<ProjectDocument[]> {
  const rows = await db(
    "SELECT * FROM project_documents WHERE project_id = $1 ORDER BY created_at DESC LIMIT 500",
    [projectId]
  );
  return rows.map(mapProjectDocument);
}

export async function getProjectDocument(db: Db, id: string): Promise<ProjectDocument | null> {
  const rows = await db("SELECT * FROM project_documents WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapProjectDocument(rows[0]) : null;
}

export async function updateProjectDocument(
  db: Db,
  id: string,
  input: { tags?: string[]; importance?: number | null; userNote?: string | null; status?: ProjectDocument["status"] }
): Promise<ProjectDocument | null> {
  const rows = await db(
    `UPDATE project_documents
     SET tags = COALESCE($2, tags),
         importance = COALESCE($3, importance),
         user_note = COALESCE($4, user_note),
         status = COALESCE($5, status),
         updated_at = now()
     WHERE id = $1 RETURNING *`,
    [
      id,
      input.tags ? JSON.stringify(input.tags) : null,
      input.importance ?? null,
      input.userNote ?? null,
      input.status ?? null
    ]
  );
  return rows[0] ? mapProjectDocument(rows[0]) : null;
}

export async function deleteProjectDocument(db: Db, id: string): Promise<boolean> {
  const rows = await db("DELETE FROM project_documents WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}

// ---- ai summaries ----

export async function getSummary(
  db: Db,
  documentId: string,
  summaryType: string,
  language: string
): Promise<AiSummary | null> {
  const rows = await db(
    `SELECT * FROM ai_summaries
     WHERE source_document_id = $1 AND summary_type = $2 AND language = $3
     ORDER BY created_at DESC LIMIT 1`,
    [documentId, summaryType, language]
  );
  return rows[0] ? mapSummary(rows[0]) : null;
}

export async function insertSummary(
  db: Db,
  input: {
    sourceDocumentId: string;
    summaryType: string;
    language: string;
    summaryText: string;
    keyPoints?: string[] | null;
    merits?: string[] | null;
    demerits?: string[] | null;
    applicationConditions?: string[] | null;
    risks?: string[] | null;
    citations?: unknown[] | null;
    modelName?: string | null;
    promptVersion?: string | null;
  }
): Promise<AiSummary> {
  const rows = await db(
    `INSERT INTO ai_summaries
       (source_document_id, summary_type, language, summary_text, key_points, merits, demerits,
        application_conditions, risks, citations, model_name, prompt_version)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
    [
      input.sourceDocumentId,
      input.summaryType,
      input.language,
      input.summaryText,
      input.keyPoints ? JSON.stringify(input.keyPoints) : null,
      input.merits ? JSON.stringify(input.merits) : null,
      input.demerits ? JSON.stringify(input.demerits) : null,
      input.applicationConditions ? JSON.stringify(input.applicationConditions) : null,
      input.risks ? JSON.stringify(input.risks) : null,
      input.citations ? JSON.stringify(input.citations) : null,
      input.modelName ?? null,
      input.promptVersion ?? null
    ]
  );
  return mapSummary(rows[0]!);
}

export async function listSummaries(db: Db, documentId: string): Promise<AiSummary[]> {
  const rows = await db(
    "SELECT * FROM ai_summaries WHERE source_document_id = $1 ORDER BY created_at DESC LIMIT 20",
    [documentId]
  );
  return rows.map(mapSummary);
}

// ---- comparisons ----

export async function createComparison(
  db: Db,
  input: { projectId: string; title: string; axes: string[]; rows: unknown[]; notes?: string[] }
): Promise<Comparison> {
  const rows = await db(
    `INSERT INTO comparisons (project_id, title, comparison_axes, rows, notes)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [input.projectId, input.title, JSON.stringify(input.axes), JSON.stringify(input.rows), JSON.stringify(input.notes ?? [])]
  );
  return mapComparison(rows[0]!);
}

export async function getComparison(db: Db, id: string): Promise<Comparison | null> {
  const rows = await db("SELECT * FROM comparisons WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapComparison(rows[0]) : null;
}

export async function listComparisonsByProject(db: Db, projectId: string): Promise<Comparison[]> {
  const rows = await db(
    "SELECT * FROM comparisons WHERE project_id = $1 ORDER BY created_at DESC LIMIT 100",
    [projectId]
  );
  return rows.map(mapComparison);
}

export async function updateComparison(
  db: Db,
  id: string,
  input: { title?: string; axes?: string[]; rows?: unknown[]; notes?: string[] }
): Promise<Comparison | null> {
  const rows = await db(
    `UPDATE comparisons
     SET title = COALESCE($2, title),
         comparison_axes = COALESCE($3, comparison_axes),
         rows = COALESCE($4, rows),
         notes = COALESCE($5, notes),
         updated_at = now()
     WHERE id = $1 RETURNING *`,
    [
      id,
      input.title ?? null,
      input.axes ? JSON.stringify(input.axes) : null,
      input.rows ? JSON.stringify(input.rows) : null,
      input.notes ? JSON.stringify(input.notes) : null
    ]
  );
  return rows[0] ? mapComparison(rows[0]) : null;
}

// ---- reports ----

export async function createReport(
  db: Db,
  input: { projectId: string; title: string; reportType: string; contentMarkdown: string; createdBy: string }
): Promise<Report> {
  const rows = await db(
    `INSERT INTO reports (project_id, title, report_type, content_markdown, created_by)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [input.projectId, input.title, input.reportType, input.contentMarkdown, input.createdBy]
  );
  return mapReport(rows[0]!);
}

export async function getReport(db: Db, id: string): Promise<Report | null> {
  const rows = await db("SELECT * FROM reports WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapReport(rows[0]) : null;
}

export async function listReportsByProject(db: Db, projectId: string): Promise<Report[]> {
  const rows = await db(
    "SELECT * FROM reports WHERE project_id = $1 ORDER BY created_at DESC LIMIT 100",
    [projectId]
  );
  return rows.map(mapReport);
}

// ---- dashboard / audit ----

export async function getDashboardStats(db: Db, userId: string): Promise<{
  projectCount: number;
  savedDocumentCount: number;
  reportCount: number;
  searchCount: number;
  recentProjects: ResearchProject[];
  recentReports: Report[];
}> {
  const [projectCount, savedDocumentCount, reportCount, searchCount] = await Promise.all([
    db("SELECT count(*)::int AS c FROM research_projects WHERE owner_user_id = $1", [userId]),
    db(
      `SELECT count(*)::int AS c FROM project_documents pd
       JOIN research_projects p ON p.id = pd.project_id
       WHERE p.owner_user_id = $1`,
      [userId]
    ),
    db(
      `SELECT count(*)::int AS c FROM reports r
       JOIN research_projects p ON p.id = r.project_id
       WHERE p.owner_user_id = $1`,
      [userId]
    ),
    db("SELECT count(*)::int AS c FROM search_queries WHERE user_id = $1", [userId])
  ]);
  const recentProjects = (await db(
    "SELECT * FROM research_projects WHERE owner_user_id = $1 ORDER BY updated_at DESC LIMIT 5",
    [userId]
  )).map(mapProject);
  const recentReports = (await db(
    `SELECT r.* FROM reports r
     JOIN research_projects p ON p.id = r.project_id
     WHERE p.owner_user_id = $1 ORDER BY r.created_at DESC LIMIT 5`,
    [userId]
  )).map(mapReport);
  return {
    projectCount: Number(projectCount[0]?.c ?? 0),
    savedDocumentCount: Number(savedDocumentCount[0]?.c ?? 0),
    reportCount: Number(reportCount[0]?.c ?? 0),
    searchCount: Number(searchCount[0]?.c ?? 0),
    recentProjects,
    recentReports
  };
}

export async function listAuditLogs(db: Db, limit = 100): Promise<AuditLog[]> {
  const rows = await db("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1", [limit]);
  return rows.map((row) => ({
    id: String(row.id),
    userId: row.user_id == null ? null : String(row.user_id),
    action: String(row.action),
    resourceType: row.resource_type == null ? null : String(row.resource_type),
    resourceId: row.resource_id == null ? null : String(row.resource_id),
    detail: parseJsonObject(row.detail) as Record<string, unknown> | null,
    createdAt: String(row.created_at)
  }));
}

// ---- app settings ----

export async function getAppSetting(db: Db, key: string): Promise<Record<string, unknown> | null> {
  const rows = await db("SELECT value FROM app_settings WHERE key = $1 LIMIT 1", [key]);
  const row = rows[0];
  if (!row) return null;
  return parseJsonObject(row.value) as Record<string, unknown>;
}

export async function setAppSetting(db: Db, key: string, value: Record<string, unknown>): Promise<void> {
  await db(
    `INSERT INTO app_settings (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [key, JSON.stringify(value)]
  );
}

export async function deleteAppSetting(db: Db, key: string): Promise<void> {
  await db("DELETE FROM app_settings WHERE key = $1", [key]);
}

export function newId(): string {
  return randomUUID();
}
