# AI プロンプト・モデル・検証方針（#5）

## 1. モデル・プロバイダ設定

| 設定 | 既定値 | 説明 |
| --- | --- | --- |
| `OPENAI_API_KEY` | 未設定 | OpenAI 互換 API のキー（未設定時はルールベースフォールバック） |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` | OpenAI 互換エンドポイント（DeepSeek 等は `/chat/completions` に正規化） |
| `AI_MODEL` | `gpt-4o-mini` | 既定モデル名 |
| システム設定画面 | DeepSeek / Anthropic | 保存済みキー・モデル（AES-256-GCM 暗号化）。テスト・保存・クリア可 |

設定は `/etc/icrps/icrps.env`（systemd）または環境変数で管理し、リポジトリへ保存しない。

## 2. プロンプト（v1）

### 技術要約（`summarizeDocument` / `promptVersion: "v1"`）

- system: 「土木技術調査の専門アシスタント。指定言語で JSON のみ出力」
- user: 出力形式（`summary` / `technicalCategory` / `keyPoints[]` / `merits[]` / `demerits[]` /
  `applicationConditions[]` / `risks[]` / `evidence[{claim,sourceUrl,quote}]` / `uncertainties[]`）と文書メタデータ
- 指針: 公開情報に基づく調査支援。出典にない断定を避け、推測は「推測」と明記

### 特許要約（`summaryType: "patent"`）

- 出力: `summary` / `patentOverview` / `problemToSolve` / `solution` / `mainClaimsSummary` /
  `applicants` / `inventors` / `publicationNumber` / `filingDate` / `publicationDate` /
  `technologyKeywords` / `possibleRelevance` / `caution`
- 指針: 特許の法的有効性・侵害判断は行わない旨を明記

### 比較表（`generateComparison`）

- 出力: `title` / `axes[]` / `rows[{technologyName, values, sourceDocumentIds[]}]` / `notes[]`
- 指針: 出典にない断定を避け、注意点に「要専門家確認」を含める

### レポート（`generateReportWithAi` / `promptVersion: "v1-ai"`）

- 出力: Markdown 本文（テンプレート 5 種と章立て提案に基づく）
- 失敗時: `v1-template` のテンプレート Markdown へフォールバック

### チャット（`answerChat`）

- system: 保存文献の範囲内で回答し、出典のない主張は表示しない
- user: 質問＋保存文献（件数上限内）
- ルールフォールバック: 保存文献・全体文献のキーワード照合で回答

## 3. 出力検証と再試行

- `callLlmJson` は全 AI 出力を `validateJsonOutput` で検証する
  - required キーの存在（summary / title 等）
  - 型チェック（string / string[] / object / object[]）
  - ネスト検証（evidence 等の必須フィールド）
- 検証失敗・JSON パース失敗・空応答は **1 回だけ再試行**（同一プロンプト）
- API エラー（HTTP 4xx/5xx）は再試行しない（コスト・遅延抑制）
- 再試行後も失敗した場合、各機能はルールベースフォールバックを返す

## 4. トークン・実行時間の記録

- 成功した LLM 応答は `llm_usage` へ記録（`user_id` / `action` / `provider` / `model` /
  `input_tokens` / `output_tokens` / `cost_estimate` / `duration_ms`）
- 管理画面「LLM 使用量（直近30日）」と監査ログ（「AI 操作は入力・モデル・信頼度まで記録」）で確認
- トークン 0 の応答は記録しない（フォールバックは記録対象外）

## 5. 変更手順

1. `apps/api/src/ai.ts` 等のプロンプト・スキーマを変更
2. 本ノートの該当セクションを更新
3. `promptVersion` を `v2` 等へ更新（要約・比較・レポートは保存データに記録され、追跡可能）
4. `npm run test --workspace @icrps/api` でスキーマ検証・フォールバックテストを実行
