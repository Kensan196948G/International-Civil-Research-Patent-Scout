# リリースチェックリスト

## コード品質

- [ ] `npm run typecheck` 成功
- [ ] `npm run lint`（エラー 0）
- [ ] `npm run test`（全テスト成功）
- [ ] `npm run build`（API + Web）成功
- [ ] `npm audit` で高危険度脆弱性 0

## データ

- [ ] `node scripts/migrate.mjs` でマイグレーション適用
- [ ] テーブル・インデックス確認
- [ ] 本番データのバックアップ（Neon ブランチ）取得

## 動作確認

- [ ] `./scripts/smoke-local.sh` 成功
- [ ] `BASE_URL=... node scripts/smoke-e2e.mjs` 成功（登録→プロジェクト→検索→保存→要約→比較→レポート→エクスポート）
- [ ] 未認証アクセスが 401
- [ ] admin 以外のロール変更が 403

## 運用

- [ ] systemd 有効化・起動時自動起動（`systemctl is-enabled icrps`）
- [ ] ログ確認（`journalctl -u icrps`）
- [ ] 監視・アラート設定
- [ ] リリースノート更新
- [ ] state.json / GitHub Issues 更新

## デプロイ（ローカル）

- [ ] `sudo ./deploy/install-local.sh` 実行
- [ ] ヘルスチェック `{"ok":true,"db":"ok"}`
- [ ] WebUI `http://<IP>:8787` が 200

## Cloudflare 移行時（サブドメイン承認後）

- [ ] サブドメイン選択の承認記録
- [ ] wrangler.jsonc の routes 設定
- [ ] Secrets 登録（DATABASE_URL / JWT_SECRET / OPENAI_API_KEY）
- [ ] Cloudflare Access 保護・workers.dev 無効化
- [ ] カスタムドメインでのスモークテスト
