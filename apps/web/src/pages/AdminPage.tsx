import { useEffect, useState } from "react";
import type { User } from "@icrps/contracts";
import { api } from "../api";

export function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; createdAt: string; detail: unknown }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin
      .users()
      .then((res) => setUsers(res.users))
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"));
    api.admin
      .auditLogs()
      .then((res) => setAuditLogs(res.auditLogs))
      .catch(() => setAuditLogs([]));
  }, []);

  const changeRole = async (user: User, role: string) => {
    try {
      const res = await api.admin.updateRole(user.id, role);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.user : u)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "更新に失敗しました");
    }
  };

  return (
    <div>
      <div className="page-head"><h1>管理画面</h1></div>
      {error && <p className="alert alert-danger">{error}</p>}
      <section className="card">
        <h2>ユーザー管理</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>名前</th><th>メール</th><th>ロール</th><th>作成日</th><th>変更</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.createdAt.slice(0, 10)}</td>
                  <td>
                    <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="viewer">viewer</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card">
        <h2>監査ログ（最新200件）</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>日時</th><th>操作</th></tr></thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log.id}>
                  <td>{log.createdAt}</td>
                  <td>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
