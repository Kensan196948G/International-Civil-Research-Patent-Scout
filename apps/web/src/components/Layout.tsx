import { Link, NavLink, Outlet } from "react-router";
import { DISCLAIMER } from "@icrps/contracts";
import { useAuth } from "../auth";

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container header-inner">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark">ICRPS</span>
            <span>Civil Research &amp; Patent Scout</span>
          </Link>
          <nav className="nav" aria-label="メインナビゲーション">
            <NavLink to="/dashboard">ダッシュボード</NavLink>
            <NavLink to="/search">横断検索</NavLink>
            {user?.role === "admin" && <NavLink to="/admin">管理</NavLink>}
          </nav>
          <div className="header-user">
            {user ? (
              <>
                <span className="user-name">{user.name}</span>
                <button type="button" className="button button-ghost" onClick={logout}>
                  ログアウト
                </button>
              </>
            ) : (
              <Link to="/login" className="button button-primary">
                ログイン
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
      <footer className="app-footer">
        <div className="container">
          <p className="disclaimer">{DISCLAIMER}</p>
          <p className="footer-note">International Civil Research &amp; Patent Scout v0.1.0</p>
        </div>
      </footer>
    </div>
  );
}
