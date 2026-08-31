#!/usr/bin/env bash
# ICRPS 死活監視スクリプト（systemd timer から実行）
# ヘルスチェック失敗時にサービスを再起動し、管理者へ通知（Webhook 設定時）して終了コード 1 を返す
# 設定: ICRPS_HEALTH_URL（既定 http://127.0.0.1:8787）
#       ICRPS_ALERT_WEBHOOK_URL（Slack 互換 incoming webhook 等。省略時は通知なし）
#       ICRPS_SKIP_RESTART=1（テスト・CI 用。再起動をスキップ）
set -u

BASE_URL="${ICRPS_HEALTH_URL:-http://127.0.0.1:8787}"
ALERT_WEBHOOK="${ICRPS_ALERT_WEBHOOK_URL:-}"

HEALTH="$(curl -fsS --max-time 10 "${BASE_URL}/api/health" 2>/dev/null || true)"
if [ -n "${HEALTH}" ] && printf '%s' "${HEALTH}" | grep -q '"ok":true'; then
  exit 0
fi

NOW="$(date -Iseconds)"
echo "[icrps-healthcheck] health check FAILED at ${NOW} url=${BASE_URL}" >&2
if [ -n "${HEALTH}" ]; then
  echo "[icrps-healthcheck] health response: ${HEALTH}" >&2
fi

# 障害通知（Slack 互換 incoming webhook または任意の JSON POST 先）
if [ -n "${ALERT_WEBHOOK}" ]; then
  SUMMARY="$(printf '%s' "${HEALTH}" | head -c 500)"
  PAYLOAD="$(printf '{"text":"[ICRPS] health check FAILED at %s\\nurl=%s\\nhealth=%s"}' "${NOW}" "${BASE_URL}" "${SUMMARY}")"
  if curl -fsS --max-time 10 -H 'Content-Type: application/json' -d "${PAYLOAD}" "${ALERT_WEBHOOK}" >/dev/null 2>&1; then
    echo "[icrps-healthcheck] alert sent to webhook" >&2
  else
    echo "[icrps-healthcheck] alert webhook FAILED" >&2
  fi
fi

if [ "${ICRPS_SKIP_RESTART:-0}" != "1" ]; then
  echo "[icrps-healthcheck] restarting icrps" >&2
  systemctl restart icrps
fi
exit 1
