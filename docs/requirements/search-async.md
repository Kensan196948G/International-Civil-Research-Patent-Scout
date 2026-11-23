# 検索パイプラインの非同期化（#2）

## 1. 状態遷移（永続化）

`search_queries.status` に以下を保存し、UI はポーリングで追従する。

```text
queued → running → completed
                ↘ failed
```

- `POST /api/search` はレコード作成（queued）後、**即時 202** を返す
- 検索ジョブ（`runSearchJob`）が running に更新してからコネクタ実行・結果保存を行う
- 失敗時も `failed` へ更新するため、UI が「実行中」のままになることはない

## 2. 実行方式（ランタイム別）

| 実行環境 | 方式 |
| --- | --- |
| Cloudflare Workers | `c.executionCtx.waitUntil(runSearchJob(...))`（レスポンス後も実行継続） |
| Cloudflare Queues（任意） | `SEARCH_QUEUE` バインディングがあれば `queue.send({searchQueryId})` を優先 |
| Node（ローカル systemd） | `setTimeout(0)` でジョブをスケジュール（リクエスト完了後に実行） |

Queues バインディングは環境変数 `SEARCH_QUEUE`（`WorkerEnv` の任意フィールド）で受け、
`wrangler.jsonc` には現状未定義（キュー作成は Cloudflare 権限回復後に設定）。

## 3. コネクタ別リトライ・指数バックオフ

| コネクタ | タイムアウト | リトライ | 失敗時の扱い |
| --- | --- | --- | --- |
| Crossref / OpenAlex / Web / Google Patents / Espacenet | fetch 8 秒（全体 9 秒） | 1 回・500ms 固定 | 空配列＋`failureSources` に記録し他ソースで継続 |
| 検索ジョブ全体 | - | ジョブ再実行は行わない（failed を永続化） | 次回ユーザー操作で再検索 |
| コネクタ呼び出し | `Promise.allSettled` | クエリ単位で捕捉 | 失敗クエリのみ `failureSources` |

指数バックオフは現状リトライ 1 回のため固定 500ms。リトライ回数を増やす場合は
`fetchText`（`apps/api/src/connectors.ts`）の `retries` とバックオフを拡張する。

## 4. 検証

- 単体: `runSearchJob` の成功（queued→running→completed・結果保存）と失敗（failed）をテストで固定
- E2E: `POST /api/search` が 202 + `status: queued` を即時返し、smoke-e2e のポーリングで完了することを確認
