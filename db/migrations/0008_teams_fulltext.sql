-- 組織（チーム）管理と PostgreSQL trigram 全文検索
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS teams (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       varchar(200) NOT NULL,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

CREATE TABLE IF NOT EXISTS team_members (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role    varchar(50) NOT NULL DEFAULT 'viewer'
          CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);

ALTER TABLE research_projects ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_research_projects_team ON research_projects(team_id);

CREATE INDEX IF NOT EXISTS idx_source_documents_title_trgm
  ON source_documents USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_source_documents_abstract_trgm
  ON source_documents USING gin (abstract gin_trgm_ops);
