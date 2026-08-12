-- AI 要約のレビュー状態（採用・却下・編集）を記録する
ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected', 'edited'));
ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ai_summaries ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
CREATE INDEX IF NOT EXISTS idx_ai_summaries_status ON ai_summaries(status);
