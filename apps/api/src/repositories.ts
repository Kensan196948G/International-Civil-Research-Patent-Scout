import type {
  AiSummary,
  AuditLog,
  Comparison,
  ProjectDocument,
  ProjectMember,
  ProjectMemberRole,
  Report,
  ResearchProject,
  Role,
  SearchConnectorResult,
  SearchQuery,
  SearchResultItem,
  SourceDocument,
  Team,
  TeamMember,
  TeamMemberRole,
  User
} from "@icrps/contracts";
import { randomUUID } from "node:crypto";
import type { Db } from "./db.js";
import { parseJsonArray, parseJsonObject } from "./db.js";
import { normalizeClassifications } from "./classification.js";

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
    updatedAt: String(row.updated_at),
    teamId: row.team_id == null ? null : String(row.team_id)
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
    patentStatus: row.patent_status == null ? null : String(row.patent_status),
    classifications: parseJsonArray(row.classifications) as string[] | null,
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
    status: row.status == null ? "pending" : (String(row.status) as AiSummary["status"]),
    reviewedBy: row.reviewed_by == null ? null : String(row.reviewed_by),
    reviewedAt: row.reviewed_at == null ? null : String(row.reviewed_at),
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

/** MVP 公開デモのバイパス先として使う、最も古い admin ユーザー */
export async function findFirstAdminUser(db: Db): Promise<User | null> {
  const rows = await db("SELECT * FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1", []);
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

export async function updateUserPassword(db: Db, id: string, passwordHash: string): Promise<User | null> {
  const rows = await db("UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING *", [passwordHash, id]);
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

export async function listProjectsForUser(db: Db, userId: string): Promise<ResearchProject[]> {
  const rows = await db(
    `SELECT DISTINCT p.*
     FROM research_projects p
     LEFT JOIN project_members pm ON pm.project_id = p.id
     LEFT JOIN team_members tm ON tm.team_id = p.team_id
     WHERE p.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
     ORDER BY p.created_at DESC
     LIMIT 200`,
    [userId]
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

export async function getProjectById(db: Db, projectId: string): Promise<ResearchProject | null> {
  const rows = await db("SELECT * FROM research_projects WHERE id = $1 LIMIT 1", [projectId]);
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

// ---- project members ----

function mapProjectMember(row: Record<string, unknown>): ProjectMember {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    userId: String(row.user_id),
    role: String(row.role) as ProjectMemberRole,
    createdAt: String(row.created_at),
    user: row.user_id
      ? {
          id: String(row.user_id),
          email: row.email == null ? "" : String(row.email),
          name: row.name == null ? "" : String(row.name)
        }
      : null
  };
}

export async function listProjectMembers(db: Db, projectId: string): Promise<ProjectMember[]> {
  const rows = await db(
    `SELECT pm.*, u.email, u.name
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
     ORDER BY pm.created_at ASC`,
    [projectId]
  );
  return rows.map(mapProjectMember);
}

export async function getProjectMembership(
  db: Db,
  projectId: string,
  userId: string
): Promise<ProjectMember | null> {
  const rows = await db(
    `SELECT pm.*, u.email, u.name
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1 AND pm.user_id = $2 LIMIT 1`,
    [projectId, userId]
  );
  return rows[0] ? mapProjectMember(rows[0]) : null;
}

export async function addProjectMember(
  db: Db,
  projectId: string,
  userId: string,
  role: ProjectMemberRole
): Promise<ProjectMember> {
  const rows = await db(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, user_id) DO UPDATE SET role = EXCLUDED.role, created_at = project_members.created_at
     RETURNING *`,
    [projectId, userId, role]
  );
  return mapProjectMember(rows[0]!);
}

export async function updateProjectMemberRole(
  db: Db,
  projectId: string,
  userId: string,
  role: ProjectMemberRole
): Promise<ProjectMember | null> {
  const rows = await db(
    "UPDATE project_members SET role = $3 WHERE project_id = $1 AND user_id = $2 RETURNING *",
    [projectId, userId, role]
  );
  return rows[0] ? mapProjectMember(rows[0]) : null;
}

export async function removeProjectMember(db: Db, projectId: string, userId: string): Promise<boolean> {
  const rows = await db(
    "DELETE FROM project_members WHERE project_id = $1 AND user_id = $2 RETURNING id",
    [projectId, userId]
  );
  return rows.length > 0;
}

export async function getProjectAccess(
  db: Db,
  userId: string,
  projectId: string
): Promise<{ project: ResearchProject; role: ProjectMemberRole; isOwner: boolean } | null> {
  const owned = await getProject(db, userId, projectId);
  if (owned) return { project: owned, role: "admin", isOwner: true };
  const member = await getProjectMembership(db, projectId, userId);
  const project = await getProjectById(db, projectId);
  if (!project) return null;
  if (member) return { project, role: member.role, isOwner: false };
  if (project.teamId) {
    const teamMember = await getTeamMembership(db, project.teamId, userId);
    if (teamMember) return { project, role: teamMember.role, isOwner: false };
  }
  return null;
}

// ---- teams ----

function mapTeam(row: Record<string, unknown>): Team {
  return {
    id: String(row.id),
    name: String(row.name),
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at)
  };
}

function mapTeamMember(row: Record<string, unknown>): TeamMember {
  return {
    id: String(row.id),
    teamId: String(row.team_id),
    userId: String(row.user_id),
    role: String(row.role) as TeamMemberRole,
    createdAt: String(row.created_at),
    user: row.user_id
      ? {
          id: String(row.user_id),
          email: row.email == null ? "" : String(row.email),
          name: row.name == null ? "" : String(row.name)
        }
      : null
  };
}

export async function createTeam(db: Db, name: string, createdBy: string): Promise<Team> {
  const rows = await db(
    "INSERT INTO teams (name, created_by) VALUES ($1, $2) RETURNING *",
    [name, createdBy]
  );
  return mapTeam(rows[0]!);
}

export async function getTeamById(db: Db, teamId: string): Promise<Team | null> {
  const rows = await db("SELECT * FROM teams WHERE id = $1 LIMIT 1", [teamId]);
  return rows[0] ? mapTeam(rows[0]) : null;
}

export async function listTeamsForUser(db: Db, userId: string): Promise<Team[]> {
  const rows = await db(
    `SELECT DISTINCT t.*
     FROM teams t
     LEFT JOIN team_members tm ON tm.team_id = t.id
     WHERE t.created_by = $1 OR tm.user_id = $1
     ORDER BY t.created_at DESC
     LIMIT 100`,
    [userId]
  );
  return rows.map(mapTeam);
}

export async function getTeamAccess(
  db: Db,
  teamId: string,
  userId: string
): Promise<{ team: Team; role: TeamMemberRole; isOwner: boolean } | null> {
  const team = await getTeamById(db, teamId);
  if (!team) return null;
  if (team.createdBy === userId) return { team, role: "admin", isOwner: true };
  const member = await getTeamMembership(db, teamId, userId);
  if (!member) return null;
  return { team, role: member.role, isOwner: false };
}

export async function getTeamMembership(db: Db, teamId: string, userId: string): Promise<TeamMember | null> {
  const rows = await db(
    "SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2 LIMIT 1",
    [teamId, userId]
  );
  return rows[0] ? mapTeamMember(rows[0]) : null;
}

export async function listTeamMembers(db: Db, teamId: string): Promise<TeamMember[]> {
  const rows = await db(
    `SELECT tm.*, u.email, u.name
     FROM team_members tm
     JOIN users u ON u.id = tm.user_id
     WHERE tm.team_id = $1
     ORDER BY tm.created_at ASC`,
    [teamId]
  );
  return rows.map(mapTeamMember);
}

export async function addTeamMember(
  db: Db,
  teamId: string,
  userId: string,
  role: TeamMemberRole
): Promise<TeamMember> {
  const rows = await db(
    `INSERT INTO team_members (team_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (team_id, user_id) DO UPDATE SET role = EXCLUDED.role, created_at = team_members.created_at
     RETURNING *`,
    [teamId, userId, role]
  );
  return mapTeamMember(rows[0]!);
}

export async function updateTeamMemberRole(
  db: Db,
  teamId: string,
  userId: string,
  role: TeamMemberRole
): Promise<TeamMember | null> {
  const rows = await db(
    "UPDATE team_members SET role = $3 WHERE team_id = $1 AND user_id = $2 RETURNING *",
    [teamId, userId, role]
  );
  return rows[0] ? mapTeamMember(rows[0]) : null;
}

export async function removeTeamMember(db: Db, teamId: string, userId: string): Promise<boolean> {
  const rows = await db(
    "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2 RETURNING id",
    [teamId, userId]
  );
  return rows.length > 0;
}

export async function updateTeamName(db: Db, teamId: string, name: string): Promise<Team | null> {
  const rows = await db("UPDATE teams SET name = $2, updated_at = now() WHERE id = $1 RETURNING *", [
    teamId,
    name
  ]);
  return rows[0] ? mapTeam(rows[0]) : null;
}

export interface TeamStats {
  memberCount: number;
  projectCount: number;
  documentCount: number;
  reportCount: number;
  comparisonCount: number;
}

export async function getTeamStats(db: Db, teamId: string): Promise<TeamStats> {
  const [members, projects, docs, reports, comparisons] = await Promise.all([
    db("SELECT count(*)::int AS c FROM team_members WHERE team_id = $1", [teamId]),
    db("SELECT count(*)::int AS c FROM research_projects WHERE team_id = $1", [teamId]),
    db(
      `SELECT count(*)::int AS c FROM project_documents pd
       JOIN research_projects p ON p.id = pd.project_id
       WHERE p.team_id = $1`,
      [teamId]
    ),
    db(
      `SELECT count(*)::int AS c FROM reports r
       JOIN research_projects p ON p.id = r.project_id
       WHERE p.team_id = $1`,
      [teamId]
    ),
    db(
      `SELECT count(*)::int AS c FROM comparisons cm
       JOIN research_projects p ON p.id = cm.project_id
       WHERE p.team_id = $1`,
      [teamId]
    )
  ]);
  return {
    memberCount: Number(members[0]?.c ?? 0),
    projectCount: Number(projects[0]?.c ?? 0),
    documentCount: Number(docs[0]?.c ?? 0),
    reportCount: Number(reports[0]?.c ?? 0),
    comparisonCount: Number(comparisons[0]?.c ?? 0)
  };
}

export async function setProjectTeam(
  db: Db,
  projectId: string,
  teamId: string | null
): Promise<ResearchProject | null> {
  const rows = await db(
    "UPDATE research_projects SET team_id = $2, updated_at = now() WHERE id = $1 RETURNING *",
    [projectId, teamId]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function transferProjectOwnership(
  db: Db,
  projectId: string,
  oldOwnerUserId: string,
  newOwnerUserId: string
): Promise<ResearchProject | null> {
  await addProjectMember(db, projectId, oldOwnerUserId, "admin");
  await removeProjectMember(db, projectId, newOwnerUserId);
  const rows = await db(
    "UPDATE research_projects SET owner_user_id = $2, updated_at = now() WHERE id = $1 RETURNING *",
    [projectId, newOwnerUserId]
  );
  return rows[0] ? mapProject(rows[0]) : null;
}

export async function searchDocumentsByText(db: Db, query: string, limit = 20): Promise<SourceDocument[]> {
  const pattern = `%${query}%`;
  const rows = await db(
    `SELECT * FROM source_documents
     WHERE title ILIKE $1 OR original_title ILIKE $1 OR abstract ILIKE $1 OR source_name ILIKE $1
     ORDER BY similarity(coalesce(title, ''), $2) DESC NULLS LAST, created_at DESC
     LIMIT $3`,
    [pattern, query, limit]
  );
  return rows.map(mapDocument);
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
            d.url, d.publication_date, d.doi, d.patent_number, d.patent_status, d.country, d.inventors, d.applicants, d.source_name,
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
    patentStatus: r.patent_status == null ? null : String(r.patent_status),
    country: r.country == null ? null : String(r.country),
    inventors: parseJsonArray(r.inventors) as string[] | null,
    applicants: parseJsonArray(r.applicants) as string[] | null,
    sourceName: r.source_name == null ? null : String(r.source_name)
  }));
}

export async function listRecentSearches(db: Db, userId: string, limit = 20): Promise<
  Array<{
    id: string;
    queryText: string;
    sourceTypes: string[];
    status: SearchQuery["status"];
    executedAt: string | null;
    createdAt: string;
    resultCount: number;
  }>
> {
  const rows = await db(
    `SELECT sq.id, sq.query_text, sq.source_types, sq.status, sq.executed_at, sq.created_at, sq.is_bookmarked,
            count(sr.id)::int AS result_count
     FROM search_queries sq
     LEFT JOIN search_results sr ON sr.search_query_id = sq.id
     WHERE sq.user_id = $1
     GROUP BY sq.id
     ORDER BY sq.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows.map((row) => ({
    id: String(row.id),
    queryText: String(row.query_text),
    sourceTypes: parseJsonArray(row.source_types, ["web", "paper", "patent"]) as string[],
    status: String(row.status) as SearchQuery["status"],
    executedAt: row.executed_at == null ? null : String(row.executed_at),
    createdAt: String(row.created_at),
    resultCount: Number(row.result_count ?? 0),
    isBookmarked: row.is_bookmarked === true || row.is_bookmarked === "true"
  }));
}

export async function getLatestProjectSearch(db: Db, projectId: string): Promise<SearchQuery | null> {
  const rows = await db(
    "SELECT * FROM search_queries WHERE project_id = $1 ORDER BY created_at DESC LIMIT 1",
    [projectId]
  );
  return rows[0] ? mapSearchQuery(rows[0]) : null;
}

export async function setSearchBookmark(
  db: Db,
  searchQueryId: string,
  userId: string,
  bookmarked: boolean
): Promise<boolean> {
  const rows = await db(
    "UPDATE search_queries SET is_bookmarked = $3 WHERE id = $1 AND user_id = $2 RETURNING id",
    [searchQueryId, userId, bookmarked]
  );
  return rows.length > 0;
}

export async function listBookmarkedSearches(db: Db, userId: string, limit = 50): Promise<
  Array<{
    id: string;
    queryText: string;
    sourceTypes: string[];
    status: SearchQuery["status"];
    executedAt: string | null;
    createdAt: string;
    resultCount: number;
  }>
> {
  const rows = await db(
    `SELECT sq.id, sq.query_text, sq.source_types, sq.status, sq.executed_at, sq.created_at, sq.is_bookmarked,
            count(sr.id)::int AS result_count
     FROM search_queries sq
     LEFT JOIN search_results sr ON sr.search_query_id = sq.id
     WHERE sq.user_id = $1 AND sq.is_bookmarked = true
     GROUP BY sq.id
     ORDER BY sq.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows.map((row) => ({
    id: String(row.id),
    queryText: String(row.query_text),
    sourceTypes: parseJsonArray(row.source_types, ["web", "paper", "patent"]) as string[],
    status: String(row.status) as SearchQuery["status"],
    executedAt: row.executed_at == null ? null : String(row.executed_at),
    createdAt: String(row.created_at),
    resultCount: Number(row.result_count ?? 0),
    isBookmarked: row.is_bookmarked === true || row.is_bookmarked === "true"
  }));
}

// ---- auth tokens ----

export interface AuthTokenRow {
  id: string;
  userId: string;
  kind: string;
  tokenHash: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

function mapAuthToken(row: Record<string, unknown>): AuthTokenRow {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    kind: String(row.kind),
    tokenHash: String(row.token_hash),
    expiresAt: String(row.expires_at),
    usedAt: row.used_at == null ? null : String(row.used_at),
    createdAt: String(row.created_at)
  };
}

export async function createAuthToken(
  db: Db,
  input: { userId: string; kind: "reset" | "magic"; tokenHash: string; expiresAt: string }
): Promise<AuthTokenRow> {
  const rows = await db(
    `INSERT INTO auth_tokens (user_id, kind, token_hash, expires_at)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [input.userId, input.kind, input.tokenHash, input.expiresAt]
  );
  return mapAuthToken(rows[0]!);
}

export async function findAuthTokenByHash(
  db: Db,
  kind: "reset" | "magic",
  tokenHash: string
): Promise<AuthTokenRow | null> {
  const rows = await db(
    "SELECT * FROM auth_tokens WHERE kind = $1 AND token_hash = $2 ORDER BY created_at DESC LIMIT 1",
    [kind, tokenHash]
  );
  return rows[0] ? mapAuthToken(rows[0]) : null;
}

export async function markAuthTokenUsed(db: Db, id: string): Promise<void> {
  await db("UPDATE auth_tokens SET used_at = now() WHERE id = $1", [id]);
}

export async function listDocumentCandidates(db: Db, excludeId: string, limit = 300): Promise<SourceDocument[]> {
  const rows = await db(
    "SELECT * FROM source_documents WHERE id <> $1 ORDER BY created_at DESC LIMIT $2",
    [excludeId, limit]
  );
  return rows.map(mapDocument);
}

export async function listAllDocuments(db: Db, offset = 0, limit = 1000): Promise<SourceDocument[]> {
  const rows = await db(
    "SELECT * FROM source_documents ORDER BY created_at DESC LIMIT $1 OFFSET $2",
    [limit, offset]
  );
  return rows.map(mapDocument);
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

/**
 * 外部コネクタ由来のメタデータを DB カラム長に収める。
 * 検索・収集・ウォッチのいずれでも使うため repositories 側で一括対応する。
 */
export function clampMeta(value: string | null | undefined, max: number): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value);
  return s.length > max ? s.slice(0, max) : s;
}

/**
 * content_hash（varchar(128)）用の正規化。
 * 短いキー（DOI・特許番号・URL）は既存データとの互換のためそのまま使い、
 * 128 文字を超える場合は SHA-256 ハッシュ（64 文字 hex）にする。
 */
export async function normalizeContentHash(value: string | null | undefined): Promise<string | null> {
  if (value === null || value === undefined) return null;
  const s = String(value);
  if (s.length <= 128) return s;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function insertDocument(
  db: Db,
  result: SearchConnectorResult,
  contentHash: string | null,
  options: { bodyText?: string | null; licenseNote?: string } = {}
): Promise<SourceDocument> {
  const classificationsJson = normalizeClassifications(result.classifications);
  const rows = await db(
    `INSERT INTO source_documents
       (source_type, title, original_title, abstract, url, doi, patent_number, publication_number,
        patent_status, classifications, authors, inventors, applicants, country, publication_date, source_name,
        license_note, content_hash, body_text)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
     RETURNING *`,
    [
      result.sourceType,
      result.title,
      result.originalTitle ?? null,
      result.abstract ?? result.snippet ?? null,
      result.url ?? null,
      clampMeta(result.doi, 255),
      clampMeta(result.patentNumber, 255),
      clampMeta(result.publicationNumber, 255),
      result.patentStatus ?? null,
      classificationsJson?.length ? JSON.stringify(classificationsJson) : JSON.stringify([]),
      result.authors?.length ? JSON.stringify(result.authors) : null,
      result.inventors?.length ? JSON.stringify(result.inventors) : null,
      result.applicants?.length ? JSON.stringify(result.applicants) : null,
      clampMeta(result.country, 50),
      result.publicationDate ?? null,
      clampMeta(result.sourceName, 255),
      options.licenseNote ?? "公開メタデータ・要旨を中心に利用（本文は原則保存しない）",
      contentHash?.slice(0, 128) ?? null,
      options.bodyText ?? null
    ]
  );
  return mapDocument(rows[0]!);
}

/**
 * 文献メタデータを一括登録する（content_hash の一意制約で重複を除外）。
 * 戻り値は新規登録件数。既存データは変更しない。
 */
export async function insertDocumentsBatch(db: Db, results: SearchConnectorResult[]): Promise<number> {
  const seen = new Set<string>();
  const rows: SearchConnectorResult[] = [];
  for (const result of results) {
    if (!result.title) continue;
    const key = result.doi ?? result.url;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    rows.push(result);
  }
  let inserted = 0;
  const chunkSize = 100;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const placeholders: string[] = [];
    const values: unknown[] = [];
    for (const [j, r] of chunk.entries()) {
      const classificationsJson = normalizeClassifications(r.classifications);
      const base = j * 18;
      placeholders.push(
        `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},` +
          `$${base + 9},$${base + 10},$${base + 11},$${base + 12},$${base + 13},$${base + 14},$${base + 15},$${base + 16},$${base + 17},$${base + 18})`
      );
      values.push(
        r.sourceType,
        r.title,
        r.originalTitle ?? null,
        r.abstract ?? r.snippet ?? null,
        r.url ?? null,
        clampMeta(r.doi, 255),
        clampMeta(r.patentNumber, 255),
        clampMeta(r.publicationNumber, 255),
        r.patentStatus ?? null,
        classificationsJson?.length ? JSON.stringify(classificationsJson) : JSON.stringify([]),
        r.authors?.length ? JSON.stringify(r.authors) : null,
        r.inventors?.length ? JSON.stringify(r.inventors) : null,
        r.applicants?.length ? JSON.stringify(r.applicants) : null,
        clampMeta(r.country, 50),
        r.publicationDate ?? null,
        clampMeta(r.sourceName, 255),
        "公開メタデータ・要旨を中心に利用（本文は原則保存しない）",
        await normalizeContentHash(r.doi ?? r.url ?? null)
      );
    }
    const returned = await db(
      `INSERT INTO source_documents
         (source_type, title, original_title, abstract, url, doi, patent_number, publication_number,
          patent_status, classifications, authors, inventors, applicants, country, publication_date, source_name, license_note, content_hash)
       VALUES ${placeholders.join(",")}
       ON CONFLICT (content_hash) WHERE content_hash IS NOT NULL DO NOTHING
       RETURNING id`,
      values
    );
    inserted += returned.length;
  }
  return inserted;
}

/**
 * 検索結果の一括登録用。
 * Cloudflare Workers のサブリクエスト上限（既定 50/回）を超えないよう、
 * 既存確認・登録・検索結果の登録をそれぞれ 1 クエリにまとめる。
 */
export async function findDocumentsByContentHashes(
  db: Db,
  contentHashes: Array<string | null>
): Promise<Array<{ id: string; contentHash: string }>> {
  const hashes = [...new Set(contentHashes.filter((h): h is string => !!h))];
  if (hashes.length === 0) return [];
  const rows = await db("SELECT id, content_hash FROM source_documents WHERE content_hash = ANY($1)", [hashes]);
  return rows.map((r) => ({ id: String(r.id), contentHash: String(r.content_hash) }));
}

export async function insertDocumentsForSearch(
  db: Db,
  entries: Array<{ result: SearchConnectorResult; contentHash: string | null }>
): Promise<Array<{ id: string; contentHash: string | null }>> {
  if (entries.length === 0) return [];
  const placeholders: string[] = [];
  const values: unknown[] = [];
  for (const [j, entry] of entries.entries()) {
    const r = entry.result;
    const classificationsJson = normalizeClassifications(r.classifications);
    const base = j * 18;
    placeholders.push(
      `($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5},$${base + 6},$${base + 7},$${base + 8},` +
        `$${base + 9},$${base + 10},$${base + 11},$${base + 12},$${base + 13},$${base + 14},$${base + 15},$${base + 16},$${base + 17},$${base + 18})`
    );
    values.push(
      r.sourceType,
      r.title,
      r.originalTitle ?? null,
      r.abstract ?? r.snippet ?? null,
      r.url ?? null,
      clampMeta(r.doi, 255),
      clampMeta(r.patentNumber, 255),
      clampMeta(r.publicationNumber, 255),
      r.patentStatus ?? null,
      classificationsJson?.length ? JSON.stringify(classificationsJson) : JSON.stringify([]),
      r.authors?.length ? JSON.stringify(r.authors) : null,
      r.inventors?.length ? JSON.stringify(r.inventors) : null,
      r.applicants?.length ? JSON.stringify(r.applicants) : null,
      clampMeta(r.country, 50),
      r.publicationDate ?? null,
      clampMeta(r.sourceName, 255),
      "公開メタデータ・要旨を中心に利用（本文は原則保存しない）",
      entry.contentHash
    );
  }
  const rows = await db(
    `INSERT INTO source_documents
       (source_type, title, original_title, abstract, url, doi, patent_number, publication_number,
        patent_status, classifications, authors, inventors, applicants, country, publication_date, source_name, license_note, content_hash)
     VALUES ${placeholders.join(",")}
     ON CONFLICT (content_hash) WHERE content_hash IS NOT NULL DO NOTHING
     RETURNING id, content_hash`,
    values
  );
  return rows.map((r) => ({ id: String(r.id), contentHash: r.content_hash == null ? null : String(r.content_hash) }));
}

export async function insertSearchResultsBatch(
  db: Db,
  searchQueryId: string,
  rows: Array<{ sourceDocumentId: string; rank: number; relevanceScore: number; matchedKeywords: string[] }>
): Promise<void> {
  if (rows.length === 0) return;
  const placeholders: string[] = [];
  const values: unknown[] = [];
  for (const [j, r] of rows.entries()) {
    const base = j * 5;
    placeholders.push(`($${base + 1},$${base + 2},$${base + 3},$${base + 4},$${base + 5})`);
    values.push(searchQueryId, r.sourceDocumentId, r.rank, r.relevanceScore, JSON.stringify(r.matchedKeywords));
  }
  await db(
    `INSERT INTO search_results (search_query_id, source_document_id, rank, relevance_score, matched_keywords)
     VALUES ${placeholders.join(",")}
     ON CONFLICT (search_query_id, source_document_id) DO NOTHING`,
    values
  );
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

export async function getSummaryById(db: Db, id: string): Promise<AiSummary | null> {
  const rows = await db("SELECT * FROM ai_summaries WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapSummary(rows[0]) : null;
}

export async function updateSummaryReview(
  db: Db,
  id: string,
  input: { status: "pending" | "approved" | "rejected" | "edited"; reviewedBy: string; summaryText?: string }
): Promise<AiSummary | null> {
  const rows = await db(
    `UPDATE ai_summaries
     SET status = $2,
         reviewed_by = $3,
         reviewed_at = now(),
         summary_text = COALESCE($4, summary_text)
     WHERE id = $1 RETURNING *`,
    [id, input.status, input.reviewedBy, input.summaryText ?? null]
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

export async function listSummariesByDocumentIds(db: Db, documentIds: string[]): Promise<Map<string, AiSummary>> {
  const result = new Map<string, AiSummary>();
  if (documentIds.length === 0) return result;
  const placeholders = documentIds.map((_, i) => `$${i + 1}`).join(",");
  const rows = await db(
    `SELECT DISTINCT ON (source_document_id) *
     FROM ai_summaries
     WHERE source_document_id IN (${placeholders})
     ORDER BY source_document_id, created_at DESC`,
    documentIds
  );
  for (const row of rows) result.set(String(row.source_document_id), mapSummary(row));
  return result;
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
    db(
      `SELECT count(*)::int AS c FROM research_projects p
       WHERE p.owner_user_id = $1 OR p.id IN (
         SELECT pm.project_id FROM project_members pm WHERE pm.user_id = $1
         UNION
         SELECT p2.id FROM research_projects p2 JOIN teams t ON t.id = p2.team_id
           JOIN team_members tm ON tm.team_id = t.id WHERE tm.user_id = $1
       )`,
      [userId]
    ),
    db(
      `SELECT count(*)::int AS c FROM project_documents pd
       JOIN research_projects p ON p.id = pd.project_id
       WHERE p.id IN (
         SELECT p2.id FROM research_projects p2
         LEFT JOIN project_members pm ON pm.project_id = p2.id
         LEFT JOIN team_members tm ON tm.team_id = p2.team_id
         WHERE p2.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
       )`,
      [userId]
    ),
    db(
      `SELECT count(*)::int AS c FROM reports r
       JOIN research_projects p ON p.id = r.project_id
       WHERE p.id IN (
         SELECT p2.id FROM research_projects p2
         LEFT JOIN project_members pm ON pm.project_id = p2.id
         LEFT JOIN team_members tm ON tm.team_id = p2.team_id
         WHERE p2.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
       )`,
      [userId]
    ),
    db(
      `SELECT count(*)::int AS c FROM search_queries sq
       WHERE sq.user_id = $1 OR sq.project_id IN (
         SELECT p2.id FROM research_projects p2
         LEFT JOIN project_members pm ON pm.project_id = p2.id
         LEFT JOIN team_members tm ON tm.team_id = p2.team_id
         WHERE p2.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
       )`,
      [userId]
    )
  ]);
  const recentProjects = (await db(
    `SELECT DISTINCT p.* FROM research_projects p
     LEFT JOIN project_members pm ON pm.project_id = p.id
     LEFT JOIN team_members tm ON tm.team_id = p.team_id
     WHERE p.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
     ORDER BY p.updated_at DESC LIMIT 5`,
    [userId]
  )).map(mapProject);
  const recentReports = (await db(
    `SELECT r.* FROM reports r
     JOIN research_projects p ON p.id = r.project_id
     WHERE p.id IN (
       SELECT p2.id FROM research_projects p2
       LEFT JOIN project_members pm ON pm.project_id = p2.id
       LEFT JOIN team_members tm ON tm.team_id = p2.team_id
       WHERE p2.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
     ) ORDER BY r.created_at DESC LIMIT 5`,
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
  const rows = await db(
    `SELECT a.*, u.name AS user_name
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC
     LIMIT $1`,
    [limit]
  );
  return rows.map((row) => ({
    id: String(row.id),
    userId: row.user_id == null ? null : String(row.user_id),
    userName: row.user_name == null ? null : String(row.user_name),
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

// ---- watch topics ----

export interface WatchTopicRow {
  id: string;
  userId: string;
  projectId: string | null;
  displayName: string;
  terms: string | null;
  keyword: string;
  frequency: string;
  enabled: boolean;
  lastCheckedAt: string | null;
  createdAt: string;
}

function mapWatchTopic(row: Record<string, unknown>): WatchTopicRow {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: row.project_id == null ? null : String(row.project_id),
    displayName: row.display_name == null ? String(row.keyword) : String(row.display_name),
    terms: row.terms == null ? null : String(row.terms),
    keyword: String(row.keyword),
    frequency: String(row.frequency),
    enabled: row.enabled === true || row.enabled === "true" || row.enabled === 1 || row.enabled === "1",
    lastCheckedAt: row.last_checked_at == null ? null : String(row.last_checked_at),
    createdAt: String(row.created_at)
  };
}

export async function listWatchTopics(db: Db, userId: string): Promise<WatchTopicRow[]> {
  const rows = await db("SELECT * FROM watch_topics WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100", [userId]);
  return rows.map(mapWatchTopic);
}

export async function createWatchTopic(
  db: Db,
  input: { userId: string; displayName: string; terms?: string; keyword: string; frequency: string }
): Promise<WatchTopicRow> {
  const rows = await db(
    `INSERT INTO watch_topics (user_id, display_name, terms, keyword, frequency, enabled)
     VALUES ($1, $2, $3, $4, $5, true) RETURNING *`,
    [input.userId, input.displayName, input.terms ?? null, input.keyword, input.frequency]
  );
  return mapWatchTopic(rows[0]!);
}

export async function getWatchTopic(db: Db, id: string, userId: string): Promise<WatchTopicRow | null> {
  const rows = await db("SELECT * FROM watch_topics WHERE id = $1 AND user_id = $2 LIMIT 1", [id, userId]);
  return rows[0] ? mapWatchTopic(rows[0]) : null;
}

export async function updateWatchTopic(
  db: Db,
  id: string,
  input: { displayName?: string; terms?: string | null; keyword?: string; frequency?: string; enabled?: boolean }
): Promise<WatchTopicRow | null> {
  const rows = await db(
    `UPDATE watch_topics
     SET display_name = COALESCE($2, display_name),
         terms = CASE WHEN $3::boolean THEN $4 ELSE terms END,
         keyword = COALESCE($5, keyword),
         frequency = COALESCE($6, frequency),
         enabled = COALESCE($7, enabled)
     WHERE id = $1 RETURNING *`,
    [
      id,
      input.displayName ?? null,
      input.terms !== undefined,
      input.terms ?? null,
      input.keyword ?? null,
      input.frequency ?? null,
      input.enabled ?? null
    ]
  );
  return rows[0] ? mapWatchTopic(rows[0]) : null;
}

export async function deleteWatchTopic(db: Db, id: string): Promise<boolean> {
  const rows = await db("DELETE FROM watch_topics WHERE id = $1 RETURNING id", [id]);
  return rows.length > 0;
}

export async function listEnabledWatchTopics(db: Db): Promise<WatchTopicRow[]> {
  const rows = await db("SELECT * FROM watch_topics WHERE enabled = true ORDER BY created_at ASC LIMIT 500");
  return rows.map(mapWatchTopic);
}

export async function updateWatchTopicCheck(
  db: Db,
  id: string,
  input: { lastCheckedAt: string; lastNewCount: number }
): Promise<void> {
  await db(
    "UPDATE watch_topics SET last_checked_at = $2, last_new_count = $3 WHERE id = $1",
    [id, input.lastCheckedAt, input.lastNewCount]
  );
}

// ---- notifications ----

export interface NotificationRow {
  id: string;
  userId: string;
  watchTopicId: string | null;
  sourceDocumentId: string | null;
  kind: string;
  title: string;
  body: string | null;
  url: string | null;
  readAt: string | null;
  createdAt: string;
}

function mapNotification(row: Record<string, unknown>): NotificationRow {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    watchTopicId: row.watch_topic_id == null ? null : String(row.watch_topic_id),
    sourceDocumentId: row.source_document_id == null ? null : String(row.source_document_id),
    kind: String(row.kind),
    title: String(row.title),
    body: row.body == null ? null : String(row.body),
    url: row.url == null ? null : String(row.url),
    readAt: row.read_at == null ? null : String(row.read_at),
    createdAt: String(row.created_at)
  };
}

export async function createNotification(
  db: Db,
  input: {
    userId: string;
    watchTopicId?: string | null;
    sourceDocumentId?: string | null;
    kind?: string;
    title: string;
    body?: string | null;
    url?: string | null;
    readAt?: string | null;
  }
): Promise<NotificationRow> {
  const rows = await db(
    `INSERT INTO notifications
       (user_id, watch_topic_id, source_document_id, kind, title, body, url, read_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      input.userId,
      input.watchTopicId ?? null,
      input.sourceDocumentId ?? null,
      input.kind ?? "watch",
      input.title,
      input.body ?? null,
      input.url ?? null,
      input.readAt ?? null
    ]
  );
  return mapNotification(rows[0]!);
}

export async function notificationExistsForDocument(
  db: Db,
  watchTopicId: string,
  sourceDocumentId: string
): Promise<boolean> {
  const rows = await db(
    "SELECT 1 FROM notifications WHERE watch_topic_id = $1 AND source_document_id = $2 LIMIT 1",
    [watchTopicId, sourceDocumentId]
  );
  return rows.length > 0;
}

export async function listNotifications(db: Db, userId: string, limit = 50): Promise<NotificationRow[]> {
  const rows = await db(
    "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2",
    [userId, limit]
  );
  return rows.map(mapNotification);
}

export async function unreadNotificationCount(db: Db, userId: string): Promise<number> {
  const rows = await db(
    "SELECT count(*)::int AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL",
    [userId]
  );
  return Number(rows[0]?.c ?? 0);
}

export async function markNotificationRead(db: Db, userId: string, notificationId: string): Promise<boolean> {
  const rows = await db(
    "UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2 AND read_at IS NULL RETURNING id",
    [notificationId, userId]
  );
  return rows.length > 0;
}

export async function markAllNotificationsRead(db: Db, userId: string): Promise<number> {
  const rows = await db(
    "UPDATE notifications SET read_at = now() WHERE user_id = $1 AND read_at IS NULL RETURNING id",
    [userId]
  );
  return rows.length;
}

// ---- chat 用: ユーザーの保存文献 ----

export async function listUserDocuments(db: Db, userId: string, limit = 8): Promise<SourceDocument[]> {
  const rows = await db(
    `SELECT DISTINCT ON (d.id) d.* FROM project_documents pd
     JOIN research_projects p ON p.id = pd.project_id
     LEFT JOIN project_members pm ON pm.project_id = p.id
     LEFT JOIN team_members tm ON tm.team_id = p.team_id
     JOIN source_documents d ON d.id = pd.source_document_id
     WHERE p.owner_user_id = $1 OR pm.user_id = $1 OR tm.user_id = $1
     ORDER BY d.id, pd.created_at DESC
     LIMIT $2`,
    [userId, limit]
  );
  return rows.map(mapDocument);
}

export async function adminUserCount(db: Db): Promise<number> {
  const rows = await db("SELECT count(*)::int AS c FROM users WHERE role = 'admin'");
  return Number(rows[0]?.c ?? 0);
}

export function newId(): string {
  return randomUUID();
}

// ---- 文献収集（ingest）履歴 ----

export interface IngestRunLog {
  id: string;
  createdAt: string;
  detail: Record<string, unknown> | null;
}

export async function listIngestRuns(db: Db, limit = 50): Promise<IngestRunLog[]> {
  const rows = await db(
    `SELECT id, created_at, detail FROM audit_logs
     WHERE action = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    ["ingest.run", limit]
  );
  return rows.map((row) => ({
    id: String(row.id),
    createdAt: String(row.created_at),
    detail: parseJsonObject(row.detail)
  }));
}

export interface AdminStats {
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
}

export async function getAdminStats(db: Db): Promise<AdminStats> {
  const [users, projects, documents, docsByType, searches, comparisons, reports, watchTopics, ingestRuns, lastIngest] =
    await Promise.all([
      db("SELECT count(*)::int AS c, count(*) FILTER (WHERE role = 'admin')::int AS admins FROM users"),
      db("SELECT count(*)::int AS c FROM research_projects"),
      db("SELECT count(*)::int AS c FROM source_documents"),
      db(
        `SELECT source_type, count(*)::int AS c FROM source_documents
         GROUP BY source_type ORDER BY c DESC`
      ),
      db("SELECT count(*)::int AS c FROM search_queries"),
      db("SELECT count(*)::int AS c FROM comparisons"),
      db("SELECT count(*)::int AS c FROM reports"),
      db("SELECT count(*)::int AS c FROM watch_topics"),
      db("SELECT count(*)::int AS c FROM audit_logs WHERE action = 'ingest.run'"),
      db("SELECT max(created_at) AS at FROM audit_logs WHERE action = 'ingest.run'")
    ]);
  return {
    totalUsers: Number(users[0]?.c ?? 0),
    adminUsers: Number(users[0]?.admins ?? 0),
    totalProjects: Number(projects[0]?.c ?? 0),
    totalDocuments: Number(documents[0]?.c ?? 0),
    documentsByType: docsByType.map((row) => ({
      sourceType: String(row.source_type),
      count: Number(row.c)
    })),
    totalSearches: Number(searches[0]?.c ?? 0),
    totalComparisons: Number(comparisons[0]?.c ?? 0),
    totalReports: Number(reports[0]?.c ?? 0),
    totalWatchTopics: Number(watchTopics[0]?.c ?? 0),
    ingestRuns: Number(ingestRuns[0]?.c ?? 0),
    lastIngestRunAt: lastIngest[0]?.at == null ? null : String(lastIngest[0].at)
  };
}

export interface LlmUsageSummary {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  byModel: Array<{
    provider: string;
    model: string;
    calls: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
  }>;
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
}

export async function getLlmUsageSummary(db: Db, days = 30): Promise<LlmUsageSummary> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const [totals, byModel, recent] = await Promise.all([
    db(
      `SELECT count(*)::int AS calls,
              coalesce(sum(input_tokens),0)::int AS input_tokens,
              coalesce(sum(output_tokens),0)::int AS output_tokens,
              coalesce(sum(cost_estimate),0)::numeric AS cost
       FROM llm_usage WHERE created_at >= $1`,
      [since]
    ),
    db(
      `SELECT provider, model, count(*)::int AS calls,
              sum(input_tokens)::int AS input_tokens,
              sum(output_tokens)::int AS output_tokens,
              sum(cost_estimate)::numeric AS cost
       FROM llm_usage WHERE created_at >= $1
       GROUP BY provider, model ORDER BY cost DESC`,
      [since]
    ),
    db(
      `SELECT id, action, provider, model, input_tokens, output_tokens, cost_estimate, created_at
       FROM llm_usage WHERE created_at >= $1
       ORDER BY created_at DESC LIMIT 30`,
      [since]
    )
  ]);
  return {
    totalCalls: Number(totals[0]?.calls ?? 0),
    totalInputTokens: Number(totals[0]?.input_tokens ?? 0),
    totalOutputTokens: Number(totals[0]?.output_tokens ?? 0),
    totalCost: Number(totals[0]?.cost ?? 0),
    byModel: byModel.map((row) => ({
      provider: String(row.provider),
      model: String(row.model),
      calls: Number(row.calls),
      inputTokens: Number(row.input_tokens),
      outputTokens: Number(row.output_tokens),
      cost: Number(row.cost)
    })),
    recent: recent.map((row) => ({
      id: String(row.id),
      action: String(row.action),
      provider: String(row.provider),
      model: String(row.model),
      inputTokens: Number(row.input_tokens),
      outputTokens: Number(row.output_tokens),
      costEstimate: Number(row.cost_estimate),
      createdAt: String(row.created_at)
    }))
  };
}
