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

1. ユーザーがサブドメイン候補から選択（承認が必要）
2. `apps/api/wrangler.jsonc` の `routes` に `{ pattern = "<sub>.mirai-dx-platform.com", custom_domain = true }` を設定
3. Neon 接続情報・JWT シークレットを `wrangler secret put` で登録
4. GitHub Actions（`.github/workflows/deploy.yml`）または `wrangler deploy` で公開
5. Cloudflare Access で保護し、workers.dev を無効化

> ⚠️ DNS・サブドメイン変更はユーザー承認前に行わない。
