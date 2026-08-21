# デプロイ手順書（ローカル systemd）

## 前提

- Node.js 20.19 以上（本機は Node 20.20.2 で動作確認済み）
- Neon PostgreSQL の接続文字列（`DATABASE_URL`）
- `sudo` 権限

## 初回デプロイ

```bash
cd /home/kensan/Projects/Mirai-DX-Project/International-Civil-Research-Patent-Scout

# 1. 依存インストールとビルド・テスト
npm ci
npm run check

# 2. マイグレーション（Neon main ブランチ）
DATABASE_URL='postgresql://...' node scripts/migrate.mjs

# 3. systemd 登録・起動（秘密情報は DATABASE_URL_FILE で渡すことを推奨）
sudo DATABASE_URL_FILE=/path/to/db-url.txt ./deploy/install-local.sh

# 4. 確認
systemctl status icrps
systemctl status icrps-healthcheck.timer   # 5分間隔の死活監視（失敗時自動再起動）
systemctl status icrps-watch.timer         # 2時間間隔の更新監視（ウォッチ通知）
curl http://127.0.0.1:8787/api/health
./scripts/smoke-local.sh
BASE_URL=http://127.0.0.1:8787 node scripts/smoke-e2e.mjs
```

## 更新デプロイ

```bash
cd /home/kensan/Projects/Mirai-DX-Project/International-Civil-Research-Patent-Scout
git pull
npm ci
npm run check
sudo ./deploy/install-local.sh   # DATABASE_URL は /etc/icrps/icrps.env を再利用
```

## 接続情報とポート

- バインド: `0.0.0.0:8787`（`PORT` 環境変数で変更可）
- 自動割当 IP の確認: `hostname -I`
- WebUI: `http://<IP>:8787` / ヘルス: `http://<IP>:8787/api/health`
- 秘密情報: `/etc/icrps/icrps.env`（権限 0600、root のみ読み取り）

## ファイアウォール

必要に応じてポート 8787 を開放する（利用環境のポリシーに従う）:

```bash
sudo ufw allow 8787/tcp   # Ubuntu の場合
```

## Cloudflare 移行（サブドメイン決定後）

詳細は [domain-migration.md](domain-migration.md) を参照。

> ⚠️ DNS・サブドメイン変更はユーザー承認前に行わない。

---

# デプロイ手順書（Cloudflare Workers）

## 環境一覧

| 環境 | Worker 名 | URL | Access 保護 | 用途 |
|---|---|---|---|---|
| production | `icrps-api` | https://icrps.mirai-dx-platform.com | あり（未認証は 302） | 本番 |
| mvp | `icrps-api-mvp` | https://icrps-mvp.mirai-dx-platform.com | なし | MVP 公開デモ（架空データ） |
| preview | `icrps-api-preview` | https://icrps-api-preview.kensan1969.workers.dev | なし | 検証 |

Secrets（`DATABASE_URL` / `JWT_SECRET`）は環境ごとに `wrangler secret put` で登録済み。
値はリポジトリ・ログ・PR・文書へ出力しない。

## 実行経路

現状 **GitHub Actions の `deploy.yml` は使用できない**。Actions Secrets
（`CLOUDFLARE_API_TOKEN` 等）が未登録のため。登録するまでは、認証済み端末からの
`wrangler` 実行が正式経路である。

```bash
# 事前に CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID を環境変数へ設定
cd apps/api

npx wrangler deploy --env preview     # 検証
npx wrangler deploy --env mvp         # MVP デモ
npx wrangler deploy                   # 本番（--env なし）
```

> ⚠️ `deploy.yml` の production ジョブは `wrangler versions upload` のみで、
> トラフィックへは反映されない。反映には `npx wrangler versions deploy` での昇格が必要。

## 本番デプロイ前チェック

1. デプロイ対象 commit を固定し、`npm run check` と `npm audit --omit=dev --audit-level=high` が PASS
2. **DB マイグレーションの要否を確認**（`db/migrations/` と本番スキーマの差分）
   - 追加が必要な場合のみ `DATABASE_URL='...' node scripts/migrate.mjs` を先に実行
   - additive かつ後方互換であることを確認する
3. 同一 commit を preview へデプロイし、E2E スモークが全 PASS
   ```bash
   BASE_URL=https://icrps-api-preview.kensan1969.workers.dev node scripts/smoke-e2e.mjs
   ```
4. 現行の本番 version ID を控える（rollback 先）
   ```bash
   cd apps/api && npx wrangler deployments status
   ```

## デプロイ後確認

```bash
# Access 保護が効いていること（302 が正常）
curl -s -o /dev/null -w '%{http_code}\n' https://icrps.mirai-dx-platform.com/api/health

cd apps/api
npx wrangler deployments status        # version ID と 100% 反映を確認
npx wrangler tail                      # エラー率・例外を確認
```

Cloudflare ダッシュボードの Workers Logs / Traces（head sampling 100%）で
error rate と latency を確認する。

## rollback

```bash
cd apps/api
npx wrangler deployments list                       # 直前の正常 version ID を特定
npx wrangler rollback --version-id <VERSION_ID>
```

rollback 後は再デプロイを無制限に繰り返さず、原因・影響・復旧内容を
`docs/operations/incident-response.md` の様式で記録する。

## Actions Secrets（`deploy.yml` を有効化する場合）

| Secret 名 | 用途 |
|---|---|
| `CLOUDFLARE_API_TOKEN` | Workers デプロイ権限 |
| `CLOUDFLARE_ACCOUNT_ID` | 対象アカウント |
| `DATABASE_URL` / `JWT_SECRET` | production Worker の Secrets 更新 |
| `MVP_DATABASE_URL` / `MVP_JWT_SECRET` | mvp Worker の Secrets 更新 |
| `OPENAI_API_KEY` | 任意（未設定ならスキップ） |

`deploy.yml` は未設定の Secret で `wrangler secret put` を実行すると空文字で
上書きしてしまうため、pre-flight チェックで事前に失敗させる実装になっている。
