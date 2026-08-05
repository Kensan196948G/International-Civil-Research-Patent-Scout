#!/usr/bin/env bash
# ローカル systemd デプロイスクリプト
# 使用法: sudo DATABASE_URL='postgresql://...' PORT=8787 ./deploy/install-local.sh
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="$(command -v node)"
PORT="${PORT:-8787}"
ENV_FILE=/etc/icrps/icrps.env

if [[ "${EUID}" -ne 0 ]]; then
  echo "root 権限で実行してください: sudo DATABASE_URL=... $0" >&2
  exit 1
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  if [[ -n "${DATABASE_URL_FILE:-}" && -f "${DATABASE_URL_FILE}" ]]; then
    DATABASE_URL="$(tr -d '\r\n' < "${DATABASE_URL_FILE}")"
    echo "DATABASE_URL_FILE から接続情報を読み込みました"
  elif [[ -f "${ENV_FILE}" ]]; then
    echo "${ENV_FILE} から DATABASE_URL を再利用します"
  else
    echo "DATABASE_URL または DATABASE_URL_FILE が必要です" >&2
    exit 1
  fi
fi

echo "==> アプリをビルド"
cd "${APP_DIR}"
npm run clean || true   # 古い tsbuildinfo による差分ビルド不具合を防止
npm run build
APP_OWNER="$(stat -c '%U' "${APP_DIR}")"
chown -R "${APP_OWNER}:${APP_OWNER}" "${APP_DIR}/apps" "${APP_DIR}/packages"

echo "==> /etc/icrps を作成"
install -d -m 700 /etc/icrps

if [[ -n "${DATABASE_URL:-}" ]]; then
  JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
  {
    echo "APP_ENV=production"
    echo "APP_URL=${APP_URL:-http://$(hostname -I | awk '{print $1}'):${PORT}}"
    echo "DATABASE_URL=${DATABASE_URL}"
    echo "JWT_SECRET=${JWT_SECRET}"
    echo "JWT_EXPIRES_IN=12h"
    echo "PORT=${PORT}"
    echo "OPENAI_API_KEY=${OPENAI_API_KEY:-}"
    echo "OPENAI_BASE_URL=${OPENAI_BASE_URL:-https://api.openai.com/v1}"
    echo "AI_MODEL=${AI_MODEL:-gpt-4o-mini}"
    echo "CROSSREF_API_URL=${CROSSREF_API_URL:-https://api.crossref.org}"
    echo "OPENALEX_API_URL=${OPENALEX_API_URL:-https://api.openalex.org}"
    echo "SERP_API_KEY=${SERP_API_KEY:-}"
    echo "ESPACENET_OPS_URL=${ESPACENET_OPS_URL:-https://ops.epo.org/3.2}"
    echo "ESPACENET_OPS_KEY=${ESPACENET_OPS_KEY:-}"
    echo "ESPACENET_OPS_SECRET=${ESPACENET_OPS_SECRET:-}"
    echo "RESEND_API_KEY=${RESEND_API_KEY:-}"
    echo "EMAIL_FROM=${EMAIL_FROM:-}"
    echo "ADMIN_EMAIL=${ADMIN_EMAIL:-}"
    echo "MEILISEARCH_HOST=${MEILISEARCH_HOST:-}"
    echo "MEILISEARCH_API_KEY=${MEILISEARCH_API_KEY:-}"
    echo "GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID:-}"
    echo "GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET:-}"
  } > "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  echo "==> ${ENV_FILE} を更新（秘密情報のため内容は表示しません）"
fi

echo "==> systemd unit をインストール"
sed -e "s|__APP_DIR__|${APP_DIR}|g" -e "s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_DIR}/deploy/systemd/icrps.service" > /etc/systemd/system/icrps.service
chmod 644 /etc/systemd/system/icrps.service

echo "==> 死活監視（healthcheck timer）をインストール"
install -m 755 "${APP_DIR}/deploy/scripts/icrps-healthcheck.sh" /usr/local/bin/icrps-healthcheck.sh
install -m 644 "${APP_DIR}/deploy/systemd/icrps-healthcheck.service" /etc/systemd/system/icrps-healthcheck.service
install -m 644 "${APP_DIR}/deploy/systemd/icrps-healthcheck.timer" /etc/systemd/system/icrps-healthcheck.timer

echo "==> 更新監視（watch timer）をインストール"
sed -e "s|__APP_DIR__|${APP_DIR}|g" -e "s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_DIR}/deploy/systemd/icrps-watch.service" > /etc/systemd/system/icrps-watch.service
chmod 644 /etc/systemd/system/icrps-watch.service
install -m 644 "${APP_DIR}/deploy/systemd/icrps-watch.timer" /etc/systemd/system/icrps-watch.timer

echo "==> 日次点検（daily timer）をインストール"
sed -e "s|__APP_DIR__|${APP_DIR}|g" -e "s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_DIR}/deploy/systemd/icrps-daily.service" > /etc/systemd/system/icrps-daily.service
chmod 644 /etc/systemd/system/icrps-daily.service
install -m 644 "${APP_DIR}/deploy/systemd/icrps-daily.timer" /etc/systemd/system/icrps-daily.timer
install -d -m 755 /var/backups/icrps
install -d -m 755 /var/log/icrps
chown -R "${APP_OWNER}:${APP_OWNER}" /var/backups/icrps /var/log/icrps

echo "==> サービスを有効化・起動"
systemctl daemon-reload
systemctl enable icrps
systemctl restart icrps
systemctl enable --now icrps-healthcheck.timer
systemctl enable --now icrps-watch.timer
systemctl enable --now icrps-daily.timer

IP="$(hostname -I | awk '{print $1}')"
echo ""
echo "=============================================="
echo " ICRPS ローカル運用を開始しました"
echo " WebUI/API: http://${IP}:${PORT}"
echo " ヘルスチェック: http://${IP}:${PORT}/api/health"
echo " ログ: journalctl -u icrps -f"
echo " 状態: systemctl status icrps"
echo " 死活監視: systemctl status icrps-healthcheck.timer（5分間隔）"
echo " 更新監視: systemctl status icrps-watch.timer（2時間間隔・手動: systemctl start icrps-watch.service）"
echo " 日次点検: systemctl status icrps-daily.timer（毎日 03:30・バックアップ/検証）"
echo "=============================================="
