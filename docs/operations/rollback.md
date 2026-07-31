# 障害対応・ロールバック手順

## ローカル（systemd）のロールバック

### 1. サービス停止

```bash
sudo systemctl stop icrps
```

### 2. 前バージョンへ切り替え

```bash
cd /home/kensan/Projects/Mirai-DX-Project/International-Civil-Research-Patent-Scout
git log --oneline -5
git checkout <前バージョンのコミット> -- apps packages db scripts
npm ci
npm run check
sudo ./deploy/install-local.sh
```

### 3. 動作確認

```bash
curl http://127.0.0.1:8787/api/health
```

## データベース（Neon）のロールバック

Neon はブランチと Point-in-Time 復元を提供する。

```bash
# 復旧時点のブランチを作成
neonctl branches create --project-id green-dawn-58312822 --parent main --name restore-<日時>

# 特定時点からの復元が必要な場合
neonctl branches create --project-id green-dawn-58312822 --name restore-pitr --parent-timestamp '2026-07-31 22:00:00 UTC'
```

アプリの `DATABASE_URL` を復元ブランチの接続文字列に差し替え、動作確認後に本番へ昇格する。

## Cloudflare Workers のロールバック（将来）

```bash
wrangler rollback                    # 直前バージョンへ
wrangler versions list               # 履歴確認
wrangler rollback <VERSION_ID>
```

## 重大障害時の原則

1. 追加変更より復旧を優先
2. データ削除・初期化はしない
3. 復旧後は原因を Issue 化し、再発防止策を追加
