import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { AiSummary, SourceDocument } from "@icrps/contracts";
import { api } from "../api";

const SUMMARY_TYPES = [
  { value: "short", label: "簡易要約" },
  { value: "detailed", label: "詳細要約" },
  { value: "technical", label: "技術要約" },
  { value: "patent", label: "特許要約" }
];

export function DocumentPage() {
  const { documentId } = useParams<{ documentId: string }>();
  const [document, setDocument] = useState<SourceDocument | null>(null);
  const [summaries, setSummaries] = useState<AiSummary[]>([]);
  const [summaryType, setSummaryType] = useState("technical");
  const [language, setLanguage] = useState("ja");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!documentId) return;
    setLoading(true);
    api.documents
      .get(documentId)
      .then((res) => {
        setDocument(res.document);
        setSummaries(res.summaries);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [documentId]);

  const summarize = async () => {
    if (!documentId) return;
    setError(null);
    try {
      const res = await api.documents.summarize(documentId, { summaryType, language });
      setSummaries((prev) => [res.summary, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "要約の生成に失敗しました");
    }
  };

  if (loading) return <div className="page-loading">読み込み中…</div>;
  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!document) return <p className="alert alert-warning">文書が見つかりません。<Link to="/search">検索へ</Link></p>;

  return (
    <div>
      <div className="page-head">
        <h1>{document.title}</h1>
        <Link to="/search" className="button button-ghost">検索へ戻る</Link>
      </div>
      <section className="card">
        <h2>メタデータ</h2>
        <dl className="meta-list">
          <dt>情報種別</dt><dd>{document.sourceType}</dd>
          <dt>出典</dt><dd>{document.url ? <a href={document.url} target="_blank" rel="noreferrer">{document.url}</a> : document.sourceName ?? "不明"}</dd>
          {document.doi && <><dt>DOI</dt><dd>{document.doi}</dd></>}
          {document.patentNumber && <><dt>特許/公開番号</dt><dd>{document.patentNumber}</dd></>}
          {document.publicationDate && <><dt>公開日</dt><dd>{document.publicationDate}</dd></>}
          {document.authors?.length ? <><dt>著者</dt><dd>{document.authors.join(", ")}</dd></> : null}
          {document.applicants?.length ? <><dt>出願人</dt><dd>{document.applicants.join(", ")}</dd></> : null}
        </dl>
        {document.abstract && (
          <>
            <h2>要旨</h2>
            <p>{document.abstract}</p>
          </>
        )}
      </section>

      <section className="card">
        <h2>AI要約の生成</h2>
        <div className="form-row">
          <label>
            要約種別
            <select value={summaryType} onChange={(e) => setSummaryType(e.target.value)}>
              {SUMMARY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label>
            言語
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="ja">日本語</option>
              <option value="en">英語</option>
            </select>
          </label>
          <button type="button" className="button button-primary" onClick={summarize}>要約を生成</button>
        </div>
        {summaries.length === 0 && <p className="muted">要約はまだ生成されていません。AIキー未設定時はメタデータベースの要約になります。</p>}
      </section>

      {summaries.map((summary) => (
        <section className="card" key={summary.id}>
          <h2>{SUMMARY_TYPES.find((t) => t.value === summary.summaryType)?.label}（{summary.language}）</h2>
          <p className="muted">モデル: {summary.modelName} / プロンプト版: {summary.promptVersion}</p>
          <p>{summary.summaryText}</p>
          {summary.keyPoints?.length ? (
            <>
              <h3>重要ポイント</h3>
              <ul>{summary.keyPoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </>
          ) : null}
          {summary.merits?.length ? (
            <>
              <h3>メリット</h3>
              <ul>{summary.merits.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </>
          ) : null}
          {summary.demerits?.length ? (
            <>
              <h3>デメリット</h3>
              <ul>{summary.demerits.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </>
          ) : null}
          {summary.applicationConditions?.length ? (
            <>
              <h3>適用条件</h3>
              <ul>{summary.applicationConditions.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </>
          ) : null}
          {summary.risks?.length ? (
            <>
              <h3>注意点</h3>
              <ul>{summary.risks.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </>
          ) : null}
          {summary.citations?.length ? (
            <>
              <h3>引用・根拠</h3>
              <ul>
                {summary.citations.map((c, i) => (
                  <li key={i}>{c.claim} — <a href={c.sourceUrl} target="_blank" rel="noreferrer">出典</a></li>
                ))}
              </ul>
            </>
          ) : null}
        </section>
      ))}
    </div>
  );
}
