# 実装ブリーフ（エージェント共通）

> ⚠️ この文書は 2026-07-31 時点の実装開始前ブリーフです。現在は v0.10.0 まで実装・本番適用済みです。
> 最新の機能・構成・運用は [README](../README.md)、[設計概要](design.md)、[API 仕様](api.md) を参照してください。
> 本ブリーフは過去の経緯記録として保持します（例: 「実コード・リポジトリ・本番デプロイは存在しない」等の記述は現在と一致しません）。

## 1. 現状と方針

- このリポジトリは現在「要件定義書 PDF + 詳細設計仕様書 PDF」のみで、実コード・GitHub リポジトリ・本番デプロイは存在しない。
- 目的: 設計書（`/home/kensan/Projects/Mirai-DX-Project/International-Civil-Research-Patent-Scout/要件定義International_Civil_Research__Patent_Scout.pdf` と `詳細設計仕様書...pdf`、テキスト抽出版 `/tmp/patent_requirements.txt`・`/tmp/patent_design.txt`）に基づき、ポートフォリオ標準構成（Cloudflare Workers + Hono + React/Vite + Neon PostgreSQL）で MVP を実装する。
- 本番サブドメインは未承認。DNS 変更・custom_domain 設定・本番デプロイを絶対に行わない。プレビュー（workers.dev）もコード完成・検証後に root が判断する。
- 秘密情報（DATABASE_URL、JWT_SECRET、API キー等）をコード・コミット・ログへ書かない。`.env.example` / `.dev.vars.example` のみ。

## 2. 標準構成（先行プロジェクト参照）

参考: `/home/kensan/Projects/Mirai-DX-Project/Public-Works-Stakeholder-Map`
- apps/web = React 19 + Vite + TypeScript（プレーン CSS）
- apps/api = Hono on Cloudflare Workers、`@neondatabase/serverless`、wrangler の assets で web の dist を同オリジン配信、`/api/*` のみ Worker 処理
- secrets は `wrangler secret put`、config に書かない

## 3. モノレポ構成

```
apps/
  api/       # Cloudflare Workers API（本タスクの中心）
  web/       # React Web UI
packages/
  contracts/ # 共有型定義（@icrps/contracts）※既存・完成済み
db/
  migrations/0001_initial_schema.sql  # 既存・完成済み
docs/        # 各種ドキュメント
scripts/     # migrate 等の運用スクリプト
```

共有型定義は `packages/contracts/src/index.ts` をそのまま import する（型の重複定義禁止）。

## 4. API 実装要件（apps/api）

依存: hono、zod、jose、bcryptjs、@neondatabase/serverless、@icrps/contracts。ビルドは `tsc -b`、テストは vitest（Node 環境）、ローカル実行は `wrangler dev`。

### 4.1 エンドポイント

- `GET /api/health` → `{ok:true, env, db:"ok"|"degraded", version}`
- `POST /api/auth/register` / `POST /api/auth/login` / `GET /api/auth/me`
- `GET|POST /api/projects`、`GET|PATCH|DELETE /api/projects/:id`（DELETE はアーカイブ）
- `POST /api/search`（横断検索。同期実行し `searchQueryId` を返す。外部 API 障害時は成功ソースのみで完了、`failureSources` に記録）
- `GET /api/search/:id`（状態と結果。`results` は rank 順）
- `GET /api/documents/:id`、`POST /api/documents/:id/summarize`
- `POST /api/projects/:id/documents`（文書保存）、`GET /api/projects/:id/documents`、`PATCH|DELETE /api/projects/:id/documents/:projectDocumentId`
- `POST /api/projects/:id/comparisons`、`GET|PATCH /api/comparisons/:id`
- `POST /api/projects/:id/reports`、`GET /api/reports/:id`、`POST /api/reports/:id/export`（Markdown を返す）
- `GET /api/dashboard/stats`
- `GET /api/admin/users`、`PATCH /api/admin/users/:id/role`（admin のみ）

詳細仕様は `/tmp/patent_design.txt` 6章を厳守（リクエスト/レスポンス形）。zod でバリデーションし、エラーは `{error:{code,message,details?}}` 形式で 400/401/403/404/409/500 を返す。

### 4.2 認証・認可
- パスワードは bcryptjs でハッシュ化。JWT は jose（HS256、`JWT_SECRET`、有効期限 `JWT_EXPIRES_IN` 既定 12h）。
- `Authorization: Bearer <token>` を検証するミドルウェア。admin のみのルートはロール確認。
- 全ユーザー操作は `owner_user_id` の所有権チェック必須。
- ログイン/検索/保存/要約/比較/レポート生成/エクスポートを audit_logs に記録（本文・パスワード等の機密は detail に含めない）。

