-- 文献の技術分類コード（IPC / CPC 等）
ALTER TABLE source_documents ADD COLUMN IF NOT EXISTS classifications jsonb NOT NULL DEFAULT '[]'::jsonb;
