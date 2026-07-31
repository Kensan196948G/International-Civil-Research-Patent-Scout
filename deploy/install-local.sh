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
  } > "${ENV_FILE}"
  chmod 600 "${ENV_FILE}"
  echo "==> ${ENV_FILE} を更新（秘密情報のため内容は表示しません）"
fi

echo "==> systemd unit をインストール"
sed -e "s|__APP_DIR__|${APP_DIR}|g" -e "s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_DIR}/deploy/systemd/icrps.service" > /etc/systemd/system/icrps.service
chmod 644 /etc/systemd/system/icrps.service

echo "==> サービスを有効化・起動"
systemctl daemon-reload
systemctl enable icrps
systemctl restart icrps

IP="$(hostname -I | awk '{print $1}')"
echo ""
echo "=============================================="
echo " ICRPS ローカル運用を開始しました"
echo " WebUI/API: http://${IP}:${PORT}"
echo " ヘルスチェック: http://${IP}:${PORT}/api/health"
echo " ログ: journalctl -u icrps -f"
echo " 状態: systemctl status icrps"
echo "=============================================="
