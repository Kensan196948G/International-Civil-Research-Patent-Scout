# ICRPS テスト証跡（v0.10.0）

実行日: 2026-08-12 / ブランチ: improvement/production-hardening-v0.10.0

## 1. 自動チェック

| コマンド | 結果 | 備考 |
| --- | --- | --- |
| `npm run typecheck` | PASS | contracts / api / web |
| `npm run lint` | PASS | eslint --max-warnings 0 |
| `npm run test` | PASS（API 107 / Web 16 / 合計123） | 追加: auth-policy 5 / fit 2 / cookie-auth 5 |
| `npm run build` | PASS | api tsc + web vite build |
| `npm audit --omit=dev --audit-level=high` | 0 vulnerabilities | |

## 2. 追加テスト

- `apps/api/test/auth-policy.test.ts`: 登録ドメイン制限（open/domain/空リスト）、AI レート制限値のパース
- `apps/api/test/fit.test.ts`: 適用可否チェックのルール照合（根拠文献あり/なし）

## 3. 稼働確認

| 対象 | 結果 |
| --- | --- |
| `http://127.0.0.1:8787/api/health` | 200（db ok） |
| `http://192.168.0.185:8787/api/health` | 200 |
| `https://icrps.mirai-dx-platform.com/api/health` | 302（Cloudflare Access ログインへ。設計どおり） |
| `scripts/smoke-local.sh` | PASS（health 200 / トップ200 / 未認証401） |
| GitHub Actions CI（PR #25） | PASS（typecheck / lint / test / build / audit） |
| GitHub Actions CI（PR #27 / #28） | PASS |
| Cookie/CSRF 実機確認（v0.11.0） | CSRF欠落403・不正トークン401・Cookieなし401 |

## 4. 未実施（理由）

- 本番 DB への migration 0010 適用: 本番影響のため承認待ち
- 本番 DB を使う E2E スモーク（`smoke-e2e.mjs`）: テストデータを本番 DB に作成するため承認待ち
- Cloudflare Preview デプロイ: Cloudflare API トークン/Secrets が必要（未設定）
