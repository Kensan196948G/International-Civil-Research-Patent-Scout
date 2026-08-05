import { useState, type FormEvent } from "react";
import { useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../auth";
import { api, ApiError, setToken } from "../api";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const magic = searchParams.get("magic");
  const [mode, setMode] = useState<"password" | "magic" | "forgot">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    if (!magic) return;
    setSubmitting(true);
    void api
      .magicLinkVerify(magic)
      .then((res) => {
        setToken(res.accessToken);
        window.location.assign("/dashboard");
      })
      .catch(() => {
        setError("ログインリンクが無効または期限切れです");
        setSubmitting(false);
      });
  }, [magic]);

  useEffect(() => {
    void api
      .ssoStatus()
      .then((res) => setGoogleEnabled(res.google))
      .catch(() => undefined);
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);
    try {
      if (mode === "password") {
        await login(email, password);
        navigate("/dashboard", { replace: true });
      } else if (mode === "magic") {
        await api.magicLink(email);
        setInfo("ログインリンクをメールで送信しました（15分有効・一度だけ使用できます）");
      } else {
        await api.forgotPassword(email);
        setInfo("パスワードリセットの案内を送信しました（該当ユーザーがいる場合のみ）");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "ログインに失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const googleLogin = async () => {
    setError(null);
    try {
      const res = await api.ssoGoogleUrl();
      window.location.assign(res.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Google ログインを開始できませんでした");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={onSubmit}>
        <h1>ICRPS にログイン</h1>
        <p className="auth-sub">国際土木技術・論文・特許リサーチ支援</p>
        <div className="auth-tabs">
          <button type="button" className={mode === "password" ? "auth-tab active" : "auth-tab"} onClick={() => setMode("password")}>パスワード</button>
          <button type="button" className={mode === "magic" ? "auth-tab active" : "auth-tab"} onClick={() => setMode("magic")}>マジックリンク</button>
          {mode === "forgot" && <button type="button" className="auth-tab active" onClick={() => setMode("forgot")}>リセット</button>}
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        {info && <p className="auth-info" role="status">{info}</p>}
        <label>
          メールアドレス
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
        {mode === "password" && (
          <label>
            パスワード
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </label>
        )}
        <button type="submit" className="auth-button" disabled={submitting}>
          {submitting ? "処理中…" : mode === "password" ? "ログイン" : mode === "magic" ? "ログインリンクを送信" : "リセット案内を送信"}
        </button>
        {mode === "password" && (
          <button type="button" className="auth-link-button" onClick={() => { setMode("forgot"); setError(null); setInfo(null); }}>
            パスワードを忘れた場合
          </button>
        )}
        {googleEnabled && (
          <button type="button" className="auth-button google" onClick={googleLogin}>Google でログイン</button>
        )}
        <p className="muted">
          アカウントをお持ちでない場合は <Link to="/register">新規登録</Link>
        </p>
      </form>
    </div>
  );
}
