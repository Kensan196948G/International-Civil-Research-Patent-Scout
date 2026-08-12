# ICRPS 統合評価・改善報告書（v0.10.0）

報告日: 2026-08-12 / 対象: International-Civil-Research-Patent-Scout（ICRPS）
評価・改善ブランチ: `improvement/production-hardening-v0.10.0`（PR: https://github.com/Kensan196948G/International-Civil-Research-Patent-Scout/pull/25）

## 1. プロジェクト概要

| 項目 | 内容 |
| --- | --- |
| 目的 | 国際土木技術・論文・特許リサーチ支援（検索・要約・比較・レポート・更新監視） |
| 利用者 | 技術研究所・現場・本社・経営層・協力会社（従業員約600名、IT/DX 7名） |
| 業務課題 | 調査の初期検討（技術提案・工法比較・知財確認）を横断検索と AI 要約で効率化 |
| 提供価値 | 公的一次情報の横断収集、日英展開、要約/比較/レポート、ウォッチ通知 |
| 完成段階 | v0.9.0 本番稼働中（Cloudflare カスタムドメイン＋ローカル systemd）→ v0.10.0 評価版実装済み |
| 運用段階 | 実運用準備（少数ITで運用可能な自動化は一定程度整備済み、承認・復旧・監査の仕上げが残る） |

## 2. 総合評価

| 指標 | 改善前（v0.9.0） | 改善後（v0.10.0） |
| --- | --- | --- |
| 18 項目平均 | 59.6 / 100 | 64.1 / 100 |
| 総合判定 | 条件付き利用可 | 条件付き利用可（Phase 0〜1 完了で本番標準運用可） |
| 代替率（加重） | 51.8% | 61.5%（見込み） |
| テスト | API 93 / Web 15 | API 100 / Web 15（合計115） |
| lint / typecheck / build / audit | すべて PASS | すべて PASS |

採点・根拠・競合比較の詳細は [baseline.md](baseline.md) を参照。

## 3. 最大の強み（5件）

1. 検索→保存→要約→比較→レポート→ウォッチの一気通貫フロー
2. 土木分野に特化した日英辞書と公的一次情報コネクタ（J-STAGE/PWRI/ITC/MLIT/KTR/Crossref/OpenAlex）
3. LLM 未設定・外部 API 障害時にも落ちないフォールバック設計
4. 低コスト基盤（Cloudflare Workers + Neon）とシークレットの分離管理
5. 運用文書・監査・バックアップ検証を含む実運用の土台

## 4. 重大な弱み（5件）

1. 登録制御が未設定（v0.10 で `REGISTRATION_MODE=domain` を追加したが本番設定は承認待ち）
2. JWT を localStorage に保持（XSS 時トークン窃取リスク）
3. AI 出力の人間承認・プロンプトインジェクション対策・予算停止手段が未実装（レート制限は追加済み）
4. バックアップ復元の実地試験未実施・SLO 計測/アラート実装なし
5. 外部サイト HTML パース依存（Google Patents/DuckDuckGo）と特許 DB（J-PlatPat/PATENTSCOPE）未連携

## 5. 実装済み改善（v0.10.0）

| 区分 | 内容 |
| --- | --- |
| セキュリティ | 登録ドメイン制限、初回管理者ブートストラップ、SSO コールバック修正、AI レート制限 |
| 監査・品質 | 監査ログのユーザー名表示、AI 要約レビュー（採用/却下/編集）永続化、LLM 使用量のユーザー帰属 |
| 検索 | 展開クエリ並列化、未実装 pdf 種別の除去、失敗ソースの UI 表示 |
| 機能 | 適用可否チェックのサーバー API 化（ルールベース）、レポート想定読者・生成後エクスポート |
| UI | AI 状態/モデル/件数の実値表示、ヘッダー検索接続、通知 60 秒ポーリング、共有プロジェクト統計 |
| 文書 | README/API/設計/運用/台帳更新、v0.10.0 リリースノート、評価文書一式 |

## 6. 最優先改善 10 件（残）

1. 本番環境へ `REGISTRATION_MODE=domain`・許可ドメイン・`BOOTSTRAP_ADMIN_EMAIL` を設定
2. migration 0010 の本番適用（承認後）
3. Cookie ベース認証（HttpOnly + CSRF）への移行
4. バックアップ復元の実地試験と結果記録
5. E2E スモークの CI 組込み（プレビューDB）
6. 監査ログへの IP・User-Agent・request_id 記録
7. AI 月次予算上限・自動停止・通知
8. 真の docx/xlsx/pdf エクスポート
9. プロンプトインジェクション対策と AI 出力の承認ワークフロー
10. 収集データ品質ダッシュボード（欠損率・重複率・更新日）

## 7. 追加推奨機能 10 件

