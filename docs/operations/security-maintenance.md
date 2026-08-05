# セキュリティ・保守手順

## 秘密情報の棚卸しとローテーション

| 秘密 | 保存先 | 更新・ローテーション |
| --- | --- | --- |
| DATABASE_URL | `/etc/icrps/icrps.env`（0600）/ Cloudflare Secret | Neon パスワード変更時・四半期 |
| JWT_SECRET | 同上 | 定期ローテーション（四半期）・漏えい時は即時（全ユーザー再ログイン） |
| RESEND_API_KEY / 外部 API キー | 同上 | 各サービスでローテーション |
| CLOUDFLARE_API_TOKEN | 環境変数（GitHub Secret 相当） | 権限見直し・四半期 |
| NEON_API_KEY | 環境変数 | 四半期 |

秘密はリポジトリ・ログ・監査ログへ出力しない。`.env.example` は変数名と安全な例のみ。

## アクセス権限の棚卸し

- ユーザーロール: admin / user / viewer（アプリ内）
- プロジェクトロール: admin / editor / viewer（`project_members`）
- チームロール: admin / editor / viewer（`team_members`）
- 四半期ごとに不要アカウント・不要メンバーを削除

## 依存関係・ランタイム・ライセンス

- `npm audit --audit-level=high` を CI で強制
- 月次で `npm outdated` / Dependabot PR を確認
- Node.js は LTS を利用（現在 Node 25 動作・CI は Node 22）
- Cloudflare Workers の compatibility_date は更新時に確認
- 主要依存（Hono / React / Vite / Neon）のライセンスは MIT/Apache 系であることを確認

## バックアップと復元

- 日次論理バックアップ（7日保持）+ Neon 自動バックアップ
- RPO=24時間 / RTO=2時間を目標
- 四半期に一度、`scripts/verify-backup.mjs` に加えて復元試験を実施