### 4.3 検索コネクタ（src/connectors）
- `SearchConnector` 共通インターフェース（設計書 7.1）。
- PaperConnector: Crossref（`/works?query=...`）+ OpenAlex（`https://api.openalex.org/works?search=...`）。DOI・著者・発行年・要旨を取得。fetch タイムアウト 8 秒、リトライ 2 回（指数バックオフ）。
- PatentConnector: Google Patents 検索ページをメタデータのみ取得（robots.txt 遵守・レート制限 1 req/秒・HTML パースは簡易正規表現で十分。失敗時は空配列+失敗記録で継続）。
- WebConnector: `SERP_API_KEY` が設定されていれば汎用 SERP（設計自由）を使用し、未設定なら DuckDuckGo の HTML 版を best-effort で試行。失敗時は空+失敗記録。
- 各コネクタは `SearchConnectorResult`（contracts 定義）を返し、検索パイプラインが正規化・重複排除・スコアリングして `source_documents` に保存する。
- 重複排除: DOI / patent_number / 正規化 URL / content_hash（設計書 9.1）。
- 関連度: `keyword_match*0.35 + source_reliability*0.20 + freshness*0.15 + importance*0.15 + preference*0.15`（9.2、preference は 0.5 固定で良い）。

### 4.4 AI サービス（src/services）
- `OPENAI_API_KEY` 未設定時は**ルールベースのフォールバック**で動作する（要約=タイトル+要旨+出典のテンプレート、キーワード展開=内蔵土木用語辞書）。設定時は OpenAI 互換 API に JSON で出力させ、zod で JSON Schema 検証。失敗時もフォールバック。
- 要約出力は設計書 8.3（evidence/uncertainties 含む）、特許要約は 8.4。`modelName`・`promptVersion` を ai_summaries に保存。
- 比較生成は 8.5 の形式。フォールバックは各文書の要約から軸ごとに抜粋。
- レポートは Markdown テンプレート（設計書 11.1 の 5 種）を実装。AI がなくても生成できる。

### 4.5 DB アクセス
- `@neondatabase/serverless` の `neon(env.DATABASE_URL)`。クエリはパラメータ化のみ（SQL インジェクション禁止）。
- マイグレーションは `db/migrations/0001_initial_schema.sql` を利用（変更しない）。
- `scripts/migrate.mjs` を root に作成（`DATABASE_URL` から `db/migrations/*.sql` を順に実行、完了ログ出力）。

### 4.6 テスト（test/）
- 純粋ロジック: 重複排除、スコアリング、キーワード辞書フォールバック、レポート Markdown、JSON バリデーション
- 認証: bcrypt/JWT の unit
- ルート: リポジトリをモックした Hono ルートテスト（認可・バリデーション）
- 外部 API はモック fetch（`vi.stubGlobal`）

## 5. Web 実装要件（apps/web）

- React 19 + Vite + react-router-dom（v7、BrowserRouter）。プレーン CSS（`src/styles.css`、CSS 変数利用）。
- 画面: `/login`、`/register`、`/dashboard`、`/search`、`/documents/:id`、`/projects/:id`、`/projects/:id/comparison`、`/projects/:id/reports/new`、`/reports/:id`、`/admin`（admin のみ）
- `src/api.ts`: fetch ラッパー（Bearer token を localStorage 保存、401 で /login へ、エラーは `ApiErrorBody` を throw）
- レイアウト: ヘッダー（ログイン状態・ナビ・ログアウト）、ページ共通フッターに免責文（`DISCLAIMER` を contracts から import）
- ダッシュボード: 統計カード、最近のプロジェクト、最近のレポート
- 検索: フォーム（キーワード、言語モード、情報種別、国、年範囲、同義語/翻訳展開、件数）、結果カード（情報種別バッジ、タイトル、要約、URL、公開日、関連度、保存ボタン、比較追加ボタン）、進行中表示（ポーリング）
- 文書詳細: メタデータ + AI 要約（メリット/デメリット/適用条件/注意点/引用） + 要約種別選択
- プロジェクト: テーマ編集、保存文書一覧（タグ・メモ・重要度・ステータス）、比較作成、レポート生成への導線
- 比較: 軸と行の表、編集（PATCH）
- レポート: テンプレート選択 → 生成 → Markdown 表示・エクスポート
- 管理: ユーザー一覧・ロール変更（admin のみ）
- 全画面日本語 UI。アクセシビリティ（label、alt、focus スタイル）に配慮。
- テスト（test/）: `api.ts` の unit、`App` の描画スモーク、検索フォーム等の主要コンポーネント。

## 6. 共通ルール

- ファイル編集は `apply_patch` を使用。`cat > file` などの書き込みをしない。
- `npm install` は root で実行し、ロックファイルをコミット対象にする（node_modules は不要）。
- `npm run typecheck && npm run lint && npm run test && npm run build` を自分の担当範囲で必ず成功させる。
- 本番デプロイ・GitHub 操作・Cloudflare/Neon リソース作成・サブドメイン設定は root のみが行う。エージェントは行わない。
- スキル: Cloudflare/Neon/Wrangler 関連の作業前に該当 SKILL.md（`/home/kensan/.codex/skills/cloudflare/SKILL.md`、`/home/kensan/.codex/plugins/cache/openai-curated/neon-postgres/11c74d6b/skills/neon-postgres/SKILL.md`、`/home/kensan/.codex/skills/wrangler/SKILL.md`）を読む。
- 設計書と矛盾する場合は設計書を優先し、判断した内容を最終報告に残す。
