# 運用台帳（定期点検）

| 周期 | 点検項目 | 実施者 | 証跡 | 次回予定 |
| --- | --- | --- | --- | --- |
| 日次 | 日次点検（ヘルス・バックアップ・検証） | 自動（icrps-daily.timer） | `/var/log/icrps/daily-check.log` | 毎日 03:30 |
| 日次 | ウォッチ・収集ジョブの実行結果 | 自動（timer） | 監査ログ `ingest.run` / `watch.run_manual` | 毎日確認 |
| 週次 | 監査ログ・エラー率の確認、ディスク使用量 | 管理者 | 週次チェックリスト | 毎週月曜 |
| 月次 | Secrets 棚卸し・APIキー有効期限・依存関係監査（`npm audit`） | 管理者 | 月次チェックリスト | 毎月1日 |
| 月次 | Neon 容量・Cloudflare 使用量・課金アラート確認 | 管理者 | 各 Dashboard | 毎月1日 |
| 四半期 | バックアップ復元試験・通知試験・権限棚卸し | 管理者 | 試験結果ログ | 四半期初週 |
| 四半期 | ランタイム・依存関係の EOL 確認、ライセンス確認 | 管理者 | 四半期チェックリスト | 四半期初週 |

## 実施記録

| 日付 | 項目 | 結果 | 担当 |
| --- | --- | --- | --- |
| 2026-08-05 | マイグレーション 0004〜0009 適用 | OK | 自動化セッション |
| 2026-08-05 | rollback DDL トランザクション検証 | OK | 自動化セッション |
| 2026-08-05 | 日次点検ジョブ導入 | OK（timer 有効） | 自動化セッション |
| 2026-08-05 | 本番デプロイ（ローカル systemd + Cloudflare） | OK（v0.9.0 / CF version d427904b） | 自動化セッション |
| 2026-08-05 | 主要フロー E2E スモーク（登録→検索→保存→要約→比較→レポート→チャット） | OK（全項目 PASS） | 自動化セッション |
| 2026-08-12 | v0.10.0 評価版: 登録制御・AI コスト管理・要約レビュー・適用可否 API・UI 正直表示を実装 | typecheck/lint/test/build 成功（API 100 / Web 15） | 評価セッション |
| 2026-08-12 | migration 0010（ai_summaries レビュー状態） | 未適用（本番影響のため承認待ち） | 評価セッション |
| 2026-08-12 | PR #25（v0.10.0）作成・push・GitHub Actions CI 成功 | OK（typecheck/lint/test/build/audit） | 評価セッション |
| 2026-08-12 | migration 0010 本番適用・バックアップ取得（18テーブル） | OK | 評価セッション |
| 2026-08-12 | 復元試験を四半期計画へ登録（docs/operations/restore-drill.md） | 登録済み・初回試験は次回四半期初週 | 評価セッション |
| 2026-08-12 | 通知先確認 | RESEND_API_KEY 設定済み・ADMIN_EMAIL を設定・EMAIL_FROM は Resend ドメイン検証待ち | 評価セッション |
| 2026-08-12 | PR #25 マージ・v0.10.0 をローカル systemd へデプロイ | OK（health 0.10.0・smoke PASS） | 評価セッション |
| 2026-08-12 | PR #27（Cookie 認証）作成 | CI 実行中（実装・テスト完了） | 評価セッション |
| 2026-08-12 | PR #27 / #28 マージ・v0.11.0 をローカル systemd へデプロイ | OK（health 0.11.0・smoke PASS） | 評価セッション |
| 2026-08-12 | Cookie/CSRF の実機確認 | OK（CSRF欠落403・不正トークン401・Cookieなし401） | 評価セッション |
| 2026-08-14 | デモデータシード実装・投入（scripts/seed-demo.mjs・--force 対応） | OK（ユーザー3/チーム2/プロジェクト4/文献16/要約18/比較2/レポート3/ウォッチ4/通知6） | MVP 実装セッション |
| 2026-08-14 | 不正 UUID 500 → 404 修正・E2E スモーク検証条件修正 | OK（typecheck/lint/test 123/build 全 PASS・smoke-e2e ALL PASSED） | MVP 実装セッション |
| 2026-08-14 | v0.12.0 をローカル systemd へデプロイ | OK（health 0.12.0・db ok・E2E PASS） | MVP 実装セッション |
| 2026-08-14 | v0.12.1: 検索500（content_hash 超過）修正・CSP/React警告/chat変数修正・実ブラウザE2E追加 | OK（typecheck/lint/test 127/build 全 PASS・UI-E2E 14項目 PASS・console error 0） | MVP 検証セッション |
| 2026-08-14 | v0.12.1 をローカル systemd へデプロイ | OK（health 0.12.1・db ok・smoke PASS） | MVP 検証セッション |
| 2026-08-14 | MVP 専用環境構築（Neon ブランチ icrps-mvp → migration+全項目シード → Cloudflare Worker icrps-api-mvp + custom domain icrps-mvp.mirai-dx-platform.com + Secrets） | OK（health 0.12.1→0.12.2・mvp 環境・db ok） | MVP 構築セッション |
| 2026-08-14 | 検索の一括INSERT化（Workers サブリクエスト上限50/回の超過による500を解消） | OK（MVP API 検索 2.3s・21件・実ブラウザE2E 14項目PASS・console error 0） | MVP 構築セッション |

今後はこの表に日付・結果・担当を追記する。
