# Cookie ベース認証への移行設計

ステータス: 実装済み（v0.11.0・PR 経由でマージ予定）

## 1. 現状の問題

- JWT を `localStorage` に保存しており、XSS 発生時にトークン窃取 → 任意の API 実行リスク
- Bearer 方式は API クライアントには便利だが、ブラウザ向けには HttpOnly Cookie が安全

## 2. 方針

- ブラウザ: HttpOnly Cookie（`icrps_token`）+ SameSite=Lax + Secure（本番）
- CSRF: ダブルサブミット Cookie（`icrps_csrf`）。Cookie 認証を利用する非 GET/HEAD/OPTIONS リクエストに `X-CSRF-Token` ヘッダーを要求
- API クライアント互換: `Authorization: Bearer` は引き続き許容（Cookie 不要・CSRF 検査対象外）
- ログアウト: `POST /api/auth/logout` で両 Cookie を削除

## 3. 変更点

| レイヤー | 変更 |
| --- | --- |
| API | `auth-cookie.ts` 追加（set/clear/get/CSRF）、`requireAuth` が Cookie フォールバック、ログイン/登録/マジック/SSO で Cookie 設定、`/api/auth/logout` 追加、CSRF ミドルウェア |
| Web | `api.ts` を `credentials: include` + CSRF ヘッダーへ変更、localStorage トークン不使用、AuthProvider は常に `/me` で復元 |
| SSO | コールバックを `/login?sso=success` へリダイレクト（Cookie は Set-Cookie で付与） |
| テスト | Cookie 認証の単体（get/set/CSRF）、Web の credentials/CSRF ヘッダー |

## 4. セキュリティ注意

- Cookie `Secure` は本番（https）のみ
- `SameSite=Lax` によりクロスサイト送信を抑制
- トークン有効期限は既存 `JWT_EXPIRES_IN`（12h）をそのまま利用
- ログアウト後は Cookie 削除＋クライアント状態リセット
- API キー等の外部クライアントは Bearer 利用を継続（監査ログで区別）

## 5. 受け入れ条件

- ブラウザでログイン後、リロードでセッション維持
- XSS が発生しても Cookie は HttpOnly のため読み取れない
- CSRF トークン不一致・欠落は 403
- Bearer のみの API クライアントは従来どおり動作
- ログアウト後に Cookie が残らない
