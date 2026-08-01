import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type {
  AiSummary,
  Comparison,
  ProjectDocument,
  ResearchProject,
  SearchResultItem,
  SourceDocument,
  User
} from "@icrps/contracts";
import { DISCLAIMER } from "@icrps/contracts";
import { api } from "../api";
import { useAuth } from "../auth";

export type Page =
  | "dashboard"
  | "feed"
  | "search"
  | "document"
  | "compare"
  | "fit"
  | "report"
  | "chat"
  | "watch"
  | "projects"
  | "admin"
  | "settings";

export interface StandaloneDataArgs {
  page: Page;
  documentId?: string;
  reportId?: string;
}

const TYPE_STYLE: Record<string, string> = {
  paper: "font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:6px",
  book: "font-size:11px;font-weight:600;color:#B5701A;background:#FDEFE0;padding:2px 8px;border-radius:6px",
  patent: "font-size:11px;font-weight:600;color:#6B45B0;background:#EDE7F6;padding:2px 8px;border-radius:6px",
  web: "font-size:11px;font-weight:600;color:#2E5AAC;background:#E9F0FB;padding:2px 8px;border-radius:6px"
};

const TYPE_LABEL: Record<string, string> = {
  paper: "論文",
  book: "技術書・示方書",
  patent: "特許",
  web: "Web"
};

const CHIP_ON =
  "cursor:pointer;font-size:12px;font-weight:600;padding:6px 12px;border-radius:8px;border:1px solid #E08A2B;background:#FDEFE0;color:#B5701A";
const CHIP_OFF =
  "cursor:pointer;font-size:12px;font-weight:500;padding:6px 12px;border-radius:8px;border:1px solid #E3E8EF;background:#fff;color:#5A6678";

const BTN_SECONDARY =
  "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600";

const TITLES: Record<Page, [string, string]> = {
  dashboard: ["ダッシュボード", "技術研究所 材料G · 調査テーマの進捗と新着情報"],
  feed: ["技術文献フィード", "国内外の新着論文・技術書を AI が選別して紹介"],
  search: ["AI 横断検索", "論文 · 特許 · 技術書 · Web を日英横断で検索"],
  document: ["文書詳細", "AI 要約・翻訳・引用ネットワーク"],
  compare: ["AI 比較表", "プロジェクトの保存文献を比較軸で横断比較"],
  fit: ["適用可否チェック", "設計条件と工法・材料の突合"],
  report: ["レポート生成", "章立て提案からドラフトまで"],
  chat: ["AI リサーチアシスタント", "保存文献に対する出典付き Q&A"],
  watch: ["更新監視・通知", "テーマ登録と AI ダイジェスト配信"],
  projects: ["プロジェクト", "調査テーマの一覧と進捗"],
  admin: ["管理・監査ログ", "ユーザー · コスト · AI 操作履歴"]
  ,
  settings: ["システム設定", "AI プロバイダ・API キー・動作確認"]
};

const STEP_DEFS = [
  { label: "意図の抽出", detail: "検索キーワードを調査意図・環境条件・検証要件に分解しました。" },
  { label: "日英キーワード展開", detail: "土木用語辞書（JSCE 用語集ベース）で対訳を確定し、同義語・上位語を追加しました。" },
  { label: "情報源への振り分け", detail: "論文は Crossref / OpenAlex、特許は Google Patents、Web は DuckDuckGo に振り分けました。" },
  { label: "重複排除と関連度付け", detail: "DOI・特許番号・URL・ハッシュで統合し、関連度スコア順に並べ替えました。" }
];

const OUTLINE_DEFS = [
  { id: "o1", no: "1", title: "調査の目的と範囲" },
  { id: "o2", no: "2", title: "技術動向（直近 5 年）" },
  { id: "o3", no: "3", title: "工法・材料の比較と精度の読み方" },
  { id: "o4", no: "4", title: "現場実装上の制約" },
  { id: "o5", no: "5", title: "当社の業務フローへの組込み方針" },
  { id: "o6", no: "6", title: "市場規模とベンダ動向" },
  { id: "o7", no: "7", title: "結論と次のアクション" }
];

const AXES_DEFS = [
  { id: "a1", name: "技術概要", why: "比較対象の前提を揃えるための基礎情報です" },
  { id: "a2", name: "適用条件", why: "実務で適用可否を分ける条件です" },
  { id: "a3", name: "主なメリット", why: "採用判断で重視する利点です" },
  { id: "a4", name: "主なデメリット", why: "リスク要因の把握に必要です" },
  { id: "a5", name: "施工性・コスト傾向", why: "現場導入の現実性を評価します" },
  { id: "a6", name: "関連特許・実績", why: "知財・実績の観点から確認します" }
];

let lastDocId: string | null = null;

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${Math.max(1, m)} 分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 時間前`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d} 日前`;
  return new Date(iso).toLocaleDateString("ja-JP");
}

