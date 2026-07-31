# バックアップ・リストア手順

業務データの正本は Neon PostgreSQL。Neon のブランチングと PITR を活用する。

## バックアップ

### 1. リリース前のブランチ（推奨）

```bash
neonctl branches create --project-id green-dawn-58312822 --parent main --name release-<日時>
```

### 2. SQL ダンプ

```bash
pg_dump "$DATABASE_URL" > icrps-backup-$(date +%Y%m%d).sql
```

## リストア

### ブランチからの復元

```bash
neonctl branches create --project-id green-dawn-58312822 --name restore-<日時> --parent release-<日時>
# アプリの DATABASE_URL を復元ブランチへ切り替え
```

### ダンプからの復元

```bash
psql "$RESTORE_DATABASE_URL" < icrps-backup-YYYYMMDD.sql
```

## 保持ポリシー

- リリースごとにブランチを作成
- 履歴保持は Neon プランの設定に依存（確認する）
- 本番データの削除・初期化は行わない

## 注意

- 復元前に必ず復元先ブランチでスモークテストを実施
- 秘密情報（接続文字列）はログ・Issue・README に出力しない
