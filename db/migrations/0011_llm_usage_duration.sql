-- LLM 使用量に実行時間（ミリ秒）を追加（AI 品質監視・遅延分析用）
ALTER TABLE llm_usage ADD COLUMN IF NOT EXISTS duration_ms integer NOT NULL DEFAULT 0;
