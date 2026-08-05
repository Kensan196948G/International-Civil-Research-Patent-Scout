-- プロジェクト共有（チームメンバーとロール）
CREATE TABLE IF NOT EXISTS project_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       varchar(50) NOT NULL DEFAULT 'viewer'
             CHECK (role IN ('viewer', 'editor', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
