# マイグレーション運用規約

## 適用方法

```bash
# 未適用のものだけ適用（推奨）
DATABASE_URL='postgresql://...' node scripts/migrate.mjs

# ファイルを指定して適用
DATABASE_URL='postgresql://...' node scripts/migrate.mjs db/migrations/0011_xxx.sql

# 適用済みも強制的に再実行（通常は使わない）
DATABASE_URL='postgresql://...' node scripts/migrate.mjs --force
```

## 適用済み管理

適用済みのファイル名は `schema_migrations` テーブルで管理する。

| 列 | 型 | 説明 |
|---|---|---|
| `filename` | `text` PRIMARY KEY | マイグレーションファイル名 |
| `applied_at` | `timestamptz` | 適用日時 |

台帳が存在しない既存 DB に対して実行した場合は、全ファイルを一度適用したうえで
台帳へ記録する。**全 SQL が冪等である前提**のため、既存オブジェクトは作り直されず
データも保持される（検証済み）。

```sql
-- 適用状況の確認
SELECT filename, applied_at FROM schema_migrations ORDER BY filename;
```

## 記述規約（必須）

再実行しても失敗しないよう、**すべての DDL を冪等に書く**。

| 対象 | 書き方 |
|---|---|
| テーブル | `CREATE TABLE IF NOT EXISTS ...` |
| 索引 | `CREATE INDEX IF NOT EXISTS ...` / `CREATE UNIQUE INDEX IF NOT EXISTS ...` |
| 列追加 | `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` |
| 拡張 | `CREATE EXTENSION IF NOT EXISTS ...` |
| 関数 | `CREATE OR REPLACE FUNCTION ...` |
| トリガー | `CREATE OR REPLACE TRIGGER ...`（PostgreSQL 14 以降） |
| 型 | `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN NULL; END $$;` |

## 変更方針

- **additive かつ後方互換のみ**を原則とする（列追加・テーブル追加・索引追加）
- 列の削除・型変更・NOT NULL 化などの破壊的変更は
  expand-and-contract（追加 → 二重書き込み → 移行 → 削除）へ分割し、
  削除フェーズは CLAUDE.md §17 の Approval PR として分離する
- 適用済みファイルは編集しない。修正が必要な場合は新しい番号のファイルを追加する
  （ただし冪等性の付与など、既存 DB へ影響しない書き換えは例外とする）

## 検証手順

新しいマイグレーションを追加したら、空 DB で通しの再現性を確認する。

```bash
# Neon に一時ブランチ + 空 DB を作成して実行
node scripts/migrate.mjs          # 全件適用されること
node scripts/seed-demo.mjs        # シードが通ること
node scripts/migrate.mjs          # 全件 skipped になること
```

確認後は一時ブランチを削除する。