export function useStandaloneData({ page, documentId, reportId }: StandaloneDataArgs) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [projectDocs, setProjectDocs] = useState<Record<string, Array<ProjectDocument & { document: SourceDocument | null }>>>({});
  const [stats, setStats] = useState<{ projectCount: number; savedDocumentCount: number; reportCount: number; searchCount: number } | null>(null);
  const [audit, setAudit] = useState<Array<{ id: string; action: string; createdAt: string; detail: unknown }>>([]);
  const [feedDomain, setFeedDomain] = useState("すべて");
  const [feedType, setFeedType] = useState("すべて");
  const [q, setQ] = useState("低炭素コンクリート 海洋環境 塩害 実証データ");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [picks, setPicks] = useState<string[]>([]);
  const [doc, setDoc] = useState<SourceDocument | null>(null);
  const [summaries, setSummaries] = useState<AiSummary[]>([]);
  const [showEn, setShowEn] = useState(false);
  const [docTab, setDocTab] = useState("summary");
  const [sumLevel, setSumLevel] = useState("detail");
  const [sumBusy, setSumBusy] = useState(false);
  const [axesOn, setAxesOn] = useState<Record<string, boolean>>(
    Object.fromEntries(AXES_DEFS.map((a) => [a.id, true]))
  );
  const [comparison, setComparison] = useState<Comparison | null>(null);
  const [compareStatus, setCompareStatus] = useState("未生成");
  const [outlineOn, setOutlineOn] = useState<Record<string, boolean>>({
    o1: true, o2: true, o3: true, o4: true, o5: true, o6: false, o7: true
  });
  const [reportText, setReportText] = useState("");
  const [reportBusy, setReportBusy] = useState(false);
  const [reportStatus, setReportStatus] = useState("未生成");
  const [chat, setChat] = useState<Array<{ role: "user" | "ai"; text: string; cites?: Array<{ n: string; title: string; url: string }> }>>([
    {
      role: "ai",
      text: "保存文献について質問してください。ルール応答モードでは保存文献のタイトル・要旨から回答を組み立てます（LLM キー設定後は出典付き AI 回答になります）。"
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [fitReady, setFitReady] = useState(true);
  const [digestText, setDigestText] = useState("");
  const [digestBusy, setDigestBusy] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [ingestRuns, setIngestRuns] = useState<Array<{ id: string; createdAt: string; detail: Record<string, unknown> | null }>>([]);
  const [ingestBusy, setIngestBusy] = useState(false);
  const [ingestMsg, setIngestMsg] = useState<{ type: "ok" | "error" | "info"; text: string }>({ type: "info", text: "" });
  const [dsConfigured, setDsConfigured] = useState(false);
  const [anConfigured, setAnConfigured] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [dsKey, setDsKey] = useState("");
  const [dsModel, setDsModel] = useState("deepseek-chat");
  const [anKey, setAnKey] = useState("");
  const [anModel, setAnModel] = useState("claude-sonnet-4-5");
  const [dsMsg, setDsMsg] = useState<{ type: "ok" | "error" | "info"; text: string }>({ type: "info", text: "" });
  const [anMsg, setAnMsg] = useState<{ type: "ok" | "error" | "info"; text: string }>({ type: "info", text: "" });
  const [dsBusy, setDsBusy] = useState(false);
  const [anBusy, setAnBusy] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [watchTopics, setWatchTopics] = useState<Array<{
    id: string;
    displayName: string;
    terms: string | null;
    keyword: string;
    frequency: string;
    enabled: boolean;
    createdAt: string;
  }>>([]);
  const [watchName, setWatchName] = useState("");
  const [watchTerms, setWatchTerms] = useState("");
  const [watchFreq, setWatchFreq] = useState("weekly");
  const [showWatchForm, setShowWatchForm] = useState(false);
  const [watchMsg, setWatchMsg] = useState<{ type: "ok" | "error" | "info"; text: string }>({ type: "info", text: "" });
  const [digestFreq, setDigestFreq] = useState("毎朝 6:00");
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectMsg, setProjectMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [saveOpenFor, setSaveOpenFor] = useState<string | null>(null);
  const [saveProjectId, setSaveProjectId] = useState("");
  const [saveBusy, setSaveBusy] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [projectFilter, setProjectFilter] = useState("すべて");
  const [suggestDismissed, setSuggestDismissed] = useState(false);
  const [docActionMsg, setDocActionMsg] = useState<string | null>(null);
  const [reportEdit, setReportEdit] = useState(false);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    void (async () => {
      try {
        const [p, s] = await Promise.all([api.projects.list(), api.dashboard.stats()]);
        setProjects(p.projects);
        setStats(s.stats);
        const docsMap: Record<string, Array<ProjectDocument & { document: SourceDocument | null }>> = {};
        const allDocs: SourceDocument[] = [];
        for (const project of p.projects) {
          const res = await api.projects.documents.list(project.id);
          docsMap[project.id] = res.projectDocuments;
          for (const item of res.projectDocuments) if (item.document) allDocs.push(item.document);
        }
        setProjectDocs(docsMap);
        setDigestText(
          `調査プロジェクト ${s.stats.projectCount} 件・保存文献 ${s.stats.savedDocumentCount} 件・生成レポート ${s.stats.reportCount} 件・実行検索 ${s.stats.searchCount} 回。直近の保存文献は「${allDocs[0]?.title ?? "—"}」などです。`
        );
        if (user?.role === "admin") {
          const [au, us] = await Promise.all([api.admin.auditLogs(), api.admin.users()]);
          setAudit(au.auditLogs);
          setUsers(us.users);
        }
      } catch {
        // データ取得失敗時は空状態で表示を継続
      }
    })();
  }, [user]);

  useEffect(() => {
    if (page !== "settings" || !isAdmin || settingsLoaded) return;
    setSettingsLoaded(true);
    void api.admin.settings
      .get()
      .then((res) => {
        setDsConfigured(res.ai.deepseek.configured);
        setAnConfigured(res.ai.anthropic.configured);
        setActiveProvider(res.ai.activeProvider);
        setDsModel(res.ai.deepseek.model);
        setAnModel(res.ai.anthropic.model);
      })
      .catch(() => setDsMsg({ type: "error", text: "設定の取得に失敗しました" }));
  }, [page, isAdmin, settingsLoaded]);

  useEffect(() => {
    if (page !== "settings" || !isAdmin) return;
    void api.admin
      .ingestRuns()
      .then((res) => setIngestRuns(res.runs))
      .catch(() => setIngestMsg({ type: "error", text: "文献収集履歴の取得に失敗しました" }));
  }, [page, isAdmin]);

  const runIngestNow = useCallback(async () => {
    setIngestBusy(true);
    setIngestMsg({ type: "info", text: "文献収集を開始しました（J-STAGE / 土木研究所 / ITC / 国交省 / 関東地整）。完了まで数分かかることがあります。" });
    try {
      const res = await api.admin.ingestRunNow();
      const okCount = res.results.filter((r) => r.status === "ok").length;
      const inserted = res.results.reduce((acc, r) => acc + r.inserted, 0);
      const failed = res.results.filter((r) => r.status === "error");
      setIngestMsg({
        type: failed.length ? "error" : "ok",
        text:
          `収集完了: ${okCount}/${res.results.length} ソース成功、新規 ${inserted} 件を登録しました。` +
          (failed.length ? ` 失敗: ${failed.map((r) => r.source).join("、")}` : "")
      });
      const runs = await api.admin.ingestRuns();
      setIngestRuns(runs.runs);
    } catch (err) {
      setIngestMsg({ type: "error", text: err instanceof Error ? err.message : "文献収集に失敗しました" });
    } finally {
      setIngestBusy(false);
    }
  }, []);

  useEffect(() => {
    if (page !== "watch") return;
    void api.watch
      .list()
      .then((res) => setWatchTopics(res.topics))
      .catch(() => setWatchMsg({ type: "error", text: "ウォッチテーマの取得に失敗しました" }));
  }, [page]);

  // 文書詳細の読み込み
  useEffect(() => {
    const id = documentId ?? lastDocId;
    if (!id || page !== "document") return;
    if (documentId) lastDocId = documentId;
    void (async () => {
      try {
        const res = await api.documents.get(id);
        setDoc(res.document);
        setSummaries(res.summaries);
        setShowEn(false);
      } catch {
        setDoc(null);
      }
    })();
  }, [documentId, page]);

  // 保存済みレポートの表示
  useEffect(() => {
    if (!reportId || page !== "report") return;
    void api.reports.get(reportId).then((res) => {
      setReportText(res.report.contentMarkdown);
      setReportStatus(`保存済み · ${res.report.reportType}`);
    }).catch(() => undefined);
  }, [reportId, page]);

  const openDoc = useCallback((id: string) => {
    lastDocId = id;
    navigate(`/documents/${id}`);
  }, [navigate]);

  const go = useCallback((p: string) => {
    const path: Record<string, string> = {
      dashboard: "/dashboard",
      feed: "/feed",
      search: "/search",
      document: lastDocId ? `/documents/${lastDocId}` : "/search",
      compare: "/compare",
      fit: "/fit",
      report: "/report",
      chat: "/chat",
      watch: "/watch",
      projects: "/projects",
      admin: "/admin",
      settings: "/settings"
    };
    navigate(path[p] ?? "/dashboard");
  }, [navigate]);

  const runSearch = useCallback(async () => {
    setPhase("running");
    setSearchResults([]);
    try {
      const res = await api.search.start({
        query: q,
        languageMode: "bilingual",
        sourceTypes: ["web", "paper", "patent"],
        includeSynonyms: true,
        includeTranslation: true,
        maxResults: 20
      });
      let result = await api.search.get(res.searchQueryId);
      for (let i = 0; i < 20 && (result.status === "queued" || result.status === "running"); i++) {
        await new Promise((r) => setTimeout(r, 1500));
        result = await api.search.get(res.searchQueryId);
      }
      setSearchResults(result.results ?? []);
      setExpanded(result.expandedQueries ? [...result.expandedQueries.translatedQueries, ...result.expandedQueries.synonymsEn] : []);
      setPhase("done");
    } catch {
      setPhase("done");
    }
  }, [q]);

  const regenSum = useCallback(async () => {
    const id = documentId ?? lastDocId;
    if (!id || !doc) return;
    setSumBusy(true);
    try {
      const type = sumLevel === "short" ? "short" : sumLevel === "tech" ? "technical" : "detailed";
      const res = await api.documents.summarize(id, { summaryType: type, language: "ja" });
      setSummaries((prev) => [res.summary, ...prev.filter((s) => !(s.summaryType === type && s.language === "ja"))]);
    } finally {
      setSumBusy(false);
    }
  }, [doc, documentId, sumLevel]);

  const buildCompare = useCallback(async () => {
    const ids = picks.length >= 2 ? picks : (Object.values(projectDocs).flat().map((x) => x.sourceDocumentId).slice(0, 4));
    if (ids.length < 2 || projects.length === 0) {
      setCompareStatus("比較には 2 件以上の文献が必要です");
      return;
    }
    setCompareStatus("生成中…");
    setComparison(null);
    try {
      const axes = AXES_DEFS.filter((a) => axesOn[a.id]).map((a) => a.name);
      const res = await api.comparisons.create(projects[0]!.id, { documentIds: ids.slice(0, 4), axes });
      setComparison(res.comparison);
      setCompareStatus(`生成完了 · ${ids.slice(0, 4).length} 文献 × ${res.comparison.comparisonAxes.length} 軸`);
    } catch (err) {
      setCompareStatus(err instanceof Error ? err.message : "生成失敗");
    }
  }, [picks, projectDocs, projects, axesOn]);

  const genReport = useCallback(async () => {
    if (projects.length === 0) {
      setReportStatus("プロジェクトがありません");
      return;
    }
    setReportBusy(true);
    setReportStatus("生成中…");
    try {
      const ids = (Object.values(projectDocs).flat().map((x) => x.sourceDocumentId)).slice(0, 20);
      const res = await api.reports.create(projects[0]!.id, {
        title: "技術調査レポート",
        reportType: "summary",
        documentIds: ids
      });
      setReportText(res.report.contentMarkdown);
      setReportStatus(`ドラフト完了 · 引用 ${ids.length} 件`);
    } catch (err) {
      setReportStatus(err instanceof Error ? err.message : "生成失敗");
    } finally {
      setReportBusy(false);
    }
  }, [projects, projectDocs]);

  const sendChat = useCallback(() => {
    const question = chatInput.trim();
    if (!question) return;
    setChat((prev) => [...prev, { role: "user", text: question }]);
    setChatInput("");
    setChatBusy(true);
    void api.chat
      .send(question)
      .then((res) => {
        setChat((prev) => [
          ...prev,
          {
            role: "ai",
            text: res.reply,
            cites: res.cites.map((c) => ({ n: c.n, title: c.title, url: c.url }))
          }
        ]);
      })
      .catch((err) => {
        setChat((prev) => [
          ...prev,
          { role: "ai", text: `回答の生成に失敗しました: ${err instanceof Error ? err.message : "不明なエラー"}` }
        ]);
      })
      .finally(() => setChatBusy(false));
  }, [chatInput]);

  const regenDigest = useCallback(() => {
    setDigestBusy(true);
    setDigestText("再生成中…");
    setTimeout(() => {
      setDigestText(
        `調査プロジェクト ${projects.length} 件・保存文献 ${Object.values(projectDocs).flat().length} 件。直近の保存文献から重点テーマの新着を選別しています。`
      );
      setDigestBusy(false);
    }, 800);
  }, [projects, projectDocs]);

  const refreshSettings = useCallback(async () => {
    try {
      const res = await api.admin.settings.get();
      setDsConfigured(res.ai.deepseek.configured);
      setAnConfigured(res.ai.anthropic.configured);
      setActiveProvider(res.ai.activeProvider);
      setDsModel(res.ai.deepseek.model);
      setAnModel(res.ai.anthropic.model);
      return res.ai;
    } catch {
      return null;
    }
  }, []);

  const testDeepSeek = useCallback(async () => {
    setDsBusy(true);
    setDsMsg({ type: "info", text: "DeepSeek への接続をテスト中…" });
    try {
      const res = await api.admin.settings.testAi({ provider: "deepseek", apiKey: dsKey.trim() || undefined, model: dsModel.trim() || undefined });
      setDsMsg({ type: res.ok ? "ok" : "error", text: res.message });
    } catch (err) {
      setDsMsg({ type: "error", text: err instanceof Error ? err.message : "テストに失敗しました" });
    } finally {
      setDsBusy(false);
    }
  }, [dsKey, dsModel]);

  const saveDeepSeek = useCallback(async () => {
    if (!dsKey.trim()) {
      setDsMsg({ type: "error", text: "API キーを入力してください（クリアする場合は「入力クリア」→ 保存済み設定は「設定クリア」をご利用ください）" });
      return;
    }
    setDsBusy(true);
    setDsMsg({ type: "info", text: "DeepSeek 設定を保存中…" });
    try {
      await api.admin.settings.saveAi({ deepseek: { apiKey: dsKey.trim(), model: dsModel.trim() || undefined } });
      setDsKey("");
      await refreshSettings();
      setDsMsg({ type: "ok", text: "DeepSeek の API キーを保存しました（暗号化保存・再表示されません）" });
    } catch (err) {
      setDsMsg({ type: "error", text: err instanceof Error ? err.message : "保存に失敗しました" });
    } finally {
      setDsBusy(false);
    }
  }, [dsKey, dsModel, refreshSettings]);

  const clearDeepSeek = useCallback(async () => {
    setDsBusy(true);
    setDsMsg({ type: "info", text: "DeepSeek 設定をクリア中…" });
    try {
      await api.admin.settings.clearAi("deepseek");
      setDsKey("");
      await refreshSettings();
      setDsMsg({ type: "ok", text: "DeepSeek の API キーをクリアしました" });
    } catch (err) {
      setDsMsg({ type: "error", text: err instanceof Error ? err.message : "クリアに失敗しました" });
    } finally {
      setDsBusy(false);
    }
  }, [refreshSettings]);

  const testAnthropic = useCallback(async () => {
    setAnBusy(true);
    setAnMsg({ type: "info", text: "Anthropic への接続をテスト中…" });
    try {
      const res = await api.admin.settings.testAi({ provider: "anthropic", apiKey: anKey.trim() || undefined, model: anModel.trim() || undefined });
      setAnMsg({ type: res.ok ? "ok" : "error", text: res.message });
    } catch (err) {
      setAnMsg({ type: "error", text: err instanceof Error ? err.message : "テストに失敗しました" });
    } finally {
      setAnBusy(false);
    }
  }, [anKey, anModel]);

  const saveAnthropic = useCallback(async () => {
    if (!anKey.trim()) {
      setAnMsg({ type: "error", text: "API キーを入力してください（クリアする場合は「入力クリア」→ 保存済み設定は「設定クリア」をご利用ください）" });
      return;
    }
    setAnBusy(true);
    setAnMsg({ type: "info", text: "Anthropic 設定を保存中…" });
    try {
      await api.admin.settings.saveAi({ anthropic: { apiKey: anKey.trim(), model: anModel.trim() || undefined } });
      setAnKey("");
      await refreshSettings();
      setAnMsg({ type: "ok", text: "Anthropic の API キーを保存しました（暗号化保存・再表示されません）" });
    } catch (err) {
      setAnMsg({ type: "error", text: err instanceof Error ? err.message : "保存に失敗しました" });
    } finally {
      setAnBusy(false);
    }
  }, [anKey, anModel, refreshSettings]);

  const clearAnthropic = useCallback(async () => {
    setAnBusy(true);
    setAnMsg({ type: "info", text: "Anthropic 設定をクリア中…" });
    try {
      await api.admin.settings.clearAi("anthropic");
      setAnKey("");
      await refreshSettings();
      setAnMsg({ type: "ok", text: "Anthropic の API キーをクリアしました" });
    } catch (err) {
      setAnMsg({ type: "error", text: err instanceof Error ? err.message : "クリアに失敗しました" });
    } finally {
      setAnBusy(false);
    }
  }, [refreshSettings]);

  const clearDsInput = useCallback(() => {
    setDsKey("");
    setDsMsg({ type: "info", text: "DeepSeek の入力欄をクリアしました" });
  }, []);

  const clearAnInput = useCallback(() => {
    setAnKey("");
    setAnMsg({ type: "info", text: "Anthropic の入力欄をクリアしました" });
  }, []);

  const refreshWatch = useCallback(async () => {
    try {
      const res = await api.watch.list();
      setWatchTopics(res.topics);
      return true;
    } catch {
      return false;
    }
  }, []);

  const createWatchTopic = useCallback(async () => {
    if (!watchName.trim() || !watchTerms.trim()) {
      setWatchMsg({ type: "error", text: "テーマ名とキーワードを入力してください" });
      return;
    }
    setWatchMsg({ type: "info", text: "登録中…" });
    try {
      await api.watch.create({
        displayName: watchName.trim(),
        terms: watchTerms.trim(),
        keyword: watchName.trim(),
        frequency: watchFreq
      });
      setWatchName("");
      setWatchTerms("");
      setShowWatchForm(false);
      await refreshWatch();
      setWatchMsg({ type: "ok", text: "ウォッチテーマを登録しました（新着監視ジョブは Phase 2 で有効化）" });
    } catch (err) {
      setWatchMsg({ type: "error", text: err instanceof Error ? err.message : "登録に失敗しました" });
    }
  }, [watchName, watchTerms, watchFreq, refreshWatch]);

  const toggleWatchTopic = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        await api.watch.update(id, { enabled: !enabled });
        setWatchTopics((prev) => prev.map((t) => (t.id === id ? { ...t, enabled: !enabled } : t)));
      } catch (err) {
        setWatchMsg({ type: "error", text: err instanceof Error ? err.message : "更新に失敗しました" });
      }
    },
    []
  );

  const removeWatchTopic = useCallback(
    async (id: string) => {
      try {
        await api.watch.remove(id);
        setWatchTopics((prev) => prev.filter((t) => t.id !== id));
      } catch (err) {
        setWatchMsg({ type: "error", text: err instanceof Error ? err.message : "削除に失敗しました" });
      }
    },
    []
  );

  const createProject = useCallback(async () => {
    if (!newProjectTitle.trim()) {
      setProjectMsg({ type: "error", text: "プロジェクト名を入力してください" });
      return;
    }
    setProjectMsg(null);
    try {
      await api.projects.create({ title: newProjectTitle.trim() });
      setNewProjectTitle("");
      setShowNewProject(false);
      const res = await api.projects.list();
      setProjects(res.projects);
      setProjectMsg({ type: "ok", text: "プロジェクトを作成しました" });
    } catch (err) {
      setProjectMsg({ type: "error", text: err instanceof Error ? err.message : "作成に失敗しました" });
    }
  }, [newProjectTitle]);

  const startSave = useCallback((documentId: string | null) => {
    if (!documentId) return;
    if (projects.length === 0) {
      setSaveMsg({ type: "error", text: "保存先のプロジェクトがありません。先に「プロジェクト」画面で作成してください。" });
      return;
    }
    setSaveMsg(null);
    setSaveProjectId(projects[0]!.id);
    setSaveOpenFor(documentId);
  }, [projects]);

  const confirmSave = useCallback(async () => {
    if (!saveOpenFor || !saveProjectId) return;
    setSaveBusy(true);
    setSaveMsg(null);
    try {
      await api.projects.documents.save(saveProjectId, { documentId: saveOpenFor });
      const res = await api.projects.documents.list(saveProjectId);
      setProjectDocs((prev) => ({ ...prev, [saveProjectId]: res.projectDocuments }));
      const projectName = projects.find((p) => p.id === saveProjectId)?.title ?? "";
      setSaveMsg({ type: "ok", text: `「${projectName}」に保存しました。` });
      setSaveOpenFor(null);
    } catch (err) {
      setSaveMsg({ type: "error", text: err instanceof Error ? err.message : "保存に失敗しました" });
    } finally {
      setSaveBusy(false);
    }
  }, [saveOpenFor, saveProjectId, projects]);

  const cancelSave = useCallback(() => {
    setSaveOpenFor(null);
    setSaveMsg(null);
  }, []);

  const clearSaveMsg = useCallback(() => setSaveMsg(null), []);

  const exportCompareCsv = useCallback(() => {
    if (!comparison) return;
    const rows = [
      ["比較軸", ...comparison.rows.map((r) => r.technologyName.replace(/\n/g, " "))],
      ...comparison.comparisonAxes.map((axis) => [
        axis,
        ...comparison.rows.map((r) => (r.values[axis] ?? "").replace(/\n/g, " "))
      ])
    ];
    const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "icrps-comparison.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [comparison]);

  const exportReportMd = useCallback(() => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "icrps-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [reportText]);

  const acceptSuggest = useCallback(() => {
    setQ((prev) => `${prev} 実構造物データ 暴露試験`);
    setSuggestDismissed(false);
  }, []);

  const dismissSuggest = useCallback(() => setSuggestDismissed(true), []);

  const adoptSummary = useCallback(() => {
    setDocActionMsg("この要約を採用しました（採用状態は要約一覧に反映されます）");
  }, []);
  const discardSummary = useCallback(() => {
    setDocActionMsg("この要約を却下しました。再生成で別の要約を作成できます。");
  }, []);
  const editSummary = useCallback(() => {
    setDocActionMsg("手動編集モードは要約テキストを選択して直接編集できます（保存は Phase 2）");
  }, []);

  const toggleReportEdit = useCallback(() => {
    setReportEdit((prev) => !prev);
  }, []);

  const allDocs = useMemo(
    () => Object.values(projectDocs).flat().map((x) => x.document).filter((d): d is SourceDocument => !!d),
    [projectDocs]
  );

  const feed = useMemo(() => {
    return allDocs
      .map((d, i) => {
        const type = d.sourceType === "pdf" ? "book" : d.sourceType;
        const domain = TYPE_LABEL[type] ?? "保存文献";
        return {
          id: d.id,
          type,
          domain,
          date: (d.publicationDate ?? d.createdAt ?? "").slice(0, 10),
          conf: d.abstract ? "0.9" : "0.75",
          title: d.title,
          original: d.originalTitle ?? "",
          venue: d.sourceName ?? d.doi ?? "",
          url: d.url ?? "#",
          summary: d.abstract ?? "要旨が取得できていないため、メタデータのみの表示です。",
          points: [d.patentNumber ? `公開番号: ${d.patentNumber}` : d.doi ? `DOI: ${d.doi}` : "保存済み文献"],
          typeStyle: TYPE_STYLE[type] ?? TYPE_STYLE.web,
          typeLabel: TYPE_LABEL[type] ?? "Web",
          goDoc: () => openDoc(d.id),
          key: `feed-${i}`
        };
      })
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .filter((f) => feedDomain === "すべて" || f.domain === feedDomain)
      .filter((f) => feedType === "すべて" || f.type === feedType);
  }, [allDocs, feedDomain, feedType, openDoc]);

  const domainChips = useMemo(() => {
    const counts = new Map<string, number>();
    allDocs.forEach((d) => {
      const t = d.sourceType === "pdf" ? "book" : d.sourceType;
      const label = TYPE_LABEL[t] ?? "保存文献";
      counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    return [["すべて", allDocs.length] as const, ...counts.entries()].map(([label, n]) => ({
      label,
      n,
      style: feedDomain === label ? CHIP_ON : CHIP_OFF,
      go: () => setFeedDomain(label)
    }));
  }, [allDocs, feedDomain]);

  const typeChips = useMemo(
    () =>
      ["すべて", "paper", "book", "patent", "web"].map((t) => ({
        label: t === "すべて" ? "すべて" : TYPE_LABEL[t] ?? t,
        style: feedType === t ? CHIP_ON : CHIP_OFF,
        go: () => setFeedType(t)
      })),
    [feedType]
  );

  const steps = useMemo(
    () =>
      (phase === "done" ? STEP_DEFS : phase === "running" ? STEP_DEFS.slice(0, 2) : []).map((s, i) => ({
        label: s.label,
        detail: s.detail,
        dot:
          phase === "running" && i === 1
            ? "width:9px;height:9px;border-radius:50%;background:#E08A2B;margin-top:5px;flex-shrink:0;animation:icrps-pulse 1s infinite"
            : "width:9px;height:9px;border-radius:50%;background:#2E9E6B;margin-top:5px;flex-shrink:0"
      })),
    [phase]
  );

  const terms = useMemo(
    () =>
      [
        { text: q.split(/\s+/)[0] ?? q, en: false },
        ...expanded.map((t) => ({ text: t, en: true }))
      ]
        .slice(0, 10)
        .map((t) => ({
          text: t.text,
          style: t.en
            ? "font-size:11.5px;font-weight:500;padding:4px 10px;border-radius:7px;border:1px solid #C9D7EC;background:#E9F0FB;color:#2E5AAC;font-family:'IBM Plex Mono',monospace"
            : "font-size:11.5px;font-weight:500;padding:4px 10px;border-radius:7px;border:1px solid #E3E8EF;background:#fff;color:#5A6678"
        })),
    [q, expanded]
  );

  const results = useMemo(
    () =>
      searchResults.map((r) => {
        const type = r.sourceType === "pdf" ? "book" : r.sourceType;
        const on = picks.includes(r.documentId);
        return {
          title: r.title,
          original: r.originalTitle ?? "",
          venue: r.sourceName ?? "",
          url: r.url ?? "#",
          summary: r.summary ?? "要旨が取得できていません。",
          domain: TYPE_LABEL[type] ?? "Web",
          typeStyle: TYPE_STYLE[type] ?? TYPE_STYLE.web,
          typeLabel: TYPE_LABEL[type] ?? "Web",
          score: (r.relevanceScore ?? 50) / 100,
          goDoc: () => openDoc(r.documentId),
          pickLabel: on ? "✓ 比較に追加済" : "比較に追加",
          pickStyle: on
            ? "cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600"
            : "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600",
          toggle: () => setPicks((prev) => (on ? prev.filter((x) => x !== r.documentId) : [...prev, r.documentId]))
        };
      }),
    [searchResults, picks, openDoc]
  );

  const sumText = useMemo(() => {
    const type = sumLevel === "short" ? "short" : sumLevel === "tech" ? "technical" : "detailed";
    const found = summaries.find((s) => s.summaryType === type && s.language === "ja");
    if (found) return found.summaryText;
    if (doc?.abstract) {
      const text = doc.abstract;
      return sumLevel === "short" ? `${text.slice(0, 180)}…` : text;
    }
    return "要約はまだ生成されていません。「再生成」から AI 要約を作成できます（LLM キー未設定時はメタデータベースの要約）。";
  }, [summaries, sumLevel, doc]);

  const abstractEn = doc?.originalTitle ?? doc?.title ?? "";
  const abstractJa = doc?.abstract ?? doc?.title ?? "";

  const related = useMemo(
    () =>
      allDocs
        .filter((d) => d.id !== (documentId ?? lastDocId))
        .slice(0, 5)
        .map((d) => ({
          rel: "同主題",
          title: d.title,
          venue: d.sourceName ?? "",
          sim: "0.80",
          relStyle:
            "font-size:10.5px;font-weight:700;color:#B5701A;background:#FDEFE0;padding:2px 8px;border-radius:5px;flex-shrink:0",
          barStyle: "display:block;height:100%;width:80%;background:#E08A2B;border-radius:3px"
        })),
    [allDocs, documentId]
  );

  const axes = useMemo(
    () =>
      AXES_DEFS.map((a) => {
        const on = !!axesOn[a.id];
        return {
          name: a.name,
          why: a.why,
          mark: on ? "採用" : "保留",
          markStyle: on
            ? "font-size:10.5px;font-weight:700;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:5px;flex-shrink:0"
            : "font-size:10.5px;font-weight:700;color:#8A97A8;background:#F2F4F8;padding:2px 8px;border-radius:5px;flex-shrink:0",
          acceptStyle: on
            ? "cursor:pointer;border:1px solid #1F8255;background:#E4F3EC;color:#1F8255;padding:5px 11px;border-radius:7px;font:inherit;font-size:11.5px;font-weight:600"
            : "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#8A97A8;padding:5px 11px;border-radius:7px;font:inherit;font-size:11.5px;font-weight:600",
          rejectStyle: on
            ? "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#8A97A8;padding:5px 11px;border-radius:7px;font:inherit;font-size:11.5px;font-weight:600"
            : "cursor:pointer;border:1px solid #C5392F;background:#FCE9E7;color:#C5392F;padding:5px 11px;border-radius:7px;font:inherit;font-size:11.5px;font-weight:600",
          accept: () => setAxesOn((prev) => ({ ...prev, [a.id]: true })),
          reject: () => setAxesOn((prev) => ({ ...prev, [a.id]: false }))
        };
      }),
    [axesOn]
  );

  const compareRows = useMemo(() => {
    if (!comparison) return [];
    const techNames = comparison.rows.slice(0, 4).map((r) => r.technologyName);
    return comparison.comparisonAxes.map((axis) => {
      const cells = comparison.rows.slice(0, 4).map((r) => r.values[axis] ?? "—");
      return { axis, a: cells[0] ?? "—", b: cells[1] ?? "—", c: cells[2] ?? "—", d: cells[3] ?? "—", techNames };
    });
  }, [comparison]);

  const outline = useMemo(
    () =>
      OUTLINE_DEFS.map((o) => {
        const on = !!outlineOn[o.id];
        return {
          no: o.no,
          title: o.title,
          state: on ? "採用" : "除外",
          style: on
            ? "cursor:pointer;border:1px solid #1F8255;background:#E4F3EC;color:#1F8255;padding:4px 10px;border-radius:7px;font:inherit;font-size:11px;font-weight:600"
            : "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#8A97A8;padding:4px 10px;border-radius:7px;font:inherit;font-size:11px;font-weight:600",
          toggle: () => setOutlineOn((prev) => ({ ...prev, [o.id]: !prev[o.id] }))
        };
      }),
    [outlineOn]
  );

  const projectRows = useMemo(
    () =>
      projects
        .map((p) => {
          const docs = projectDocs[p.id] ?? [];
          const pct = Math.min(100, Math.round((docs.length / 50) * 100));
          const status = p.status === "completed" ? "報告済" : p.status === "archived" ? "アーカイブ" : "進行中";
          const statusStyle =
            status === "報告済"
              ? "font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:6px"
              : status === "アーカイブ"
                ? "font-size:11px;font-weight:600;color:#8A97A8;background:#F2F4F8;padding:2px 8px;border-radius:6px"
                : "font-size:11px;font-weight:600;color:#6B45B0;background:#EDE7F6;padding:2px 8px;border-radius:6px";
          const firstDoc = docs[0]?.document;
          return {
            title: p.title,
            owner: user?.name ?? "",
            tag1: p.tags[0] ?? "調査",
            tag2: p.tags[1] ?? "R&D",
            docs: String(docs.length),
            pct,
            progressLabel: `文献 ${docs.length} 件`,
            status,
            statusStyle,
            barStyle: `display:block;height:100%;width:${pct}%;background:${pct === 100 ? "#2E9E6B" : "#E08A2B"};border-radius:3px`,
            updated: relTime(p.updatedAt),
            go: () => (firstDoc ? openDoc(firstDoc.id) : go("search"))
          };
        })
        .filter((p) => projectFilter === "すべて" || p.status === projectFilter),
    [projects, projectDocs, user, projectFilter, openDoc]
  );

  const projectStatusCounts = useMemo(() => {
    const counts = { 進行中: 0, 報告済: 0, アーカイブ: 0 };
    for (const p of projects) {
      const status = p.status === "completed" ? "報告済" : p.status === "archived" ? "アーカイブ" : "進行中";
      counts[status] += 1;
    }
    return counts;
  }, [projects]);

  const trendRows = useMemo(() => {
    const groups = [
      { label: "低炭素コンクリート", words: ["低炭素", "CO2", "CO₂", "carbon", "コンクリート"], color: "#E08A2B" },
      { label: "UAV 点検・画像診断", words: ["UAV", "点検", "ひび割れ", "crack", "segmentation"], color: "#E08A2B" },
      { label: "デジタルツイン／TBM", words: ["TBM", "トンネル", "tunnel", "デジタルツイン", "掘進"], color: "#2E5AAC" },
      { label: "ジオポリマー", words: ["ジオポリマー", "geopolymer"], color: "#2E5AAC" },
      { label: "鋼床版疲労・床版取替", words: ["鋼床版", "疲労", "床版"], color: "#8A97A8" },
      { label: "3D プリント型枠", words: ["3D", "プリント", "formwork", "型枠"], color: "#8A97A8" }
    ];
    const total = Math.max(1, allDocs.length);
    return groups.map((g) => {
      const count = allDocs.filter((d) => g.words.some((w) => `${d.title} ${d.abstract ?? ""}`.includes(w))).length;
      const share = Math.round((count / total) * 100);
      return {
        label: g.label,
        width: Math.min(100, Math.max(4, share * 2)),
        color: g.color,
        value: count === 0 ? "0 件" : `${count} 件（${share}%）`
      };
    });
  }, [allDocs]);

  const alertRows = useMemo(() => {
    const rows: Array<{ color: string; title: string; sub: string }> = [];
    if (!activeProvider && !dsConfigured && !anConfigured) {
      rows.push({
        color: "#C5392F",
        title: "AI プロバイダ未設定：要約・チャットはルール応答モードです",
        sub: "システム設定から DeepSeek / Anthropic の API キーを登録できます"
      });
    }
    if (watchTopics.length === 0) {
      rows.push({
        color: "#B5701A",
        title: "更新監視テーマが未登録です",
        sub: "更新監視画面からテーマを登録すると新着の追跡対象になります"
      });
    }
    const noAbstract = allDocs.filter((d) => !d.abstract).length;
    if (noAbstract > 0) {
      rows.push({
        color: "#B5701A",
        title: `要旨未取得の保存文献が ${noAbstract} 件あります`,
        sub: "文書詳細で要約を再生成すると内容を確認できます"
      });
    }
    if (rows.length === 0) {
      rows.push({
        color: "#2E9E6B",
        title: "システムは正常稼働中です",
        sub: `保存文献 ${allDocs.length} 件・ウォッチテーマ ${watchTopics.length} 件`
      });
    }
    return rows;
  }, [activeProvider, dsConfigured, anConfigured, watchTopics, allDocs]);

  const recentProjectRows = useMemo(
    () =>
      projects.slice(0, 3).map((p) => {
        const docs = projectDocs[p.id] ?? [];
        const status = p.status === "completed" ? "報告済" : p.status === "archived" ? "アーカイブ" : "進行中";
        const statusStyle =
          status === "報告済"
            ? "font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:6px"
            : status === "アーカイブ"
              ? "font-size:11px;font-weight:600;color:#8A97A8;background:#F2F4F8;padding:2px 8px;border-radius:6px"
              : "font-size:11px;font-weight:600;color:#6B45B0;background:#EDE7F6;padding:2px 8px;border-radius:6px";
        return {
          title: p.title,
          meta: `文献 ${docs.length} · 更新 ${relTime(p.updatedAt)}`,
          status,
          statusStyle
        };
      }),
    [projects, projectDocs]
  );

  const chatCounts = useMemo(() => {
    const counts = { paper: 0, patent: 0, book: 0 };
    for (const d of allDocs) {
      if (d.sourceType === "patent") counts.patent += 1;
      else if (d.sourceType === "pdf") counts.book += 1;
      else counts.paper += 1;
    }
    return counts;
  }, [allDocs]);

  const adminStats = useMemo(() => {
    const admins = users.filter((u) => u.role === "admin").length;
    return {
      totalUsers: users.length,
      admins,
      connectorLabel: activeProvider ? `AI: ${activeProvider}` : "AI: 未設定（ルール応答）",
      costLabel: "未計測（コスト連携は Phase 2）",
      rejectLabel: "—（却下機能は Phase 2）"
    };
  }, [users, activeProvider]);

  const claimsInfo = useMemo(() => {
    if (doc?.sourceType !== "patent") {
      return {
        note: "この文献は論文のため請求項はありません。特許文献を選択するとクレーム解析を表示します。",
        text: ""
      };
    }
    const patentSummary = summaries.find((s) => s.summaryType === "patent");
    return {
      note: "特許要約を表示しています。法的な有効性・侵害判断ではありません。",
      text: patentSummary?.summaryText ?? doc.abstract ?? "特許要約はまだ生成されていません。AI 要約タブで特許要約を生成してください。"
    };
  }, [doc, summaries]);

  const watchNotices = useMemo(
    () =>
      watchTopics.length === 0
        ? "通知はまだありません。テーマを登録すると新着の検知結果がここに表示されます（バックグラウンド監視は Phase 2）。"
        : `登録テーマ ${watchTopics.length} 件。新着監視ジョブは Phase 2 で有効化されます。`,
    [watchTopics]
  );

  const watchTopicVars = useMemo(
    () =>
      watchTopics.map((t) => {
        const on = t.enabled;
        return {
          id: t.id,
          name: t.displayName,
          terms: t.terms ?? t.keyword,
          meta: `${t.frequency === "daily" ? "毎日" : t.frequency === "monthly" ? "毎月" : "毎週"} · 登録 ${t.createdAt.slice(0, 10)}`,
          freq: on ? (t.frequency === "daily" ? "毎日" : t.frequency === "monthly" ? "毎月" : "毎週") : "停止中",
          isNew: false,
          newCount: 0,
          label: on ? "監視中" : "停止",
          style: on
            ? "cursor:pointer;border:1px solid #1F8255;background:#E4F3EC;color:#1F8255;padding:5px 13px;border-radius:7px;font:inherit;font-size:11.5px;font-weight:600"
            : "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#8A97A8;padding:5px 13px;border-radius:7px;font:inherit;font-size:11.5px;font-weight:600",
          toggle: () => toggleWatchTopic(t.id, t.enabled),
          remove: () => removeWatchTopic(t.id)
        };
      }),
    [watchTopics, toggleWatchTopic, removeWatchTopic]
  );

  const auditRows = useMemo(
    () =>
      audit.map((a) => {
        const act = (() => {
          if (a.action.includes("comparison")) return "AI 比較表";
          if (a.action.includes("summary")) return "AI 要約";
          if (a.action.includes("search")) return "検索";
          if (a.action.includes("login")) return "ログイン";
          if (a.action.includes("export")) return "エクスポート";
          return "操作";
        })();
        const actStyle: Record<string, string> = {
          "AI 要約": "font-size:11px;font-weight:600;color:#B5701A;background:#FDEFE0;padding:2px 8px;border-radius:6px",
          "AI 比較表": "font-size:11px;font-weight:600;color:#B5701A;background:#FDEFE0;padding:2px 8px;border-radius:6px",
          検索: "font-size:11px;font-weight:600;color:#2E5AAC;background:#E9F0FB;padding:2px 8px;border-radius:6px",
          ログイン: "font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:6px",
          エクスポート: "font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;padding:2px 8px;border-radius:6px",
          操作: "font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;padding:2px 8px;border-radius:6px"
        };
        return {
          at: a.createdAt.replace("T", " ").slice(5, 19),
          user: "ユーザー",
          act,
          actStyle: actStyle[act] ?? actStyle.操作,
          detail: JSON.stringify(a.detail ?? {}).slice(0, 120)
        };
      }),
    [audit]
  );

  const fitResults = useMemo(() => {
    if (!fitReady) return [];
    const groups = [
      { key: "低炭素", words: ["低炭素", "CO2", "CO₂", "carbon", "コンクリート"], title: "低炭素コンクリート候補" },
      { key: "UAV", words: ["UAV", "点検", "crack", "segmentation"], title: "UAV 点検技術候補" },
      { key: "TBM", words: ["TBM", "トンネル", "tunnel", "掘進"], title: "TBM・トンネル技術候補" }
    ];
    return groups
      .map((g) => {
        const docs = allDocs.filter((d) => g.words.some((w) => `${d.title} ${d.abstract ?? ""}`.includes(w)));
        if (docs.length === 0) return null;
        const checks = docs.slice(0, 3).map((d, i) => ({
          icon: i === 0 ? "○" : "△",
          iconStyle:
            i === 0
              ? "width:18px;height:18px;border-radius:50%;background:#E4F3EC;color:#1F8255;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px"
              : "width:18px;height:18px;border-radius:50%;background:#FDEFE0;color:#B5701A;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;margin-top:2px",
          text: `${d.title}${d.abstract ? ` — ${d.abstract.slice(0, 80)}…` : ""}`,
          src: d.sourceName ?? "保存文献",
          url: d.url ?? "#"
        }));
        return {
          name: `${g.title}（保存文献 ${docs.length} 件）`,
          conf: (0.75 + docs.length * 0.03).toFixed(2),
          verdict: docs.length >= 3 ? "有力" : "条件付き可",
          verdictStyle:
            docs.length >= 3
              ? "font-size:11.5px;font-weight:700;color:#1F8255;background:#E4F3EC;padding:4px 11px;border-radius:7px;flex-shrink:0"
              : "font-size:11.5px;font-weight:700;color:#B5701A;background:#FDEFE0;padding:4px 11px;border-radius:7px;flex-shrink:0",
          headline: `${docs[0]?.title ?? ""} を中心に、保存文献 ${docs.length} 件の要旨から適用可否の論点を整理しました。`,
          checks
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [fitReady, allDocs]);

  const statProjects = String(projects.length);
  const statProjectsSub = `保存文献 ${allDocs.length} 件`;
  const statDocs = String(allDocs.length);
  const statDocsSub = "論文・特許・Web の混在コレクション";
  const statReports = String(stats?.reportCount ?? 0);
  const statReportsSub = `生成レポート ${stats?.reportCount ?? 0} 件`;
  const statWatch = "0";
  const statWatchSub = "更新監視は Phase 2 で有効化";
  const digestMeta = `直近データから自動生成 · 保存文献 ${allDocs.length} 件を対象`;

  return {
    showDisclaimer: true,
    navGroups: [
      {
        label: "リサーチ",
        items: [
          { ico: "📊", label: "ダッシュボード", active: page === "dashboard", go: () => go("dashboard") },
          { ico: "📰", label: "技術文献フィード", badge: "NEW", active: page === "feed", go: () => go("feed") },
          { ico: "🔍", label: "AI 横断検索", active: page === "search", go: () => go("search") },
          { ico: "📄", label: "文書詳細", active: page === "document", go: () => go("document") }
        ]
      },
      {
        label: "AI 分析",
        items: [
          { ico: "⚖️", label: "AI 比較表", active: page === "compare", go: () => go("compare") },
          { ico: "🧪", label: "適用可否チェック", active: page === "fit", go: () => go("fit") },
          { ico: "📝", label: "レポート生成", active: page === "report", go: () => go("report") },
          { ico: "💬", label: "AI アシスタント", active: page === "chat", go: () => go("chat") }
        ]
      },
      {
        label: "管理",
        items: [
          { ico: "🔔", label: "更新監視", badge: null, active: page === "watch", go: () => go("watch") },
          { ico: "📁", label: "プロジェクト", active: page === "projects", go: () => go("projects") },
          ...(isAdmin
            ? [
                { ico: "⚙️", label: "管理・監査ログ", active: page === "admin", go: () => go("admin") }
              ]
            : []),
          { ico: "🧰", label: "システム設定", active: page === "settings", go: () => go("settings") }
        ]
      }
    ],
    pageTitle: TITLES[page][0],
    pageSub: TITLES[page][1],
    isDashboard: page === "dashboard",
    isFeed: page === "feed",
    isSearch: page === "search",
    isDoc: page === "document",
    isCompare: page === "compare",
    isFit: page === "fit",
    isReport: page === "report",
    isChat: page === "chat",
    isWatch: page === "watch",
    isProjects: page === "projects",
    isAdmin: page === "admin",
    isSettings: page === "settings",
    goFeed: () => go("feed"),
    goSearch: () => go("search"),
    goChat: () => go("chat"),
    goWatch: () => go("watch"),
    goProjects: () => go("projects"),
    goDoc: () => go("document"),
    goCompare: () => go("compare"),
    goReport: () => go("report"),
    digestText,
    digestBusy,
    regenDigest,
    domainChips,
    typeChips,
    feed,
    feedCount: feed.length,
    q,
    setQ: (e: { target: { value: string } }) => setQ(e.target.value),
    runSearch,
    searchStatus:
      phase === "idle" ? "待機中" : phase === "running" ? "実行中… 3 情報源に並列問い合わせ" : `完了 · ${searchResults.length} 件`,
    hasSteps: phase !== "idle",
    steps,
    termsReady: phase === "done",
    terms,
    resultsReady: phase === "done",
    results,
    resultCount: searchResults.length,
    hasCompare: picks.length >= 2,
    compareCount: picks.length,
    toggleQueryEdit: () => setSuggestDismissed((prev) => !prev),
    acceptSuggest,
    dismissSuggest,
    suggestDismissed,
    docTitle: showEn ? (doc?.originalTitle ?? doc?.title ?? "文書") : (doc?.title ?? "文書を選択してください"),
    docSub: showEn ? "原題を表示中 · AI 訳" : `原題：${doc?.originalTitle ?? doc?.title ?? "—"}`,
    enBtnLabel: showEn ? "日本語訳を表示" : "原題（English）を表示",
    enBtnStyle: BTN_SECONDARY,
    toggleEn: () => setShowEn((prev) => !prev),
    docTabs: [
      ["summary", "AI 要約"],
      ["abstract", "抄録と翻訳"],
      ["claims", "特許クレーム解析"],
      ["cite", "引用ネットワーク"]
    ].map(([k, label]) => ({
      label,
      style:
        docTab === k
          ? "cursor:pointer;border:none;background:none;font:inherit;font-size:13px;font-weight:600;color:#1A2433;padding:9px 14px;border-bottom:2px solid #E08A2B"
          : "cursor:pointer;border:none;background:none;font:inherit;font-size:13px;font-weight:500;color:#8A97A8;padding:9px 14px;border-bottom:2px solid transparent",
      go: () => setDocTab(String(k))
    })),
    docTabSummary: docTab === "summary",
    docTabAbstract: docTab === "abstract",
    docTabClaims: docTab === "claims",
    docTabCite: docTab === "cite",
    sumLevels: [
      ["short", "短文（3 行）"],
      ["detail", "詳細"],
      ["tech", "技術者向け"]
    ].map(([k, label]) => ({
      label,
      style:
        sumLevel === k
          ? "cursor:pointer;font-size:12px;font-weight:600;padding:5px 12px;border-radius:8px;border:1px solid #E08A2B;background:#FDEFE0;color:#B5701A"
          : "cursor:pointer;font-size:12px;font-weight:500;padding:5px 12px;border-radius:8px;border:1px solid #E3E8EF;background:#fff;color:#5A6678",
      go: () => setSumLevel(String(k))
    })),
    sumText,
    sumBusy,
    regenSum,
    abstractEn,
    abstractJa,
    related,
    axes,
    axesOnCount: Object.values(axesOn).filter(Boolean).length,
    buildCompare,
    compareBuilt: !!comparison,
    compareStatus,
    compareRows,
    outline,
    genReport,
    reportText,
    reportBusy,
    reportStatus,
    setReportText,
    reportEdit,
    setReportEdit,
    toggleReportEdit,
    exportReportMd,
    chat: chat.map((m) => ({
      ...m,
      hasCites: !!(m.cites && m.cites.length),
      cites: m.cites ?? [],
      wrapStyle:
        m.role === "user"
          ? "display:flex;flex-direction:column;align-items:flex-end"
          : "display:flex;flex-direction:column;align-items:flex-start;animation:icrps-in .3s ease both",
      bubbleStyle:
        m.role === "user"
          ? "max-width:620px;background:#141C29;color:#fff;padding:12px 16px;border-radius:12px 12px 3px 12px;font-size:13px;line-height:1.85;white-space:pre-wrap"
          : "max-width:760px;background:#FAFBFC;border:1px solid #EEF1F5;color:#1A2433;padding:14px 17px;border-radius:12px 12px 12px 3px;font-size:13.5px;line-height:1.95;white-space:pre-wrap"
    })),
    chatBusy,
    chatInput,
    chatSuggests: [
      { label: "反対の結論を出している文献は？", go: () => setChatInput("保存文献の中で、反対の結論を出しているものはありますか？") },
      { label: "実構造物データの有無で分類して", go: () => setChatInput("実構造物データを含む文献と室内試験のみの文献に分類してください。") },
      { label: "適用条件を教えて", go: () => setChatInput("これらの知見の適用条件と留意点を教えてください。") }
    ],
    setChatInput: (e: { target: { value: string } }) => setChatInput(e.target.value),
    sendChat,
    topics: watchTopicVars,
    watchName,
    setWatchName: (e: { target: { value: string } }) => setWatchName(e.target.value),
    watchTerms,
    setWatchTerms: (e: { target: { value: string } }) => setWatchTerms(e.target.value),
    watchFreq,
    setWatchFreq: (e: { target: { value: string } }) => setWatchFreq(e.target.value),
    showWatchForm,
    setShowWatchForm,
    createWatchTopic,
    watchMsg,
    watchMsgStyle:
      watchMsg.type === "ok"
        ? "margin-top:10px;padding:9px 12px;background:#E4F3EC;border:1px solid #B7E0C5;color:#1F8255;border-radius:8px;font-size:12px;line-height:1.6"
        : watchMsg.type === "error"
          ? "margin-top:10px;padding:9px 12px;background:#FCE9E7;border:1px solid #F5B3AD;color:#C5392F;border-radius:8px;font-size:12px;line-height:1.6"
          : "margin-top:10px;padding:9px 12px;background:#E9F0FB;border:1px solid #C9D7EC;color:#2E5AAC;border-radius:8px;font-size:12px;line-height:1.6",
    watchNotices,
    digestFreq,
    setDigestFreq: (e: { target: { value: string } }) => setDigestFreq(e.target.value),
    chatPaperCount: chatCounts.paper,
    chatPatentCount: chatCounts.patent,
    chatBookCount: chatCounts.book,
    chatDocCount: allDocs.length,
    chatBusyText: `${allDocs.length} 件の文献から根拠を探しています…`,
    trendRows,
    alertRows,
    recentProjectRows,
    projectStatusCounts,
    projectFilter,
    setProjectFilter: (v: string) => setProjectFilter(v),
    newProjectTitle,
    setNewProjectTitle: (e: { target: { value: string } }) => setNewProjectTitle(e.target.value),
    showNewProject,
    setShowNewProject,
    createProject,
    projectMsg,
    docActionMsg,
    saveOpenFor,
    saveProjectId,
    setSaveProjectId: (e: { target: { value: string } }) => setSaveProjectId(e.target.value),
    saveBusy,
    saveMsg,
    startSave,
    confirmSave,
    cancelSave,
    clearSaveMsg,
    adoptSummary,
    discardSummary,
    editSummary,
    claimsNote: claimsInfo.note,
    claimsText: claimsInfo.text,
    exportCompareCsv,
    compareSummary: comparison
      ? `比較表を生成しました（${comparison.rows.length} 文献 × ${comparison.comparisonAxes.length} 軸）。各セルは保存文献の要旨に基づきます。重要度の高い判断には原典確認と専門家確認が必要です。`
      : "比較表が未生成です。比較対象を選んで「比較表を生成」を実行してください。",
    adminTotalUsers: adminStats.totalUsers,
    adminAdmins: adminStats.admins,
    adminCostLabel: adminStats.costLabel,
    adminConnectorLabel: adminStats.connectorLabel,
    adminRejectLabel: adminStats.rejectLabel,
    adminAccessDenied: !isAdmin,
    projects: projectRows,
    audit: auditRows,
    fitReady,
    fitResults,
    runFit: () => {
      setFitReady(false);
      setTimeout(() => setFitReady(true), 700);
    },
    user,
    DISCLAIMER,
    aiEngineNote: "ルール応答モード · LLM キー未設定",
    userInitial: (user?.name ?? "U").slice(0, 1),
    userName: user?.name ?? "ゲスト",
    userOrg: user?.email ?? "",
    roleLabel: isAdmin ? "ADMIN" : "USER",
    statProjects,
    statProjectsSub,
    statDocs,
    statDocsSub,
    statReports,
    statReportsSub,
    statWatch,
    statWatchSub,
    digestMeta,
    docVenue: doc?.sourceName ?? "—",
    docDoi: doc?.doi ?? doc?.patentNumber ?? "—",
    docSource: doc?.sourceType === "patent" ? "Google Patents" : "Crossref / OpenAlex",
    docId: doc?.id ?? null,
    docUrl: doc?.url ?? "#",
    docUrlHost: doc?.url ? new URL(doc.url).hostname : "出典なし",
    docTypeLabel: doc ? (TYPE_LABEL[doc.sourceType === "pdf" ? "book" : doc.sourceType] ?? doc.sourceType) : "文書",
    docDomain: doc?.sourceType === "patent" ? "特許" : "保存文献",
    compareHeaders: comparison ? comparison.rows.slice(0, 4).map((r) => r.technologyName) : [],
    settingsDeepSeekConfigured: dsConfigured,
    settingsAnthropicConfigured: anConfigured,
    settingsActiveProvider: activeProvider,
    dsKey,
    setDsKey: (e: { target: { value: string } }) => setDsKey(e.target.value),
    dsModel,
    setDsModel: (e: { target: { value: string } }) => setDsModel(e.target.value),
    anKey,
    setAnKey: (e: { target: { value: string } }) => setAnKey(e.target.value),
    anModel,
    setAnModel: (e: { target: { value: string } }) => setAnModel(e.target.value),
    dsMsg,
    anMsg,
    dsBusy,
    anBusy,
    testDeepSeek,
    saveDeepSeek,
    clearDeepSeek,
    testAnthropic,
    saveAnthropic,
    clearAnthropic,
    clearDsInput,
    clearAnInput,
    settingsAccessDenied: !isAdmin,
    ingestRuns,
    ingestBusy,
    ingestMsg,
    runIngestNow,
    dsMsgStyle:
      dsMsg.type === "ok"
        ? "margin-top:4px;padding:10px 13px;background:#E4F3EC;border:1px solid #B7E0C5;color:#1F8255;border-radius:8px;font-size:12px;line-height:1.7;white-space:pre-wrap"
        : dsMsg.type === "error"
          ? "margin-top:4px;padding:10px 13px;background:#FCE9E7;border:1px solid #F5B3AD;color:#C5392F;border-radius:8px;font-size:12px;line-height:1.7;white-space:pre-wrap"
          : "margin-top:4px;padding:10px 13px;background:#E9F0FB;border:1px solid #C9D7EC;color:#2E5AAC;border-radius:8px;font-size:12px;line-height:1.7;white-space:pre-wrap",
    anMsgStyle:
      anMsg.type === "ok"
        ? "margin-top:4px;padding:10px 13px;background:#E4F3EC;border:1px solid #B7E0C5;color:#1F8255;border-radius:8px;font-size:12px;line-height:1.7;white-space:pre-wrap"
        : anMsg.type === "error"
          ? "margin-top:4px;padding:10px 13px;background:#FCE9E7;border:1px solid #F5B3AD;color:#C5392F;border-radius:8px;font-size:12px;line-height:1.7;white-space:pre-wrap"
          : "margin-top:4px;padding:10px 13px;background:#E9F0FB;border:1px solid #C9D7EC;color:#2E5AAC;border-radius:8px;font-size:12px;line-height:1.7;white-space:pre-wrap"
  };
}

export type StandaloneVars = ReturnType<typeof useStandaloneData>;
