-- アプリ設定（AI プロバイダの API キー等。暗号化 JSON で保存）
CREATE TABLE IF NOT EXISTS app_settings (
  key        varchar(100) PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
