# インシデント対応・復旧 Runbook

## 連絡・エスカレーション

| レベル | 内容 | 対応者 | 目標時間 |
| --- | --- | --- | --- |
| 重大（P1） | 全機能停止・データ損失 | 管理者（kensan@mirai-dx-platform.com 相当） | 15分以内に検知・30分以内に切分け |
| 高（P2） | 主要機能（検索/認証）障害 | 管理者 | 30分以内に検知 |
| 中（P3） | 一部機能・定期処理失敗 | 管理者 | 次営業日まで |

通知先: 管理画面（監査ログ）＋ `ADMIN_EMAIL`（`RESEND_API_KEY` 設定時）＋ systemd journal。

## 障害切分けの順序

1. `systemctl status icrps icrps-watch.timer icrps-ingest.timer icrps-daily.timer`
2. `journalctl -u icrps -n 100 --since "10 min ago"`
3. `curl -fsS http://127.0.0.1:8787/api/health`（`db != "ok"` は Neon 側）
4. DB: `DATABASE_URL` で `SELECT 1`、Neon Dashboard の接続数・CPU
5. 外部 API: Crossref / OpenAlex / SerpAPI / Espacenet OPS の状態（ログの failureSources）

## よくある障害と対応

| 症状 | 原因の候補 | 対応 |
| --- | --- | --- |
| サービス停止 | プロセス異常 | `sudo systemctl restart icrps`（自動再起動設定済み） |
| DB degraded | Neon 停止/接続数超過 | Neon Dashboard 確認、接続プール見直し |
| 検索が遅い/失敗 | 外部 API 障害 | コネクタは自動分離。`/api/search` の `failureSources` を確認 |
| ウォッチ未実行 | タイマー停止 | `systemctl start icrps-watch.service`、journal 確認 |
| 文献収集失敗 | 収集先サイト変更 | journal の `ingest.run`、パーサ修正 |
| 日次点検失敗 | DB/バックアップ | `journalctl -u icrps-daily.service -n 50` |

## ロールバック（アプリ）

ローカル: 前バージョンの build が残っていれば差し替え、`sudo systemctl restart icrps`。
Cloudflare: `wrangler rollback icrps-api`（直前バージョンへ戻す）。

## ロールバック（DB）

マイグレーション 0004〜0009 のロールバック DDL は `scripts/verify-rollback.mjs` でトランザクション検証済み。
実際のロールバックは、バックアップ復元（下記）を原則とし、DDL ロールバックはデータ整合の確認後に限定的に実施する。

## バックアップと復旧

- 論理バックアップ: `/var/backups/icrps/icrps-*.json.gz`（毎日 03:30・7日保持）
- プラットフォームバックアップ: Neon 自動バックアップ（保持期間は Neon プランに依存）
- 検証: `scripts/verify-backup.mjs`（最新バックアップの件数突合・日次実行）
- 復旧手順:
  1. `ls -t /var/backups/icrps | head`
  2. `gunzip -c <最新> > /tmp/restore.json`
  3. 対象テーブルを `TRUNCATE` 後、JSON から再投入（管理者判断・作業時間帯を明示）
  4. `npm run check` 相当のスモークテスト
- 目標: RPO=24時間（日次バックアップ）、RTO=2時間以内（アプリ再起動＋復元）

## メンテナンス・データ訂正

- メンテナンス告知は README の本番 URL に掲示（または管理者メール）
- データ訂正は必ず監査ログ（`admin.data_correction`）に記録し、変更前後の行数を残す
- 大量訂正はトランザクションで実施し、バックアップ取得後に実行