1. 調査テーマのレビュー/承認ワークフロー
2. 技術ランドスケープ図（出願人×分類×年）
3. 引用ネットワーク可視化
4. PWA＋オフラインキャッシュ
5. Teams/メールのダイジェスト配信
6. J-PlatPat/PATENTSCOPE 手動取り込み UI
7. Entra ID SSO・SCIM 連携
8. SharePoint/Teams へのレポート自動保存
9. 監査ログのエクスポート・保持期間設定
10. 工種・環境条件テンプレート（示方書リンク付き）

## 8. commit・PR・CI・デプロイ状況

- ブランチ: `improvement/production-hardening-v0.10.0`（main から作成）
- ローカル検証: typecheck / lint / test（115）/ build / npm audit すべて PASS
- 稼働確認: `http://127.0.0.1:8787` 200・LAN 200・Cloudflare 302（Access 設計どおり）
- CI: PR #25 の GitHub Actions PASS（typecheck / lint / test / build / audit）
- デプロイ: 本番（ローカル systemd / Cloudflare）への v0.10.0 適用は未実施（承認待ち）

## 9. 残課題

- 本番 DB への migration 0010 適用（要承認）
- 本番 env への登録制御・AI レート設定（要承認）
- Cookie 認証・MFA・SCIM（Phase 1）
- 復元試験・SLO 計測・アラート実装（Phase 1）
- 特許 DB・社内システム連携・PWA（Phase 2〜3）
- 詳細な残課題は [improvements.md](improvements.md)・[test-evidence.md](test-evidence.md) を参照

## 10. 投資判断

**条件付き継続（推奨）**

現在の構成は低コストで調査業務の初期段階を自動化でき、継続投資の価値はある。
ただし本番標準運用の前に、Phase 0（登録制御・migration 0010 適用・SSO 設定）と
Phase 1（Cookie 認証・復旧試験・E2E CI・AI 承認）を完了させること。

## 11. 次に着手すべき具体的作業

1. 本番 env へ登録制御・初回管理者・AI レート制限を設定し、migration 0010 を適用
2. 本ブランチの PR をレビュー・マージし、v0.10.0 をローカル systemd へデプロイ
3. Cookie 認証化の設計と実装（Phase 1 最初のタスク）
4. 復元試験を四半期計画へ登録し、日次点検の通知先を確認
5. 特許コネクタ（J-PlatPat/PATENTSCOPE）と品質ダッシュボードの要件定義

## 12. ロードマップ

| Phase | 内容 | 目標 |
| --- | --- | --- |
| Phase 0 | 重大問題・セキュリティ（登録制御、migration、SSO、AI コスト、監査強化） | 2026年8月 |
| Phase 1 | 中核業務完成（Cookie 認証、復旧試験、E2E CI、承認ワークフロー、真のエクスポート） | 2026年Q4 |
| Phase 2 | 競合製品 80% 代替（特許分析ダッシュボード、品質監視、検索強化） | 2027年Q1 |
| Phase 3 | AI・モバイル・外部連携（Entra/Teams/SharePoint、PWA、AI 予算・評価） | 2027年Q2 |
| Phase 4 | 90% 代替・本番最適化（ランドスケープ、協力会社ポータル、DR 構成） | 2027年Q4 |

## 13. 追記（2026-08-12 v0.11.0 完了分）

上記の「次に着手すべき作業」5 項目のうち、以下の対応を完了しました。

| 作業 | 結果 |
| --- | --- |
| 本番 env・migration | migration 0010 を本番適用・バックアップ取得・`BOOTSTRAP_ADMIN_EMAIL` / `AI_RATE_LIMIT_PER_HOUR` / `ADMIN_EMAIL` を設定。`REGISTRATION_MODE=domain` への切替は会社メールドメイン確認待ち |
| PR マージ・デプロイ | PR #25（v0.10.0）→ #26（バージョン）→ #27（Cookie 認証）→ #28（v0.11.0）を順にマージし、ローカル systemd へ v0.11.0 をデプロイ |
| Cookie 認証 | HttpOnly Cookie + CSRF ダブルサブミットを実装・テスト（API 107 / Web 16）・デプロイ・実機確認（403/401 動作） |
| 復元試験・通知 | 四半期復元ドリル手順を登録（docs/operations/restore-drill.md）。RESEND_API_KEY 設定済み・ADMIN_EMAIL 設定・EMAIL_FROM は Resend ドメイン検証待ち |
| 要件定義 | 特許コネクタ（J-PlatPat/PATENTSCOPE）とデータ品質ダッシュボードの要件書を追加 |

残課題: Cloudflare への v0.10/v0.11 再デプロイ（トークン承認待ち）、`REGISTRATION_MODE=domain` 切替（会社ドメイン確認待ち）、`EMAIL_FROM` の Resend 送信元検証、ブラウザ実操作での Cookie 認証最終確認。
