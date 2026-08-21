-- International Civil Research & Patent Scout : 初期スキーマ
-- 適用: scripts/migrate.mjs（DATABASE_URL 環境変数）
-- 冪等: 再実行しても失敗しないよう IF NOT EXISTS / OR REPLACE で記述する（PostgreSQL 14+）

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         varchar(255) NOT NULL UNIQUE,
  name          varchar(255) NOT NULL,
  password_hash text NOT NULL,
  role          varchar(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS research_projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         varchar(500) NOT NULL,
  description   text,
  status        varchar(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
  tags          jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_research_projects_owner ON research_projects(owner_user_id, created_at DESC);
CREATE OR REPLACE TRIGGER trg_research_projects_updated_at BEFORE UPDATE ON research_projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS search_queries (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id       uuid REFERENCES research_projects(id) ON DELETE SET NULL,
  query_text       text NOT NULL,
  expanded_queries jsonb,
  source_types     jsonb NOT NULL DEFAULT '["web","paper","patent"]'::jsonb,
  filters          jsonb,
  status           varchar(50) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  failure_sources  jsonb NOT NULL DEFAULT '[]'::jsonb,
  executed_at      timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_search_queries_user ON search_queries(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_queries_project ON search_queries(project_id);

CREATE TABLE IF NOT EXISTS source_documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type       varchar(50) NOT NULL CHECK (source_type IN ('web', 'paper', 'patent', 'pdf')),
  title             text NOT NULL,
  original_title    text,
  abstract          text,
  body_text         text,
  url               text,
  doi               varchar(255),
  patent_number     varchar(255),
  publication_number varchar(255),
  authors           jsonb,
  inventors         jsonb,
  applicants        jsonb,
  country           varchar(50),
  publication_date  date,
  source_name       varchar(255),
  license_note      text,
  content_hash      varchar(128),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_source_documents_doi ON source_documents(doi) WHERE doi IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_source_documents_patent_number ON source_documents(patent_number) WHERE patent_number IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_source_documents_content_hash ON source_documents(content_hash) WHERE content_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_source_documents_type ON source_documents(source_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source_documents_title ON source_documents (lower(title) text_pattern_ops);
CREATE OR REPLACE TRIGGER trg_source_documents_updated_at BEFORE UPDATE ON source_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS search_results (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_query_id    uuid NOT NULL REFERENCES search_queries(id) ON DELETE CASCADE,
  source_document_id uuid NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  rank               integer NOT NULL CHECK (rank >= 1),
  relevance_score    numeric(5,2),
  matched_keywords   jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (search_query_id, source_document_id)
);
CREATE INDEX IF NOT EXISTS idx_search_results_query ON search_results(search_query_id, rank);

CREATE TABLE IF NOT EXISTS project_documents (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  source_document_id uuid NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  user_note          text,
  tags               jsonb NOT NULL DEFAULT '[]'::jsonb,
  importance         integer CHECK (importance BETWEEN 1 AND 5),
  status             varchar(50) NOT NULL DEFAULT 'saved' CHECK (status IN ('saved', 'reviewed', 'excluded')),
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, source_document_id)
);
CREATE INDEX IF NOT EXISTS idx_project_documents_project ON project_documents(project_id, created_at DESC);
CREATE OR REPLACE TRIGGER trg_project_documents_updated_at BEFORE UPDATE ON project_documents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS ai_summaries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_document_id  uuid NOT NULL REFERENCES source_documents(id) ON DELETE CASCADE,
  summary_type        varchar(50) NOT NULL CHECK (summary_type IN ('short', 'detailed', 'technical', 'patent')),
  language            varchar(10) NOT NULL DEFAULT 'ja',
  summary_text        text NOT NULL,
  key_points          jsonb,
  merits              jsonb,
  demerits            jsonb,
  application_conditions jsonb,
  risks               jsonb,
  citations           jsonb,
  model_name          varchar(100),
  prompt_version      varchar(50),
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_summaries_document ON ai_summaries(source_document_id, created_at DESC);

CREATE TABLE IF NOT EXISTS comparisons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  title           text NOT NULL,
  comparison_axes jsonb NOT NULL,
  rows            jsonb NOT NULL,
  notes           jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comparisons_project ON comparisons(project_id, created_at DESC);
CREATE OR REPLACE TRIGGER trg_comparisons_updated_at BEFORE UPDATE ON comparisons
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS reports (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id       uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  title            text NOT NULL,
  report_type      varchar(50) NOT NULL CHECK (report_type IN ('summary', 'technical_comparison', 'patent_survey', 'paper_review', 'proposal_research')),
  content_markdown text NOT NULL,
  export_file_url  text,
  created_by       uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reports_project ON reports(project_id, created_at DESC);
CREATE OR REPLACE TRIGGER trg_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS watch_topics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES research_projects(id) ON DELETE CASCADE,
  keyword         text NOT NULL,
  frequency       varchar(20) NOT NULL DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  last_checked_at timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_watch_topics_user ON watch_topics(user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES users(id) ON DELETE SET NULL,
  action        varchar(100) NOT NULL,
  resource_type varchar(100),
  resource_id   uuid,
  detail        jsonb,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
