# インシデント対応手順書

## 重大度定義

| レベル | 定義 | 例 |
| --- | --- | --- |
| S1（重大） | サービス全体が利用不能、データ破損・漏えいの疑い | 起動不能、DB 接続不能、認証バイパス |
| S2（高） | 主要機能が一部利用不能 | 検索コネクタ全滅、レポート生成失敗 |
| S3（中） | 一部機能・特定ユーザーに影響 | 単一コネクタ失敗、UI 不具合 |
| S4（低） | 影響が軽微・運用上の問題 | 監査ログ欠落の疑い、ドキュメント不整合 |

## 検知手段

- systemd 死活: `systemctl status icrps`（自動再起動あり）
- ヘルスチェック: `curl http://127.0.0.1:8787/api/health`（`db:"ok"` 必須）
- 定期監視: `icrps-healthcheck.timer`（5 分間隔、失敗時自動再起動）
- ログ: `journalctl -u icrps -f`
- 監査ログ: 管理画面 `/admin` / `GET /api/admin/audit-logs`

## 対応フロー

1. **検知・記録**: 発生日時、症状、影響範囲を Issue に記録（テンプレート: docs/release-notes/incident-template.md）
2. **初動対応（S1/S2）**: 追加変更より復旧を優先する
   - サービス再起動: `sudo systemctl restart icrps`
   - DB 確認: `/api/health` の `db` 値、Neon ダッシュボード
   - ロールバック: [rollback.md](rollback.md) に従う
3. **原因特定**: journalctl と監査ログから再現手順を特定
4. **修正・検証**: 作業ブランチで修正 → typecheck/lint/test/build → CI 成功を確認
5. **復旧確認**: スモークテスト（`scripts/smoke-local.sh`、preview で `smoke-e2e.mjs`）
6. **ポストモーテム**: 原因、影響、再発防止策を Issue に記録し、Project を更新

## 通信・エスカレーション

- S1: 管理者へ即時連絡（運用ポリシーに応じた通知手段）
- S2: 業務時間内に報告、Issue 化
- S3/S4: 次回定例で報告

## 復旧時の確認リスト

- [ ] `/api/health` が `{"ok":true,"db":"ok"}`
- [ ] WebUI `http://<IP>:8787` が 200
- [ ] ログイン・主要 API が正常
- [ ] 監査ログが継続記録されている
- [ ] データ整合性（件数・重複・欠損）を確認
