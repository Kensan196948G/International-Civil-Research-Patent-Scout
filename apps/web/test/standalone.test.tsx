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
    docDomain: ""
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
});
