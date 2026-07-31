import { useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router";
import type { Comparison, ProjectDocument, Report, ResearchProject, SourceDocument } from "@icrps/contracts";
import { api } from "../api";

type Item = ProjectDocument & { document: SourceDocument | null };

export function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [documents, setDocuments] = useState<Item[]>([]);
  const [comparisons, setComparisons] = useState<Comparison[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    if (!projectId) return;
    api.projects
      .get(projectId)
      .then((res) => {
        setProject(res.project);
        setTitle(res.project.title);
        setDescription(res.project.description ?? "");
        setTags(res.project.tags.join(", "));
        setComparisons(res.comparisons);
        setReports(res.reports);
        return api.projects.documents.list(projectId);
      })
      .then((res) => setDocuments(res.projectDocuments))
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"));
  };

  useEffect(load, [projectId]);

  const update = async (e: FormEvent) => {
    e.preventDefault();
    if (!projectId || !project) return;
    try {
      const res = await api.projects.update(projectId, {
        title,
        description,
        tags: tags.split(/[,、\s]+/).filter(Boolean)
      });
      setProject(res.project);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  const updateItem = async (item: Item, input: Partial<{ tags: string[]; importance: number; userNote: string; status: string }>) => {
    if (!projectId) return;
    try {
      const res = await api.projects.documents.update(projectId, item.id, input);
      setDocuments((prev) => prev.map((d) => (d.id === item.id ? { ...d, ...res.projectDocument } : d)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  const removeItem = async (item: Item) => {
    if (!projectId) return;
    if (!window.confirm("この文書をプロジェクトから外しますか？")) return;
    try {
      await api.projects.documents.remove(projectId, item.id);
      setDocuments((prev) => prev.filter((d) => d.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  if (!project) return <div className="page-loading">読み込み中…</div>;

  return (
    <div>
      <div className="page-head">
        <h1>{project.title}</h1>
        <span className="badge">{project.status}</span>
      </div>
      {error && <p className="alert alert-danger">{error}</p>}
      <form className="card" onSubmit={update}>
        <h2>調査テーマ</h2>
        <label>
          タイトル
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          目的・メモ
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <label>
          タグ（カンマ区切り）
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        <button type="submit" className="button button-primary">保存</button>
      </form>

      <div className="two-col">
        <section className="card">
          <h2>保存文献（{documents.length}）</h2>
          {documents.length === 0 && <p className="muted">まだ保存文献がありません。<Link to="/search">検索</Link>から保存できます。</p>}
          <ul className="list">
            {documents.map((item) => (
              <li key={item.id} className="doc-item">
                <div>
                  <Link to={`/documents/${item.sourceDocumentId}`}>{item.document?.title ?? "文書"}</Link>
                  <span className="badge">{item.status}</span>
                  {item.importance && <span className="badge">重要度 {item.importance}</span>}
                </div>
                {item.userNote && <p className="muted">{item.userNote}</p>}
                <div className="result-actions">
                  <button type="button" className="button button-small" onClick={() => updateItem(item, { status: item.status === "reviewed" ? "saved" : "reviewed" })}>
                    {item.status === "reviewed" ? "未確認に戻す" : "確認済みにする"}
                  </button>
                  <button type="button" className="button button-small button-danger-ghost" onClick={() => removeItem(item)}>外す</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <div>
          <section className="card">
            <h2>比較表</h2>
            <Link to="comparison" state={{ documentIds: documents.map((d) => d.sourceDocumentId) }} className="button button-secondary">
              比較表を作成
            </Link>
            <ul className="list">
              {comparisons.map((c) => (
                <li key={c.id}><Link to={`/comparisons/${c.id}`}>{c.title}</Link></li>
              ))}
            </ul>
          </section>
          <section className="card">
            <h2>レポート</h2>
            <Link to="reports/new" className="button button-secondary">レポートを生成</Link>
            <ul className="list">
              {reports.map((r) => (
                <li key={r.id}><Link to={`/reports/${r.id}`}>{r.title}</Link></li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
