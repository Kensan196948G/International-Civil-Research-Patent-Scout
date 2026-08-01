#!/usr/bin/env bash
# ICRPS 文献収集（2時間ごと）の systemd timer をインストールする
# 使用法: sudo ./deploy/install-ingest.sh
set -euo pipefail

if [[ "${EUID}" -ne 0 ]]; then
  echo "root 権限で実行してください: sudo $0" >&2
  exit 1
fi

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NODE_BIN="$(command -v node)"

echo "==> アプリをビルド"
cd "${APP_DIR}"
npm run build --workspace @icrps/api

echo "==> systemd unit をインストール"
sed -e "s|__APP_DIR__|${APP_DIR}|g" -e "s|__NODE_BIN__|${NODE_BIN}|g" \
  "${APP_DIR}/deploy/systemd/icrps-ingest.service" > /etc/systemd/system/icrps-ingest.service
chmod 644 /etc/systemd/system/icrps-ingest.service
install -m 644 "${APP_DIR}/deploy/systemd/icrps-ingest.timer" /etc/systemd/system/icrps-ingest.timer

systemctl daemon-reload
systemctl enable --now icrps-ingest.timer

echo ""
echo "=============================================="
echo " ICRPS 文献収集タイマーを有効化しました"
echo " スケジュール: 2時間ごと（cron 相当）"
echo " 状態: systemctl status icrps-ingest.timer"
echo " 直近の実行結果: journalctl -u icrps-ingest.service -n 50"
echo " 手動実行: systemctl start icrps-ingest.service"
echo "=============================================="
