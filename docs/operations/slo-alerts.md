# SLI / SLO とアラート

## SLI / SLO（目標）

| SLI | 定義 | SLO |
| --- | --- | --- |
| 可用性 | ヘルスチェック成功割合（月間） | 99.0% |
| 検索応答 | 検索 API の p95 応答時間 | 10秒以内 |
| LLM 成功率 | LLM 呼び出し成功割合（フォールバック含む） | 95% |
| 定期処理 | watch / ingest / daily の成功割合（月間） | 95% |

## アラート閾値

| アラート | 閾値 | 通知 |
| --- | --- | --- |
| 警告 | ヘルスチェック失敗（5分間隔・再起動）/ 日次点検で1項目以上 NG | 管理者メール（Resend）＋Webhook（任意） |
| 重大 | サービス停止 5分以上 / DB degraded / バックアップ検証 NG | 管理者メール＋journal＋Webhook（任意） |

## 監視の仕組み

- 死活監視: `icrps-healthcheck.timer`（5分間隔・失敗時自動再起動）
- 日次点検: `icrps-daily.timer`（毎日 03:30・ヘルス＋バックアップ＋検証・結果を `/var/log/icrps/daily-check.log`）
- 定期処理: `icrps-watch.timer`（2時間） / `icrps-ingest.timer`（2時間）
- Cloudflare: Workers ログ・トレース（sampling 100%）
- Webhook 通知: `ICRPS_ALERT_WEBHOOK_URL`（Slack 互換）を `/etc/icrps/icrps.env` に設定（詳細: [monitoring.md](monitoring.md)）

## 通知試験

初回設定時と四半期ごとに、`RESEND_API_KEY` / `ADMIN_EMAIL` 設定後に
`sudo systemctl start icrps-daily.service` を実行し、正常時のログと異常時のメール送信を確認する。

## 一次対応責任者

- 一次対応: システム管理者（本リポジトリの deploy 権限保持者）
- エスカレーション: 管理者不在時は 24時間以内に復旧作業を実施（RTO 2時間を目標に通知手段を確保）
