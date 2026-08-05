import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { api, ApiError } from "../api";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("新しいパスワードは8文字以上にしてください");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (!token) {
      setError("リセットトークンがありません。メールのリンクから開いてください。");
      return;
    }
    setSubmitting(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "リセットに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>パスワードリセット</h1>
        <p className="auth-sub">新しいパスワードを設定してください</p>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {done ? (
          <>
            <p className="auth-info">パスワードを変更しました。</p>
            <Link className="auth-button" style={{ display: "block", textAlign: "center", textDecoration: "none" }} to="/login">ログイン画面へ</Link>
          </>
        ) : (
          <>
            <label>
              新しいパスワード
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            </label>
            <label>
              新しいパスワード（確認）
              <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
            </label>
            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? "変更中…" : "パスワードを変更"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
