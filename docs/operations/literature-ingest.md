# 土木建設技術文献データ連携（運用手順）

## 概要

指定された土木建設技術文献の情報源からメタデータを定期的に取得し、`source_documents` へ蓄積する機能です。
取得データは **メタデータ（タイトル・著者・要旨・DOI/URL）のみ** で、本文・PDF・画像は保存しません。

| 情報源 | 種別 | 取得方式 | robots.txt / 規約 |
| --- | --- | --- | --- |
| J-STAGE（`api.jstage.jst.go.jp`） | 論文 | 公式 WebAPI（service=3・Atom/OpenSearch） | 公式 API マニュアル準拠（Ver.2.0） |
| 土木研究所（`thesis.pwri.go.jp`） | 論文・報告書 | 新着一覧 HTML パース | robots.txt なし（利用条件ページあり・要確認） |
| ITC Digital Library（`itc.scix.net`） | 論文 | 年別一覧 + 詳細ページ | robots.txt なし（1件 0.5秒以上の間隔・上限100件/回） |
| 国土交通省 技術調査（`mlit.go.jp/tec`） | Web | 記事リンク抽出 | robots.txt なし（ページ単位の取得） |
| 関東地方整備局 技術情報（`ktr.mlit.go.jp/gijyutu`） | Web | 記事リンク抽出 | robots.txt なし（ページ単位の取得） |

対象外: PATENTSCOPE / J-PlatPat（認証・契約・レート制限のため。後日、手動取り込み UI を検討）

## スケジュール

- `icrps-ingest.timer`: 2時間ごと（`OnCalendar=*-*-* 0/2:00:00`、`RandomizedDelaySec=90`）
- 実行ユニット: `icrps-ingest.service`（Type=oneshot・`/etc/icrps/icrps.env` から環境変数を読込・User=kensan）
- 実行プログラム: `apps/api/dist/src/ingest-cli.js`（Node.js・Neon へ直接書き込み）

## 操作

```bash
# 状態確認
systemctl status icrps-ingest.timer
systemctl list-timers icrps-ingest.timer

# 手動実行（タイマーと独立）
sudo systemctl start icrps-ingest.service

# 実行ログ
journalctl -u icrps-ingest.service -n 50
```

管理画面からも手動実行できます: `/settings` → 文献データ連携 → 「今すぐ取得」

## 収集結果の確認

```sql
-- 情報源別の蓄積件数
SELECT source_name, count(*) FROM source_documents
WHERE source_name LIKE '%ITC%' OR source_name LIKE '%国土交通省%'
   OR source_name LIKE '%関東地方整備局%' OR source_name LIKE '%論文集%'
GROUP BY source_name ORDER BY count(*) DESC;

-- 直近の実行履歴
SELECT created_at, detail FROM audit_logs WHERE action = 'ingest.run' ORDER BY created_at DESC LIMIT 10;
```

## 重複排除と冪等性

- 同一 DOI / URL は `source_documents.content_hash` の一意制約（部分インデックス）により二重登録されません
- 一括登録は `ON CONFLICT (content_hash) DO NOTHING`（新規のみ・既存行の変更なし）
- ITC は既知 URL を一括照会してから詳細ページを取得するため、再実行時の負荷は小さい
- J-STAGE は「土木・建設・構造」の資料名検索で、直近 2 年分を最大 3000 件/資料名取得（既存分は自動スキップ）

## 障害時の挙動

- ソースごとに try/catch され、失敗は `audit_logs`（action=`ingest.run`・status=error）に記録
- 失敗ソースがあっても他ソースは継続実行
- 次回タイマー実行時に自動リトライ
- 外部サイトの仕様変更でパースが失敗した場合は、`apps/api/src/literature/` のパーサを実測 HTML で更新する

## 監視アラート（推奨）

`RESEND_API_KEY` / `EMAIL_FROM` / `ADMIN_EMAIL` を設定すると、ソース単位の失敗を管理者メールへ自動通知します。
未設定時は監査ログ（`ingest.run`・status=error）への記録のみです。Slack 等への通知は必要に応じて
`icrps-ingest.service` の `OnFailure=` で通知ユニットを追加してください。

## 関連ファイル

- コレクタ: `apps/api/src/literature/`（jstage / pwri / itc / mlit / ktr）
- ランナー: `apps/api/src/literature/index.ts` / `apps/api/src/ingest-cli.ts`
- 一括登録: `apps/api/src/repositories.ts`（`insertDocumentsBatch`）
- 管理者 API: `apps/api/src/routes/admin.ts`（`GET/POST /api/admin/ingest/*`）
- 管理画面: `apps/web/src/components/StandaloneView.tsx` / `lib/standalone-data.ts`
- タイマー: `deploy/systemd/icrps-ingest.timer` / `icrps-ingest.service` / `deploy/install-ingest.sh`
