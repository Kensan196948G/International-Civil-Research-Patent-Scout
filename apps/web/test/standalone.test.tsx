import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StandaloneView } from "../src/components/StandaloneView";

function baseVars() {
  return {
    showDisclaimer: true,
    navGroups: [
      {
        label: "リサーチ",
        items: [{ ico: "📊", label: "ダッシュボード", badge: null, active: true, go: () => undefined }]
      }
    ],
    pageTitle: "ダッシュボード",
    pageSub: "サブタイトル",
    isDashboard: true,
    isFeed: false,
    isSearch: false,
    isDoc: false,
    isCompare: false,
    isFit: false,
    isReport: false,
    isChat: false,
    isWatch: false,
    isProjects: false,
    isAdmin: false,
    goFeed: () => undefined,
    goSearch: () => undefined,
    goChat: () => undefined,
    goWatch: () => undefined,
    goProjects: () => undefined,
    goDoc: () => undefined,
    goCompare: () => undefined,
    goReport: () => undefined,
    digestText: "ダイジェスト本文",
    digestBusy: false,
    regenDigest: () => undefined,
    notifications: [],
    unreadCount: 0,
    markAllNotificationsRead: () => undefined,
    watchRunBusy: false,
    watchRunMsg: { type: "info", text: "" },
    runWatchNow: () => undefined,
    searchHistory: [],
    bookmarks: [],
    historyBusy: false,
    visibleCount: 0,
    facetActive: false,
    facetTypeOptions: [],
    facetCountryOptions: [],
    facetStatusOptions: [],
    clearFacets: () => undefined,
    facetYearFrom: "",
    setFacetYearFrom: () => undefined,
    facetYearTo: "",
    setFacetYearTo: () => undefined,
    citationInfo: null,
    citationBusy: false,
    familyInfo: null,
    familyBusy: false,
    docTabFamily: false,
    exportResultsCsv: () => undefined,
    shareSearch: () => undefined,
    shareMsg: "",
    importOpen: false,
    setImportOpen: () => undefined,
    importForm: {
      sourceType: "patent",
      title: "",
      originalTitle: "",
      abstract: "",
      url: "",
      doi: "",
      patentNumber: "",
      authors: "",
      publicationDate: "",
      sourceName: "",
      projectId: ""
    },
    setImportField: () => () => undefined,
    importBusy: false,
    importMsg: { type: "info", text: "" },
    submitImport: () => undefined,
    importProjects: [],
    pwdCurrent: "",
    setPwdCurrent: () => undefined,
    pwdNew: "",
    setPwdNew: () => undefined,
    pwdBusy: false,
    pwdMsg: { type: "info", text: "" },
    changePassword: () => undefined,
    pwdMsgStyle: "",
    domainChips: [],
    typeChips: [],
    feed: [],
    feedCount: 0,
    feedTab: "saved",
    setFeedTab: () => undefined,
    litSource: "all",
    changeLitSource: () => undefined,
    litQueryInput: "",
    setLitQueryInput: () => undefined,
    applyLitSearch: () => undefined,
    litRows: [],
    litTotal: 0,
    litLoading: false,
    litError: null,
    hasMoreLit: false,
    loadMoreLiterature: () => undefined,
    q: "",
    searchTypes: ["web", "paper", "patent"],
    toggleSearchType: () => undefined,
    yearFrom: "",
    setYearFrom: () => undefined,
    yearTo: "",
    setYearTo: () => undefined,
    countries: ["JP", "US", "EP"],
    toggleCountry: () => undefined,
    runSearch: () => undefined,
    searchStatus: "待機中",
    hasSteps: false,
    steps: [],
    termsReady: false,
    terms: [],
    resultsReady: false,
    results: [],
    resultCount: 0,
    hasCompare: false,
    compareCount: 0,
    toggleQueryEdit: () => undefined,
    acceptSuggest: () => undefined,
    docTitle: "文書タイトル",
    docId: null,
    clearDocument: () => undefined,
    docSub: "原題",
    enBtnLabel: "原題（English）を表示",
    enBtnStyle: "",
    toggleEn: () => undefined,
    docTabs: [],
    docTabSummary: true,
    docTabAbstract: false,
    docTabClaims: false,
    docTabCite: false,
    sumLevels: [],
    sumText: "",
    sumBusy: false,
    regenSum: () => undefined,
    abstractEn: "",
    abstractJa: "",
    related: [],
    axes: [],
    axesOnCount: 0,
    buildCompare: () => undefined,
    compareBuilt: false,
    compareStatus: "未生成",
    compareRows: [],
    compareHeaders: [],
    outline: [],
    reportType: "summary",
    setReportType: () => undefined,
    reportTitle: "技術調査レポート",
    setReportTitle: () => undefined,
    reportTypeOptions: [],
    genReport: () => undefined,
    reportText: "",
    reportBusy: false,
    reportStatus: "未生成",
    chat: [],
    chatBusy: false,
    chatInput: "",
    chatSuggests: [],
    sendChat: () => undefined,
    chatWebCount: 0,
    topics: [],
    projects: [],
    projectMembers: {},
    memberProjectId: "",
    onSelectMemberProject: () => undefined,
    memberEmail: "",
    setMemberEmail: () => undefined,
    memberRole: "viewer",
    setMemberRole: () => undefined,
    memberBusy: false,
    memberMsg: null,
    addProjectMember: () => undefined,
    changeProjectMemberRole: () => undefined,
    removeProjectMember: () => undefined,
    isOwnerOfSelected: false,
    teams: [],
    teamStats: null,
    selectedTeamId: "",
    setSelectedTeamId: () => undefined,
    teamName: "",
    setTeamName: () => undefined,
    teamMembers: {},
    teamMemberEmail: "",
    setTeamMemberEmail: () => undefined,
    teamMemberRole: "viewer",
    setTeamMemberRole: () => undefined,
    teamBusy: false,
    teamMsg: null,
    createTeam: () => undefined,
    addTeamMember: () => undefined,
    changeTeamMemberRole: () => undefined,
    removeTeamMember: () => undefined,
    projectTeamId: "",
    setProjectTeamId: () => undefined,
    assignProjectTeam: () => undefined,
    transferEmail: "",
    setTransferEmail: () => undefined,
    transferBusy: false,
    transferMsg: null,
    transferOwnership: () => undefined,
    audit: [],
    fitReady: true,
    fitResults: [],
    runFit: () => undefined,
    fitBusy: false,
    fitError: null,
    fitInput: {
      workType: "橋梁下部工（場所打ち）",
      environment: "海洋・飛沫帯",
      designStrength: "40 N/mm²",
      cover: "70 mm",
      serviceLife: "100 年",
      co2Target: "30% 以上",
      candidates: "高炉スラグ高置換コンクリート / LC3 / ジオポリマー"
    },
    setFitField: () => () => undefined,
    aiEngineNote: "ルール応答モード",
    userInitial: "U",
    userName: "テスト",
    userOrg: "test@example.local",
    roleLabel: "USER",
    statProjects: "0",
    statProjectsSub: "",
    statDocs: "0",
    statDocsSub: "",
    statReports: "0",
    statReportsSub: "",
    statWatch: "0",
    statWatchSub: "",
    digestMeta: "",
    docVenue: "",
    docDoi: "",
    docSource: "",
    docUrl: "",
    docUrlHost: "",
    docTypeLabel: "",
    docDomain: "",
    isSettings: false,
    settingsDeepSeekConfigured: false,
    settingsAnthropicConfigured: false,
    settingsActiveProvider: null,
    dsKey: "",
    setDsKey: () => undefined,
    dsModel: "deepseek-chat",
    setDsModel: () => undefined,
    anKey: "",
    setAnKey: () => undefined,
    anModel: "claude-sonnet-4-5",
    setAnModel: () => undefined,
    dsMsg: { type: "info", text: "" },
    anMsg: { type: "info", text: "" },
    dsMsgStyle: "",
    anMsgStyle: "",
    dsBusy: false,
    anBusy: false,
    testDeepSeek: () => undefined,
    saveDeepSeek: () => undefined,
    clearDeepSeek: () => undefined,
    clearDsInput: () => undefined,
    testAnthropic: () => undefined,
    saveAnthropic: () => undefined,
    clearAnthropic: () => undefined,
    clearAnInput: () => undefined,
    settingsAccessDenied: false,
    saveOpenFor: null,
    saveProjectId: "",
    setSaveProjectId: () => undefined,
    saveBusy: false,
    saveMsg: null,
    startSave: () => undefined,
    confirmSave: () => undefined,
    cancelSave: () => undefined,
    clearSaveMsg: () => undefined,
    trendRows: [],
    alertRows: [],
    recentProjectRows: [],
    projectStatusCounts: { "進行中": 0, "報告済": 0, "アーカイブ": 0 },
    projectFilter: "すべて",
    setProjectFilter: () => undefined,
    newProjectTitle: "",
    setNewProjectTitle: () => undefined,
    showNewProject: false,
    setShowNewProject: () => undefined,
    createProject: () => undefined,
    projectMsg: null,
    watchName: "",
    setWatchName: () => undefined,
    watchTerms: "",
    setWatchTerms: () => undefined,
    watchFreq: "weekly",
    setWatchFreq: () => undefined,
    showWatchForm: false,
    setShowWatchForm: () => undefined,
    createWatchTopic: () => undefined,
    watchMsg: { type: "info", text: "" },
    watchMsgStyle: "",
    watchNotices: "",
    digestFreq: "毎朝 6:00",
    setDigestFreq: () => undefined,
    chatPaperCount: 0,
    chatPatentCount: 0,
    chatBookCount: 0,
    chatDocCount: 0,
    chatBusyText: "",
    suggestDismissed: false,
    dismissSuggest: () => undefined,
    searchFailureSources: [],
    headerQuery: "",
    setHeaderQuery: () => undefined,
    runHeaderSearch: () => undefined,
    summaryMeta: "未生成",
    summaryEditing: false,
    setSummaryEditing: () => undefined,
    draftSummaryText: "",
    setDraftSummaryText: () => undefined,
    saveEditedSummary: () => undefined,
    cancelSummaryEdit: () => undefined,
    audience: "技術研究所内（専門家）",
    setAudience: () => undefined,
    docActionMsg: null,
    adoptSummary: () => undefined,
    discardSummary: () => undefined,
    editSummary: () => undefined,
    claimsNote: "",
    claimsText: "",
    setQ: () => undefined,
    setChatInput: () => undefined,
    setReportText: () => undefined,
    reportEdit: false,
    setReportEdit: () => undefined,
    toggleReportEdit: () => undefined,
    exportReportMd: () => undefined,
    exportReportFile: () => undefined,
    exportReportPdf: () => undefined,
    exportCompareCsv: () => undefined,
    compareSummary: "",
    adminTotalUsers: 0,
    adminAdmins: 0,
    adminCostLabel: "",
    adminCostSub: "",
    adminConnectorLabel: "",
    adminRejectLabel: "",
    adminRejectSub: "",
    adminAccessDenied: false,
    llmUsage: null
  };
}

