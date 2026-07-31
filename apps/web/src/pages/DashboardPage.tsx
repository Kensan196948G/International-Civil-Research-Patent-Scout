import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { DashboardStats } from "@icrps/contracts";
import { api } from "../api";

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.dashboard
      .stats()
      .then((res) => setStats(res.stats))
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"));
  }, []);

  if (error) return <p className="alert alert-danger">{error}</p>;
  if (!stats) return <div className="page-loading">読み込み中…</div>;

  const cards = [
    { label: "調査プロジェクト", value: stats.projectCount, to: "/projects" },
    { label: "保存文献", value: stats.savedDocumentCount, to: "/search" },
    { label: "生成レポート", value: stats.reportCount, to: "#" },
    { label: "実行した検索", value: stats.searchCount, to: "/search" }
  ];

  return (
    <div>
      <div className="page-head">
        <h1>ダッシュボード</h1>
        <Link to="/search" className="button button-primary">新しい調査を開始</Link>
      </div>
      <div className="stat-grid">
        {cards.map((card) => (
          <div className="card stat-card" key={card.label}>
            <div className="stat-value">{card.value}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>
      <div className="two-col">
        <section className="card">
          <h2>最近の調査プロジェクト</h2>
          {stats.recentProjects.length === 0 ? (
            <p className="muted">まだプロジェクトがありません。<Link to="/search">検索</Link>から開始できます。</p>
          ) : (
            <ul className="list">
              {stats.recentProjects.map((p) => (
                <li key={p.id}>
                  <Link to={`/projects/${p.id}`}>{p.title}</Link>
                  <span className="badge">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="card">
          <h2>最近のレポート</h2>
          {stats.recentReports.length === 0 ? (
            <p className="muted">まだレポートがありません。</p>
          ) : (
            <ul className="list">
              {stats.recentReports.map((r) => (
                <li key={r.id}>
                  <Link to={`/reports/${r.id}`}>{r.title}</Link>
                  <span className="badge">{r.reportType}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
