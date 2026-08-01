import { Link } from "react-router";

export function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>404 — ページが見つかりません</h1>
        <p className="muted">
          <Link to="/dashboard">ダッシュボードへ戻る</Link>
        </p>
      </div>
    </div>
  );
}