describe("StandaloneView", () => {
  afterEach(cleanup);

  it("renders sidebar and dashboard shell", () => {
    render(<StandaloneView v={baseVars() as never} />);
    expect(screen.getByText("ICRPS")).toBeTruthy();
    expect(screen.getAllByText("ダッシュボード").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("リサーチ・ダイジェスト")).toBeTruthy();
    expect(screen.getByText("ダイジェスト本文")).toBeTruthy();
  });

  it("renders empty states without crashing", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isSearch = true;
    v.pageTitle = "AI 横断検索";
    render(<StandaloneView v={v as never} />);
    expect(screen.getByText("AI 横断検索")).toBeTruthy();
  });

  it("renders system settings screen with AI provider cards", () => {
    const v = baseVars();
    v.isSettings = true;
    v.pageTitle = "システム設定";
    v.settingsDeepSeekConfigured = true;
    v.dsMsg = { type: "ok", text: "接続成功 · deepseek / deepseek-chat · 120ms" };
    render(<StandaloneView v={v as never} />);
    expect(screen.getByText("システム設定")).toBeTruthy();
    expect(screen.getByText("DeepSeek（OpenAI 互換）")).toBeTruthy();
    expect(screen.getByText("Anthropic（Claude）")).toBeTruthy();
    expect(screen.getAllByText("設定テスト").length).toBe(2);
    expect(screen.getAllByText("設定保存").length).toBe(2);
    expect(screen.getAllByText("入力クリア").length).toBe(2);
    expect(screen.getByText("接続成功 · deepseek / deepseek-chat · 120ms")).toBeTruthy();
  });

  it("shows access denied message for non-admin users", () => {
    const v = baseVars();
    v.isSettings = true;
    v.pageTitle = "システム設定";
    v.settingsAccessDenied = true;
    render(<StandaloneView v={v as never} />);
    expect(screen.getByText("システム設定は管理者権限が必要です")).toBeTruthy();
  });

  it("shows empty state when no document is selected", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isDoc = true;
    v.pageTitle = "文書詳細";
    v.docId = null;
    render(<StandaloneView v={v as never} />);
    expect(screen.getByText("文書が選択されていません")).toBeTruthy();
    expect(screen.getByText("AI 横断検索へ")).toBeTruthy();
    expect(screen.getByText("技術文献フィードへ")).toBeTruthy();
  });

  it("clears the document detail screen", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isDoc = true;
    v.pageTitle = "文書詳細";
    v.docId = "d1";
    const clearDocument = vi.fn();
    v.clearDocument = clearDocument;
    render(<StandaloneView v={v as never} />);
    fireEvent.click(screen.getByText("画面クリア"));
    expect(clearDocument).toHaveBeenCalledTimes(1);
  });

  it("renders collected literature feed and opens document details", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isFeed = true;
    v.pageTitle = "技術文献フィード";
    v.feedTab = "collected";
    v.litTotal = 1;
    const goDoc = vi.fn();
    v.litRows = [
      {
        id: "d1",
        documentId: "d1",
        title: "既設PC橋の補修技術に関する研究",
        original: "Study on repair technology",
        venue: "土木研究所 論文・刊行物検索 · 2026-10-01",
        url: "https://thesis.pwri.go.jp/public_detail/122848/",
        summary: "要旨",
        authors: "吉田 英二",
        doi: "",
        sourceLabel: "土木研究所",
        date: "2026-10-01",
        typeStyle: "",
        typeLabel: "論文",
        goDoc,
        key: "lit-0"
      }
    ];
    render(<StandaloneView v={v as never} />);
    expect(screen.getByText("収集文献（土木建設技術）")).toBeTruthy();
    expect(screen.getByText("既設PC橋の補修技術に関する研究")).toBeTruthy();
    fireEvent.click(screen.getByText("既設PC橋の補修技術に関する研究"));
    expect(goDoc).toHaveBeenCalledTimes(1);
  });

  it("opens the correct document from a search result title", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isSearch = true;
    v.pageTitle = "AI 横断検索";
    v.resultsReady = true;
    const itemGoDoc = vi.fn();
    const globalGoDoc = vi.fn();
    v.goDoc = globalGoDoc;
    v.results = [
      {
        title: "低炭素コンクリートの耐久性評価",
        original: "",
        venue: "J-STAGE",
        url: "https://example.test/doc",
        summary: "要旨",
        domain: "論文",
        typeStyle: "",
        typeLabel: "論文",
        score: 0.9,
        goDoc: itemGoDoc,
        pickLabel: "比較に追加",
        pickStyle: "",
        toggle: () => undefined
      }
    ];
    render(<StandaloneView v={v as never} />);
    fireEvent.click(screen.getByText("低炭素コンクリートの耐久性評価"));
    expect(itemGoDoc).toHaveBeenCalledTimes(1);
    expect(globalGoDoc).not.toHaveBeenCalled();
  });

  it("opens project picker when saving a search result", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isSearch = true;
    v.pageTitle = "AI 横断検索";
    v.resultsReady = true;
    const startSave = vi.fn();
    v.startSave = startSave;
    v.projects = [{ id: "p1", title: "調査プロジェクトA" }];
    v.results = [
      {
        documentId: "doc-1",
        title: "高耐久コンクリートの実証",
        original: "",
        venue: "J-STAGE",
        url: "https://example.test/doc",
        summary: "要旨",
        domain: "論文",
        typeStyle: "",
        typeLabel: "論文",
        score: 0.9,
        goDoc: () => undefined,
        pickLabel: "比較に追加",
        pickStyle: "",
        toggle: () => undefined
      }
    ];
    render(<StandaloneView v={v as never} />);
    fireEvent.click(screen.getByText("プロジェクトに保存"));
    expect(startSave).toHaveBeenCalledWith("doc-1");
  });

  it("confirms save from the project picker", () => {
    const v = baseVars();
    v.isDashboard = false;
    v.isSearch = true;
    v.pageTitle = "AI 横断検索";
    v.resultsReady = true;
    const confirmSave = vi.fn();
    v.confirmSave = confirmSave;
    v.saveOpenFor = "doc-1";
    v.saveProjectId = "p1";
    v.projects = [{ id: "p1", title: "調査プロジェクトA" }];
    v.results = [
      {
        documentId: "doc-1",
        title: "高耐久コンクリートの実証",
        original: "",
        venue: "J-STAGE",
        url: "https://example.test/doc",
        summary: "要旨",
        domain: "論文",
        typeStyle: "",
        typeLabel: "論文",
        score: 0.9,
        goDoc: () => undefined,
        pickLabel: "比較に追加",
        pickStyle: "",
        toggle: () => undefined
      }
    ];
    render(<StandaloneView v={v as never} />);
    fireEvent.click(screen.getByText("保存する"));
    expect(confirmSave).toHaveBeenCalledTimes(1);
  });
});
