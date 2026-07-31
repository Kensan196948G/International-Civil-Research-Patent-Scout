import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="card">
      <h1>404 — ページが見つかりません</h1>
      <p><Link to="/dashboard">ダッシュボードへ戻る</Link></p>
    </div>
  );
}
