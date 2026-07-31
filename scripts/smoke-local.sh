#!/usr/bin/env bash
# ローカル稼働中の ICRPS をスモークテストする
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:8787}"
echo "==> health check: ${BASE_URL}/api/health"
HEALTH="$(curl -fsS --max-time 10 "${BASE_URL}/api/health")"
echo "${HEALTH}"
echo "${HEALTH}" | grep -q '"ok":true' || { echo "health NG"; exit 1; }

echo "==> トップページ: ${BASE_URL}/"
STATUS="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 "${BASE_URL}/")"
echo "HTTP ${STATUS}"
[[ "${STATUS}" == "200" ]] || { echo "top page NG"; exit 1; }

echo "==> 認証なしアクセスが 401 になること"
UNAUTH="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 10 -X POST "${BASE_URL}/api/projects" -H 'Content-Type: application/json' -d '{}')"
echo "HTTP ${UNAUTH}"
[[ "${UNAUTH}" == "401" ]] || { echo "auth guard NG"; exit 1; }

echo "==> スモークテスト成功"
