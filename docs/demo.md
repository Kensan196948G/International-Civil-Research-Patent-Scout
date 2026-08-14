# ICRPS デモ確認手順（MVP / Prototype）

対象: MVP / Prototype 環境（`https://icrps-mvp.mirai-dx-platform.com`）またはローカル systemd（`http://127.0.0.1:8787`）

MVP 環境は本番とは分離した Neon ブランチ（`icrps-mvp`）を使用し、**全データが架空のダミーデータ**です。

## 1. 準備

```bash
cd /home/kensan/Projects/Mirai-DX-Project/International-Civil-Research-Patent-Scout
npm ci
npm run check          # typecheck / lint / test / build を一括確認
```

## 2. デモデータ投入

```bash
# ローカル運用の接続情報をそのまま使う場合（値は画面へ出力しないこと）
# DATABASE_URL は /etc/icrps/icrps.env（root のみ閲覧可）または環境変数から取得する
DATABASE_URL=postgresql://... npm run seed:demo
```

- 冪等: 2回目以降は「投入済み」と表示され、既存データを変更しません。
- 再投入: `npm run seed:demo -- --force` でデモ分（`@icrps-demo.example` ユーザー、`content_hash = demo-*` の文献）だけ削除して入れ直します。実データ・収集文献・AI 設定は削除しません。
- パスワード等はデモ用固定値（`DemoPass-2026!`）で、Secrets ではありません。

## 3. デモアカウント

| ロール | メール | 備考 |
| --- | --- | --- |
| admin | `demo-admin@icrps-demo.example` | 管理・監査ログ・システム設定を確認可 |
| user | `demo-researcher@icrps-demo.example` | 一般ユーザー（共有プロジェクト・チーム） |
| viewer | `demo-viewer@icrps-demo.example` | 閲覧専用 |

## 4. 画面で確認する主要フロー

1. `/login` にデモ管理者でログイン（Cookie 認証・CSRF が動作）
2. `/dashboard`: 統計カード・ダイジェスト・トレンド・アラート・最近のプロジェクト
3. `/feed`: 保存文献タブ（デモ文献 16 件）と収集文献タブ（J-STAGE 等の自動収集分）
4. `/search`: デフォルト検索の実行（完了後にファセット・CSV 出力・ブックマーク）
5. `/documents/:id`: AI 要約・レビュー（採用/却下/編集）・引用ネットワーク・特許ファミリー
6. `/projects`: プロジェクト一覧・メンバー共有・チーム割当・オーナー移譲
7. `/compare`: 保存文献から比較表を生成（CSV 出力可）
8. `/fit`: 適用可否チェック（ルールベース・根拠文献付き）
9. `/report`: レポート生成（5 テンプレート）→ Markdown / Word / Excel / 印刷
10. `/chat`: 保存文献に対する出典付き Q&A
11. `/watch`: ウォッチテーマの登録・ON/OFF・今すぐ監視・通知
12. `/admin`（admin のみ）: ユーザー管理・監査ログ・システム統計・LLM 使用量
13. `/settings`（admin のみ）: AI プロバイダ設定・文献データ連携（取得履歴・今すぐ取得）

## 5. API での一括確認

```bash
curl -s http://127.0.0.1:8787/api/health
# {"ok":true,"app":"icrps-api","version":"0.12.2","env":"mvp","db":"ok",...}

BASE_URL=http://127.0.0.1:8787 node scripts/smoke-e2e.mjs
# 登録→プロジェクト→検索→保存→要約→比較→レポート→エクスポート→ウォッチ→チャットまで自動実行

# 実ブラウザ E2E（Firefox・Playwright。初回のみ npm i --no-save playwright@1.49.1）
npm run smoke:ui
# ログイン→ダッシュボード→フィード→文書詳細→検索→プロジェクト→比較→適用可否→
# レポート→チャット→ウォッチ→管理→システム設定→ログアウトまで実操作で確認
```

## 6. デモデータの構成（件数はシード実行時の実値）

| テーブル | 件数 | 内容 |
| --- | --- | --- |
| users | 6 | admin 1 / user 3 / viewer 2（全て架空） |
| research_projects | 7 | active 4 / completed 2 / archived 1 |
| project_members | 6 | 共有設定 |
| teams / team_members | 3 / 8 | 材料・構造・施工技術G |
| source_documents | 28 | デモ文献（情報源別の収集タブ用 12 件含む） |
| search_queries / results | 5 / 18 | 完了・失敗・ブックマーク |
| project_documents | 22 | タグ・重要度・メモ・状態 |
| ai_summaries | 25 | 全要約種別・全レビュー状態 |
| comparisons | 3 | 低炭素 / UAV / 点検DX |
| reports | 5 | 全 5 テンプレート |
| watch_topics / notifications | 5 / 8 | 全頻度・既読/未読 |
| audit_logs / llm_usage | 27 / 12 | 操作履歴（ingest.run 含む）・コスト見積り |
| auth_tokens | 2 | 期限切れリセット・使用済みマジック |

※ ローカル環境に実運用ユーザーがいる場合は users が 1 名増えます（MVP 環境はデモ 6 名のみ）。

## 7. 注意

- デモデータはすべて架空です。実在の企業・人物・案件とは無関係です。
- UI/API には「デモ用」表記または免責文が表示されます。
- 収集文献（J-STAGE 等）は公開メタデータのみで、本文は保存していません。
- 本番 DB・本番デプロイ・実データ投入には本手順を使用しないでください。
