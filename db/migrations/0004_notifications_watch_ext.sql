-- 通知センターと更新監視の実動化
-- 1. 通知テーブル（アプリ内通知: ウォッチ新着・システム連絡）
CREATE TABLE IF NOT EXISTS notifications (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  watch_topic_id     uuid REFERENCES watch_topics(id) ON DELETE CASCADE,
  source_document_id uuid REFERENCES source_documents(id) ON DELETE CASCADE,
  kind               varchar(50) NOT NULL DEFAULT 'watch'
                     CHECK (kind IN ('watch', 'baseline', 'system')),
  title              text NOT NULL,
  body               text,
  url                text,
  read_at            timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_topic_document
  ON notifications(watch_topic_id, source_document_id);

-- 2. ウォッチテーマに「前回実行時の新着数」を追加
ALTER TABLE watch_topics ADD COLUMN IF NOT EXISTS last_new_count integer NOT NULL DEFAULT 0;
