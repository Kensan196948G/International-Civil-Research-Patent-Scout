-- 更新監視テーマの拡張（表示名・キーワード・有効フラグ）
ALTER TABLE watch_topics ADD COLUMN IF NOT EXISTS display_name text;
ALTER TABLE watch_topics ADD COLUMN IF NOT EXISTS terms text;
ALTER TABLE watch_topics ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;
