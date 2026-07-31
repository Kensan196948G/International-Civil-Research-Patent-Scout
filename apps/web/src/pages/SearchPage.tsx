import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import type { ResearchProject, SearchResultItem, SearchQuery, SourceType } from "@icrps/contracts";
import { SOURCE_TYPE_LABELS } from "@icrps/contracts";
import { api } from "../api";

const SOURCE_TYPES: SourceType[] = ["web", "paper", "patent", "pdf"];

export function SearchPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [query, setQuery] = useState("");
  const [languageMode, setLanguageMode] = useState("bilingual");
  const [sourceTypes, setSourceTypes] = useState<SourceType[]>(["web", "paper", "patent"]);
  const [countries, setCountries] = useState("");
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [projectId, setProjectId] = useState("");
  const [running, setRunning] = useState<SearchQuery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.projects.list().then((res) => setProjects(res.projects)).catch(() => setProjects([]));
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  const poll = (searchQueryId: string) => {
    if (pollTimer.current) clearInterval(pollTimer.current);
    pollTimer.current = setInterval(async () => {
      try {
        const res = await api.search.get(searchQueryId);
        setRunning(res);
        if (res.status === "completed" || res.status === "failed") {
          if (pollTimer.current) clearInterval(pollTimer.current);
        }
      } catch {
        if (pollTimer.current) clearInterval(pollTimer.current);
        setError("検索結果の取得に失敗しました");
      }
    }, 2000);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.search.start({
        query,
        languageMode,
        sourceTypes,
        countries: countries ? countries.split(/[,、\s]+/).filter(Boolean) : undefined,
        yearFrom: yearFrom ? Number(yearFrom) : undefined,
        yearTo: yearTo ? Number(yearTo) : undefined,
        includeSynonyms: true,
        includeTranslation: true,
        projectId: projectId || undefined,
        maxResults: 20
      });
      if (res.status === "completed") {
        poll(res.searchQueryId);
      } else {
        setRunning({ id: res.searchQueryId, status: "queued" } as SearchQuery);
        poll(res.searchQueryId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "検索に失敗しました");
    }
  };

  const toggleSource = (t: SourceType) => {
    setSourceTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  const toggleCompare = (documentId: string) => {
    setSelectedForCompare((prev) => (prev.includes(documentId) ? prev.filter((x) => x !== documentId) : [...prev, documentId]));
  };

  const saveResult = async (item: SearchResultItem) => {
    if (!projectId) {
      setError("保存先プロジェクトを選択してください");
      return;
    }
    try {
      await api.projects.documents.save(projectId, { documentId: item.documentId });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
    }
  };

  const results = running?.results ?? [];

  return (
    <div>
      <div className="page-head">
        <h1>横断検索</h1>
      </div>
      <form className="card search-form" onSubmit={onSubmit}>
        <div className="form-row">
          <label className="grow">
            検索キーワード
            <input type="text" required value={query} onChange={(e) => setQuery(e.target.value)} placeholder="例: 低炭素コンクリート" />
          </label>
          <label>
            言語モード
            <select value={languageMode} onChange={(e) => setLanguageMode(e.target.value)}>
              <option value="ja">日本語</option>
              <option value="en">英語</option>
              <option value="auto">自動</option>
              <option value="bilingual">日英併記</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            対象情報種別
            <div className="checkbox-row">
              {SOURCE_TYPES.map((t) => (
                <label key={t} className="checkbox-label">
                  <input type="checkbox" checked={sourceTypes.includes(t)} onChange={() => toggleSource(t)} />
                  {SOURCE_TYPE_LABELS[t]}
                </label>
              ))}
            </div>
          </label>
        </div>
        <div className="form-row">
          <label>
            国（カンマ区切り、例: JP,US,EP）
            <input type="text" value={countries} onChange={(e) => setCountries(e.target.value)} />
          </label>
          <label>
            開始年
            <input type="number" min={1900} max={2100} value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} />
          </label>
          <label>
            終了年
            <input type="number" min={1900} max={2100} value={yearTo} onChange={(e) => setYearTo(e.target.value)} />
          </label>
          <label>
            保存先プロジェクト
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">選択なし</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="button button-primary" disabled={!!running && running.status === "running"}>
          検索を実行
        </button>
      </form>

      {error && <p className="alert alert-danger">{error}</p>}

      {running && (
        <div className="card">
          <h2>検索結果 {running.status === "running" ? "（取得中…）" : ""}</h2>
          {running.status === "running" && <p className="muted">外部情報源を横断検索しています（最大60秒程度）。</p>}
          {running.failureSources && running.failureSources.length > 0 && (
            <p className="alert alert-warning">一部情報源で取得失敗: {running.failureSources.join("、")}</p>
          )}
          {selectedForCompare.length >= 2 && (
            <p>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  const target = projectId || projects[0]?.id;
                  if (!target) {
                    setError("比較を作成するには保存先プロジェクトが必要です");
                    return;
                  }
                  navigate(`/projects/${target}/comparison`, { state: { documentIds: selectedForCompare } });
                }}
              >
                選択した{selectedForCompare.length}件で比較表を作成
              </button>
            </p>
          )}
          {results.length === 0 && running.status !== "running" && <p className="muted">結果がありません。</p>}
          <ul className="result-list">
            {results.map((item) => (
              <li className="card result-card" key={item.documentId}>
                <div className="result-head">
                  <span className={`badge badge-type badge-${item.sourceType}`}>{SOURCE_TYPE_LABELS[item.sourceType]}</span>
                  <span className="badge">関連度 {item.relevanceScore ?? "-"}</span>
                </div>
                <h3><Link to={`/documents/${item.documentId}`}>{item.title}</Link></h3>
                {item.originalTitle && <p className="muted original-title">{item.originalTitle}</p>}
                {item.summary && <p className="result-summary">{item.summary}</p>}
                <p className="muted">
                  {item.sourceName && <span>{item.sourceName} / </span>}
                  {item.publicationDate && <span>{item.publicationDate} / </span>}
                  {item.doi ? <span>DOI: {item.doi}</span> : item.patentNumber ? <span>公開番号: {item.patentNumber}</span> : null}
                  {item.url && <span> <a href={item.url} target="_blank" rel="noreferrer">出典</a></span>}
                </p>
                <div className="result-actions">
                  <button type="button" className="button button-small" onClick={() => saveResult(item)}>プロジェクトに保存</button>
                  <button type="button" className={`button button-small ${selectedForCompare.includes(item.documentId) ? "button-primary" : "button-ghost"}`} onClick={() => toggleCompare(item.documentId)}>
                    比較に追加
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
