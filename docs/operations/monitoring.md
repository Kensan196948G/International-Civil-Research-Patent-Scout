# 監視手順

## 死活監視（ローカル）

```bash
systemctl status icrps
curl -fsS http://127.0.0.1:8787/api/health
```

`/api/health` は `{ "ok": true, "db": "ok" }` を返す。DB 接続不可時は `db: "degraded"`。

> 注意: 外部 URL（`https://icrps.mirai-dx-platform.com/api/health`）は Cloudflare Access 保護のため、未認証では 302 を返す。死活監視はローカル（127.0.0.1:8787）または Access サービストークン経由で実施する。

## ログ

```bash
journalctl -u icrps -f          # リアルタイム
journalctl -u icrps --since "1 hour ago"
```

## 監査ログ

管理画面 `/admin` または `GET /api/admin/audit-logs` でログイン・検索・保存・要約・比較・レポート生成・エクスポートを確認できる。

## 定期チェック（推奨 cron）

```cron
*/5 * * * * curl -fsS http://127.0.0.1:8787/api/health >/dev/null || systemctl restart icrps
```

## 自動化された死活監視（v0.1.1 以降）

`deploy/install-local.sh` により、5 分間隔の systemd timer が有効化される。

```bash
systemctl status icrps-healthcheck.timer
journalctl -u icrps-healthcheck.service -n 20
```

ヘルスチェック失敗時は `icrps.service` を自動再起動する（`/usr/local/bin/icrps-healthcheck.sh`）。

## Cloudflare 移行後

- Workers ログ: `wrangler tail icrps-api`
- Observability: `wrangler.jsonc` の `observability.enabled = true`
- 分析: Cloudflare Dashboard → Workers → Analytics
- Neon: ダッシュボードの CPU・ストレージ・接続数、または `neonctl` で確認

## アラート

- systemd 障害: ユニットは自動再起動（`Restart=always`）
- DB 障害: `/api/health` の `db != "ok"`
- 依存関係: `npm audit`（CI で high 以上を失敗扱い）
