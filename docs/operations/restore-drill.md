# バックアップ復元試験（四半期ドリル）

目的: RPO=24時間 / RTO=2時間の目標が実際に達成可能であることを実地で検証する。
対象: 本番 Neon の論理バックアップ（`/var/backups/icrps/icrps-*.json.gz`）と Neon ブランチ/PITR。

## 実施タイミング

- 四半期初週（1月・4月・7月・10月）に 1 回
- 重大なデータ変更（migration・大量訂正）の前後にも実施推奨

## 事前準備

- 復元先ブランチを準備（`neonctl branches create --name restore-drill-<日時>`）
- 復元先 DB の接続文字列を `RESTORE_DATABASE_URL` として準備（値は表示しない）
- 作業時間帯と連絡先（管理者）を明示

## 手順

1. 論理バックアップの最新ファイルを確認
   ```bash
   ls -lt /var/backups/icrps | head
   sudo systemctl start icrps-daily.service   # 直前のバックアップを再取得
   ```
2. バックアップ検証
   ```bash
   DATABASE_URL=... node scripts/verify-backup.mjs
   ```
3. 復元先ブランチへリストア（対象テーブルを TRUNCATE → JSON から再投入）
   - 手順: [backup-restore.md](backup-restore.md)
4. 復元先でスモーク
   ```bash
   RESTORE_DATABASE_URL=... BASE_URL=http://127.0.0.1:8788 node scripts/smoke-e2e.mjs
   ```
5. ログイン・主要 API・監査ログ・バックアップ検証の結果を記録
6. 復元先ブランチを削除（確認後）

## 判定基準

- 復元対象テーブル全件の件数一致（verify-backup で mismatch 0）
- 復元先で health `db=ok`・ログイン成功・検索/保存/要約/比較/レポート成功
- 所要時間が RTO 2時間以内
- 結果を [ops-ledger.md](ops-ledger.md) に記録

## 2026-08-12 時点の状況

- 論理バックアップ: 稼働中（毎日 03:30・7日保持・直近取得 2026-08-12）
- Neon PITR/ブランチ: 手順整備済み（未実地試験）
- 復元ドリル: **未実施**（本ファイル作成により四半期計画へ登録）
- 通知先: `ADMIN_EMAIL` 未設定だったため管理者メールを設定（送信元 `EMAIL_FROM` は Resend ドメイン検証待ち）
