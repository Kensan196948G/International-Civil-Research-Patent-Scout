import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Report } from "@icrps/contracts";
import { getToken } from "../api";
import { MarkdownView } from "../components/MarkdownView";

export function ReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) return;
    apiGet(reportId)
      .then((res) => setReport(res.report))
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"));
  }, [reportId]);

  const exportMarkdown = async () => {
    if (!reportId) return;
    const token = getToken();
    const response = await fetch(`/api/reports/${reportId}/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    if (!response.ok) {
      setError("エクスポートに失敗しました");
      return;
    }
    const text = await response.text();
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${reportId}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!report) return <div className="page-loading">読み込み中…</div>;

  return (
    <div>
      <div className="page-head">
        <h1>{report.title}</h1>
        <button type="button" className="button button-secondary" onClick={exportMarkdown}>Markdownをダウンロード</button>
      </div>
      <p className="muted">
        <Link to={`/projects/${report.projectId}`}>プロジェクトへ</Link> / {report.reportType} / {report.createdAt}
      </p>
      <article className="card">
        <MarkdownView content={report.contentMarkdown} />
      </article>
    </div>
  );
}

async function apiGet(reportId: string): Promise<{ report: Report }> {
  const token = getToken();
  const response = await fetch(`/api/reports/${reportId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  if (!response.ok) throw new Error(`レポート取得失敗 (${response.status})`);
  return (await response.json()) as { report: Report };
}
