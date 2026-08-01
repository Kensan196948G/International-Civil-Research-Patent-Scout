# 設計概要

正式な詳細設計は [詳細設計仕様書 PDF](../詳細設計仕様書International_Civil_Research__Patent_Scout.pdf) を参照。実装は Cloudflare Workers 互換の Hono + Neon PostgreSQL 構成を採用し、現在は Node.js + systemd でローカル稼働している。

WebUI のデザイン仕様はルート直下の [ICRPS WebUI (standalone).html](../ICRPS%20WebUI%20(standalone).html)（設計成果物）を正とし、React 実装（`apps/web/src/components/StandaloneView.tsx`）は同ファイルのテンプレートを機械変換して生成している。配色・フォント・レイアウト・画面構成の変更は元テンプレートに追従する。

## 実装上の差分判断

| 設計書の案 | 実装 | 理由 |
| --- | --- | --- |
| Next.js / NestJS 案 | React + Vite / Hono（Workers 互換） | ポートフォリオ標準構成と同一化・軽量 |
| Redis Queue / Celery 案 | 同期実行（Phase 2 で Cloudflare Queues を検討） | MVP では要求を満たし、構成を単純化 |
| S3 互換オブジェクト保存 | 未実装（レポートは Markdown で DB 保存） | MVP 範囲では不要 |
| NextAuth 案 | 自前 JWT + bcrypt | 依存を最小化 |
| 全文検索インデックス | 現状は外部 API + DB 保存 | 検索はコネクタ経由のため |

## モジュール構成

| モジュール | 実装 |
| --- | --- |
| Auth | `apps/api/src/auth.ts` + `routes/auth.ts` |
| Research Project | `routes/projects.ts` |
| Search / Connector | `connectors.ts`（Crossref/OpenAlex/Google Patents/DuckDuckGo/SerpAPI） |
| Document | `routes/documents.ts` |
| AI Summary | `ai.ts`（LLM JSON + フォールバック） |
| Comparison | `ai.ts` + `routes/comparisons.ts` |
| Report | `reports.ts` + `routes/reports.ts` |
| Audit | `audit.ts` + `routes/admin.ts` |

## データベース

`db/migrations/0001_initial_schema.sql` に 11 テーブル（users / research_projects / search_queries / source_documents / search_results / project_documents / ai_summaries / comparisons / reports / watch_topics / audit_logs）。

重複排除用に DOI・特許番号・コンテンツハッシュの部分ユニークインデックスを定義。`updated_at` はトリガーで自動更新。
