# 認証基盤の設計（#1）

ステータス: 実装済み（Google OAuth / マジックリンク / パスワードリセット / ログインレート制限）＋
Microsoft OAuth 実装済み・MFA は設計（未実装）

## 1. 認証フロー一覧

| 方式 | 状態 | 監査アクション |
| --- | --- | --- |
| パスワード（bcryptjs + JWT / HttpOnly Cookie） | 実装済み | `auth.login` / `auth.register` |
| Google OAuth 2.0（Authorization Code） | 実装済み（`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`） | `auth.sso_google` |
| Microsoft Entra ID（Azure AD v2） | 実装済み（`MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET`） | `auth.sso_microsoft` |
| マジックリンク（15分・一度きり） | 実装済み | `auth.magic_login` |
| パスワードリセット（24時間・一度きり） | 実装済み | `auth.password_reset` |
| ログアウト | 実装済み | `auth.logout` |
| TOTP MFA | **設計のみ（未実装）** | 実装時に `auth.mfa_enable` / `auth.mfa_verify` / `auth.mfa_disable` |

## 2. セキュリティ対策

- **レート制限**: ログインは IP＋メール単位で 10 回 / 15 分（`rate-limit.ts`・インメモリ）。
  パスワードリセットの案内はユーザー存在有無を漏らさない（常に成功を返す）
- **タイミング攻撃対策**: ログイン失敗はユーザー不在・パスワード誤りを区別しない同一メッセージ
- **監査ログ**: 登録・ログイン・SSO・マジックリンク・パスワード変更/リセット・ログアウトを全て記録
- **Cookie**: HttpOnly + SameSite=Lax + CSRF ダブルサブミット（詳細: [cookie-auth.md](cookie-auth.md)）
- **SSO アカウント作成**: `ALLOWED_EMAIL_DOMAINS` でドメイン制限、初回ログインで自動作成

## 3. Microsoft OAuth フロー（実装済み）

1. `GET /api/auth/sso/microsoft/url` → Entra ID の authorize URL を返す
2. ユーザー同意後、`/api/auth/sso/microsoft/callback?code=...` へリダイレクト
3. `POST https://login.microsoftonline.com/common/oauth2/v2.0/token` でトークン交換
4. `GET https://graph.microsoft.com/oidc/userinfo` で email / name を取得
5. 既存ユーザーと一致、または自動作成して JWT 発行・Cookie 設定・`/login?sso=success` へ

## 4. MFA 設計（TOTP・未実装）

- **方式**: RFC 6238 TOTP（HMAC-SHA1・30 秒・6 桁）。`otplib` 相当を自前実装する場合は `node:crypto` のみで可
- **DB**: `users` に `totp_secret`（AES-256-GCM 暗号化・`crypto.ts` 再利用）と `totp_enabled` を追加（migration 0012）
- **有効化**: 設定画面で secret 生成 → QR（otpauth://）表示 → 初回コード検証で有効化
- **ログイン**: パスワード検証成功後、`mfa_required` を返す。検証用の短命トークン（`purpose: "mfa"`・5分）を発行し、
  `POST /api/auth/mfa/verify` で TOTP 検証後に通常のアクセストークンを発行
- **リカバリー**: リカバリーコード 8 桁 × 5 枚（ハッシュ保存）を発行
- **監査**: 有効化・無効化・検証成功/失敗を監査ログへ記録
- **優先度**: P2（既存の Cookie / SSO / レート制限が整備済みのため、導入は任意）
