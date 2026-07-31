import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useParams } from "react-router";
import type { Comparison } from "@icrps/contracts";
import { api } from "../api";

const DEFAULT_AXES = [
  "技術概要",
  "適用条件",
  "主なメリット",
  "主なデメリット",
  "施工性",
  "コスト傾向",
  "環境負荷",
  "実績",
  "関連特許",
  "技術成熟度",
  "注意事項"
];

export function ComparisonPage() {
  const { projectId, comparisonId } = useParams<{ projectId: string; comparisonId: string }>();
  const location = useLocation();
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [title, setTitle] = useState("");
  const [axesText, setAxesText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(!!projectId && !comparisonId);

  useEffect(() => {
    if (comparisonId) {
      api.comparisons
        .get(comparisonId)
        .then((res) => {
          setComparison(res.comparison);
          setTitle(res.comparison.title);
          setAxesText(res.comparison.comparisonAxes.join(", "));
          setCreating(false);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"));
      return;
    }
    const documentIds = (location.state as { documentIds?: string[] } | null)?.documentIds ?? [];
    if (projectId && documentIds.length >= 2) {
      api.comparisons
        .create(projectId, { documentIds, axes: DEFAULT_AXES })
        .then((res) => {
          setComparison(res.comparison);
          setTitle(res.comparison.title);
          setAxesText(res.comparison.comparisonAxes.join(", "));
          setCreating(false);
        })
        .catch((err) => setError(err instanceof Error ? err.message : "比較表の作成に失敗しました"));
    } else {
      setCreating(false);
      setError("比較表の作成には2件以上の文書が必要です。検索結果から文書を選択してください。");
    }
  }, [comparisonId, projectId, location.state]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!comparison) return;
    try {
      const axes = axesText.split(/[,、\s]+/).filter(Boolean);
      const res = await api.comparisons.update(comparison.id, { title, axes });
      setComparison(res.comparison);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  if (creating) return <div className="page-loading">比較表を作成中…（AIキー未設定時は自動テンプレート）</div>;
  if (error && !comparison) return <p className="alert alert-danger">{error} <Link to="/search">検索へ</Link></p>;
  if (!comparison) return <p className="alert alert-warning">比較表が見つかりません。</p>;

  return (
    <div>
      <div className="page-head">
        <h1>比較表</h1>
      </div>
      <form className="card" onSubmit={save}>
        <label>
          タイトル
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          比較軸（カンマ区切り）
          <textarea value={axesText} onChange={(e) => setAxesText(e.target.value)} rows={2} />
        </label>
        <button type="submit" className="button button-primary">保存</button>
      </form>
      {error && <p className="alert alert-danger">{error}</p>}
      <section className="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>比較項目</th>
              {comparison.rows.map((row, i) => <th key={i}>{row.technologyName}</th>)}
            </tr>
          </thead>
          <tbody>
            {comparison.comparisonAxes.map((axis, i) => (
              <tr key={i}>
                <th>{axis}</th>
                {comparison.rows.map((row, j) => <td key={j}>{row.values[axis] ?? "—"}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {comparison.notes.length > 0 && (
        <p className="alert alert-warning">{comparison.notes.join(" / ")}</p>
      )}
    </div>
  );
}
