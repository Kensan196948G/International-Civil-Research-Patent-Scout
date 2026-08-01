import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    domainChips: [],
    typeChips: [],
    feed: [],
    feedCount: 0,
    q: "",
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
    genReport: () => undefined,
    reportText: "",
    reportBusy: false,
    reportStatus: "未生成",
    chat: [],
    chatBusy: false,
    chatInput: "",
    chatSuggests: [],
    sendChat: () => undefined,
    topics: [],
    projects: [],
    audit: [],
    fitReady: true,
    fitResults: [],
    runFit: () => undefined,
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
    settingsAccessDenied: false
  };
}

describe("StandaloneView", () => {
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
});
