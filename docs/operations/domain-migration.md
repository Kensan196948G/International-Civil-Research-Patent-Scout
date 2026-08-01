# ドメイン移行手順（サブドメイン指定待ち）

> ステータス: **指定待ち**（2026-08-01）。ドメイン名・サブドメイン名の指定を受けてから、以下の手順を実行する。DNS・custom domain・Cloudflare Access の変更は**指定＋承認後**のみ。

## 現在の状態

| 項目 | 値 |
| --- | --- |
| 稼働中 URL | `http://192.168.0.185:8787`（ローカル systemd・0.0.0.0:8787） |
| Cloudflare ゾーン | `mirai-dx-platform.com`（zone id: `e375e651e49a40801a305b89e297bff0`） |
| Cloudflare アカウント | `4f1e888469df7e0b896bb4e211b12633` |
| Worker 設定 | `apps/api/wrangler.jsonc`（name: `icrps-api`・assets: web/dist・observability 有効） |
| サブドメイン候補 | `patent-scout` / `icrps` / `research-patent-scout` / `civil-research-patent-scout`（`.mirai-dx-platform.com`） |

## ユーザー指定待ちの項目

1. ドメイン名（`mirai-dx-platform.com` のままか、別ドメインか）
2. サブドメイン名（例: `patent-scout`）
3. Cloudflare Access の保護方針（組織・メールドメイン・認証方式）

## 指定後の実行手順（すべて承認必須）

1. `apps/api/wrangler.jsonc` の `routes` に custom domain を設定
   ```jsonc
   "routes": [{ "pattern": "<sub>.mirai-dx-platform.com", "custom_domain": true }]
   ```
2. 本番デプロイ（承認済み CI/CD 経路）
   ```bash
   npx wrangler deploy   # または .github/workflows/deploy.yml の production dispatch
   ```
3. Secrets 登録（値は表示しない）
   ```bash
   printf '%s' "$DATABASE_URL" | npx wrangler secret put DATABASE_URL
   printf '%s' "$JWT_SECRET" | npx wrangler secret put JWT_SECRET
   # OPENAI_API_KEY / その他 任意
   ```
4. Cloudflare Access ポリシー作成（対象アプリ・メールドメイン）
5. `workers.dev` 経路を無効化し、カスタムドメインのみへ一本化
6. ローカル systemd の `APP_URL` を `https://<sub>.mirai-dx-platform.com` へ更新
7. 検証
   ```bash
   curl -fsS https://<sub>.mirai-dx-platform.com/api/health
   BASE_URL=https://<sub>.mirai-dx-platform.com node scripts/smoke-local.sh
   ```
8. ドキュメント・state.json・README の URL を更新

## DNS について

- Cloudflare の custom domain（Worker ルート）は、ゾーンが Cloudflare 管理下にあれば CNAME/AAAA を自動構成できる
- **承認前の DNS 変更・zone 編集・外部 DNS への切り替えは行わない**
- 別ドメインを利用する場合は、ゾーン追加・ネームサーバー変更が発生するため、事前にユーザー承認が必要

## ロールバック

- カスタムドメイン設定を解除（wrangler.jsonc の routes を空に戻して再デプロイ）
- ローカル systemd は並行稼働のため、`http://192.168.0.185:8787` にそのまま復旧可能
- Access ポリシーは削除で無効化
