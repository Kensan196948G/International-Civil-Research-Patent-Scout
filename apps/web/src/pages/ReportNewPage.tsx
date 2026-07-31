import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import type { Comparison, ProjectDocument, SourceDocument } from "@icrps/contracts";
import { REPORT_TYPES } from "@icrps/contracts";
import { api } from "../api";

export function ReportNewPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState("summary");
  const [documents, setDocuments] = useState<Array<ProjectDocument & { document: SourceDocument | null }>>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparisonId, setComparisonId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    api.projects
      .get(projectId)
      .then((res) => {
        setComparisons(res.comparisons);
        return api.projects.documents.list(projectId);
      })
      .then((res) => {
        setDocuments(res.projectDocuments);
        setSelected(res.projectDocuments.map((d) => d.sourceDocumentId));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"));
  }, [projectId]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.reports.create(projectId, {
        title,
        reportType,
        documentIds: selected,
        comparisonId: comparisonId || undefined
      });
      navigate(`/reports/${res.report.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "レポートの生成に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <h1>レポート生成</h1>
      </div>
      <form className="card" onSubmit={onSubmit}>
        {error && <p className="alert alert-danger">{error}</p>}
        <label>
          レポートタイトル
          <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="例: 低炭素コンクリート技術調査レポート" />
        </label>
        <label>
          テンプレート
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            {Object.entries(REPORT_TYPES).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        {comparisons.length > 0 && (
          <label>
            比較表を組み込む（任意）
            <select value={comparisonId} onChange={(e) => setComparisonId(e.target.value)}>
              <option value="">使用しない</option>
              {comparisons.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </label>
        )}
        <fieldset>
          <legend>対象文献（{selected.length}件選択中）</legend>
          {documents.length === 0 && <p className="muted">保存文献がありません。</p>}
          {documents.map((item) => (
            <label key={item.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={selected.includes(item.sourceDocumentId)}
                onChange={(e) =>
                  setSelected((prev) =>
                    e.target.checked
                      ? [...prev, item.sourceDocumentId]
                      : prev.filter((id) => id !== item.sourceDocumentId)
                  )
                }
              />
              {item.document?.title ?? item.sourceDocumentId}
            </label>
          ))}
        </fieldset>
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? "生成中…" : "レポートを生成"}
        </button>
      </form>
    </div>
  );
}
