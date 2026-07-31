#!/usr/bin/env bash
# ICRPS 死活監視スクリプト（systemd timer から実行）
# ヘルスチェック失敗時にサービスを再起動し、終了コード 1 を返す
set -u

BASE_URL="${ICRPS_HEALTH_URL:-http://127.0.0.1:8787}"

if curl -fsS --max-time 10 "${BASE_URL}/api/health" 2>/dev/null | grep -q '"ok":true'; then
  exit 0
fi

echo "[icrps-healthcheck] health check failed at $(date -Iseconds) - restarting icrps" >&2
systemctl restart icrps
exit 1
