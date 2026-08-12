# API 仕様

ベース: ローカル `http://<IP>:8787/api`（将来はサブドメイン決定後に `https://<sub>.mirai-dx-platform.com/api`）

## 認証

`POST /api/auth/register` / `POST /api/auth/login`

```json
{ "email": "user@example.com", "password": "password", "name": "User" }
```

レスポンス: `{ "accessToken": "jwt", "user": { id, email, name, role, createdAt, updatedAt } }`

認証が必要なエンドポイントには `Authorization: Bearer <token>` を付与。トークン期限は 12 時間（`JWT_EXPIRES_IN` で変更可）。

ブラウザではログイン/登録/マジックリンク/SSO 時に HttpOnly Cookie（`icrps_token`）と CSRF Cookie（`icrps_csrf`）が設定されます。
Cookie 認証を利用する非 GET/HEAD リクエストには `X-CSRF-Token` ヘッダーが必要です（Web UI は自動付与）。
`POST /api/auth/logout` で Cookie を削除します。外部 API クライアントは従来どおり Bearer を使用できます。

## エラー形式

すべてのエラーは `{ "error": { "code", "message", "details?" } }`。ステータスは 400/401/403/404/409/500。

## 主要エンドポイント

| メソッド | パス | 認証 | 説明 |
| --- | --- | --- | --- |
| GET | `/health` | - | `{ ok, app, version, env, db }` |
| POST | `/auth/register` | - | ユーザー登録 |
| POST | `/auth/login` | - | ログイン |
| GET | `/auth/me` | ○ | 現在のユーザー |
| POST | `/auth/change-password` | ○ | パスワード変更（`{ currentPassword, newPassword }`） |
| GET | `/projects` | ○ | プロジェクト一覧 |
| POST | `/projects` | ○ | 作成 |
| GET | `/projects/{id}` | ○ | 詳細（+ 保存文書・比較表・レポート） |
| PATCH | `/projects/{id}` | ○ | 更新 |
| DELETE | `/projects/{id}` | ○ | アーカイブ |
| POST | `/search` | ○ | 横断検索（同期実行、`searchQueryId` 返却） |
| GET | `/search/{id}` | ○ | 検索状態・結果 |
| GET | `/search/history` | ○ | 検索履歴（`limit` 指定可・最大100件） |
| GET | `/documents/{id}` | ○ | 文書詳細 + 既存要約 |
| POST | `/documents/{id}/summarize` | ○ | `{ summaryType, language }` で要約生成 |
| PATCH | `/documents/{id}/summaries/{summaryId}` | ○ | 要約レビュー状態を保存 `{ status: pending|approved|rejected|edited, summaryText? }` |
| POST | `/documents/import` | ○ | 手動文献登録（URL/DOI/特許番号のいずれか必須。`projectId` 指定で同時保存） |
| POST | `/projects/{id}/documents` | ○ | 文書をプロジェクトへ保存 |
| GET | `/projects/{id}/documents` | ○ | 保存文書一覧 |
| PATCH/DELETE | `/projects/{id}/documents/{pdId}` | ○ | 保存文書更新・削除 |
| POST | `/projects/{id}/comparisons` | ○ | `{ documentIds, axes }` で比較表生成 |
| GET/PATCH | `/comparisons/{id}` | ○ | 比較表取得・編集 |
| POST | `/projects/{id}/reports` | ○ | `{ title, reportType, documentIds, comparisonId? }` |
| GET | `/reports/{id}` | ○ | レポート取得 |
| POST | `/reports/{id}/export` | ○ | Markdown ダウンロード |
| GET | `/dashboard/stats` | ○ | 統計 |
| GET | `/admin/users` | ○ admin | ユーザー一覧 |
| PATCH | `/admin/users/{id}/role` | ○ admin | ロール変更 |
| GET | `/admin/audit-logs` | ○ admin | 監査ログ |
| GET | `/admin/settings` | ○ admin | システム設定（AI プロバイダの設定状態・モデル。キー値は返さない） |
| PUT | `/admin/settings/ai` | ○ admin | AI 設定保存（DeepSeek / Anthropic の API キー・モデル。キーは AES-256-GCM で暗号化保存） |
| POST | `/admin/settings/ai/test` | ○ admin | AI 接続テスト（キー未指定時は保存済みキーを使用。保存はしない） |
| DELETE | `/admin/settings/ai/{deepseek\|anthropic}` | ○ admin | 保存済みキーの削除 |
| GET | `/admin/ingest/runs` | ○ admin | 文献収集の実行履歴（audit_logs の `ingest.run` を最大50件） |
| POST | `/admin/ingest/run` | ○ admin | 文献収集を手動実行（J-STAGE / 土木研究所 / ITC / 国交省 / 関東地整） |
| GET | `/watch` | ○ | ウォッチテーマ一覧 |
| POST | `/watch` | ○ | ウォッチテーマ登録（テーマ名・キーワード・頻度） |
| PATCH | `/watch/{id}` | ○ | 有効/停止・キーワード更新 |
| DELETE | `/watch/{id}` | ○ | ウォッチテーマ削除 |
| POST | `/watch/run` | ○ | 自分の有効テーマを今すぐ監視実行（最大10テーマ） |
| GET | `/notifications` | ○ | 通知一覧（`limit` 指定可・最大100件） |
| GET | `/notifications/unread-count` | ○ | 未読通知数 |
| POST | `/notifications/{id}/read` | ○ | 通知を既読化 |
| POST | `/notifications/read-all` | ○ | 全通知を既読化 |
| GET | `/literature` | ○ | 収集文献一覧（`source`=all/jstage/pwri/itc/mlit/ktr、`q`、`limit`(最大100)、`offset`） |
| POST | `/chat` | ○ | 保存文献ベースの AI チャット（出典付き回答・ルール応答フォールバック） |
| POST | `/fit` | ○ | 適用可否チェック（`{ workType, environment, designStrength, cover, serviceLife, co2Target, candidates }`。ルールベース照合） |
| GET | `/admin/stats` | ○ admin | システム統計（ユーザー・文献種別・検索/比較/レポート・ウォッチ・収集実行） |

## 認証・登録ポリシー

- `REGISTRATION_MODE=domain` 時、`ALLOWED_EMAIL_DOMAINS` に含まれないドメインの登録・SSO アカウント作成は 403 で拒否されます。
- `BOOTSTRAP_ADMIN_EMAIL` に一致するユーザーは、システムに管理者が 1 人もいない場合に admin ロールで作成/昇格されます。
- AI を利用するエンドポイント（検索・要約・比較・レポート・チャット）は、ユーザー単位で 1 時間あたり `AI_RATE_LIMIT_PER_HOUR` 回（既定 100）を超えると 429 を返します。LLM 使用量は `llm_usage.user_id` に帰属記録されます。

## 検索リクエスト例

```json
{
  "projectId": "uuid",
  "query": "低炭素コンクリート",
  "languageMode": "bilingual",
  "sourceTypes": ["web", "paper", "patent"],
  "countries": ["JP", "US"],
  "yearFrom": 2015,
  "yearTo": 2026,
  "includeSynonyms": true,
  "includeTranslation": true,
  "maxResults": 20
}
```

## レポートタイプ

| 値 | 意味 |
| --- | --- |
| `summary` | 調査概要レポート |
| `technical_comparison` | 技術比較レポート |
| `patent_survey` | 特許調査レポート |
| `paper_review` | 論文レビュー |
| `proposal_research` | 技術提案下調べ |
