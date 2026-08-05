# 更新監視（ウォッチ）の運用

## 概要

ウォッチテーマに登録したキーワード・用語を対象に、論文（Crossref/OpenAlex）・特許（Google Patents）・Web（DuckDuckGo/SerpAPI）を横断検索し、未通知のマッチをアプリ内通知として蓄積する。

- 実行基盤: `icrps-watch.timer`（2時間ごと・`RandomizedDelaySec=120`）
- 手動実行: 更新監視画面「今すぐ監視」、または `systemctl start icrps-watch.service`
- 実行履歴: 監査ログ（`watch.run_manual`）＋通知一覧

## 動作ルール

- 有効（`enabled = true`）かつ実行間隔（daily=24h / weekly=168h / monthly=720h）を経過したテーマのみ実行
- 1テーマにつき最大3クエリ（キーワード＋用語を `/`・`,`・空白で分割）、1クエリ最大8件を検索
- 初回実行（`last_checked_at` が NULL）は既存マッチを `kind='baseline'` の既読通知として記録し、初回以降の新規マッチだけを未読通知にする
- 同一（テーマ, 文書）の通知は1回のみ（重複通知なし）
- テーマ間は 700ms 待機し、外部 API の負荷を抑制

## 通知 API

| メソッド | パス | 説明 |
| --- | --- | --- |
| GET | `/api/notifications` | 通知一覧（最大100件） |
| GET | `/api/notifications/unread-count` | 未読件数 |
| POST | `/api/notifications/:id/read` | 1件既読化 |
| POST | `/api/notifications/read-all` | 全既読化 |
| POST | `/api/watch/run` | 自分の有効テーマを今すぐ実行（最大10テーマ） |

## トラブルシューティング

```bash
systemctl status icrps-watch.timer
journalctl -u icrps-watch.service -n 50
```

- 検索コネクタが失敗してもジョブは継続し、該当テーマの `error` として結果に記録される
- 大量の既存マッチが初回に通知されないのはベースライン仕様（既読登録）のため正常
