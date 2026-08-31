/* eslint-disable @typescript-eslint/no-explicit-any */
// 生成ファイル: ICRPS WebUI (standalone).html のテンプレートを機械変換した React ビュー
// 元テンプレートとの差分を保つため、手動編集は最小限にする
import { Fragment, useState } from "react";
import { css } from "../lib/css";

export function StandaloneView({ v }: { v: any }) {
  const [citeExpand, setCiteExpand] = useState(false);
  const {
    showDisclaimer, navGroups, pageTitle, pageSub,
    isDashboard, isFeed, isSearch, isDoc, isCompare, isFit, isReport, isChat, isWatch, isProjects, isAdmin,
    goFeed, goSearch, goChat, goWatch, goProjects, goCompare, goReport,
    digestText, digestBusy, regenDigest,
    notifications, unreadCount, markAllNotificationsRead,
    watchRunBusy, watchRunMsg, runWatchNow,
    searchHistory, historyBusy, exportResultsCsv, shareSearch, shareMsg,
    bookmarks, visibleCount, facetActive, facetTypeOptions, facetCountryOptions, facetStatusOptions, clearFacets,
    facetYearFrom, setFacetYearFrom, facetYearTo, setFacetYearTo,
    importOpen, setImportOpen, importForm, setImportField, importBusy, importMsg, submitImport, importProjects,
    pdfInfo, handlePdfFile, setImportLicense,
    pwdCurrent, setPwdCurrent, pwdNew, setPwdNew, pwdBusy, pwdMsg, changePassword, pwdMsgStyle,
    domainChips, typeChips, feed, feedCount,
    feedTab, setFeedTab, litSource, changeLitSource, litQueryInput, setLitQueryInput, applyLitSearch,
    litRows, litTotal, litLoading, litError, hasMoreLit, loadMoreLiterature,
    q, setQ, searchTypes, toggleSearchType, yearFrom, setYearFrom, yearTo, setYearTo,
    countries, toggleCountry, runSearch, searchStatus, hasSteps, steps, termsReady, terms,
    resultsReady, results, resultCount, hasCompare, compareCount, toggleQueryEdit, acceptSuggest, dismissSuggest, suggestDismissed,
    searchFailureSources, headerQuery, setHeaderQuery, runHeaderSearch,
    docTitle, docSub, enBtnLabel, enBtnStyle, toggleEn, docTabs, docTabSummary, docTabAbstract, docTabClaims, docTabCite, docTabFamily,
    sumLevels, sumText, sumBusy, regenSum, abstractEn, abstractJa, related, summaryMeta, summaryEditing,
    draftSummaryText, setDraftSummaryText, saveEditedSummary, cancelSummaryEdit,
    citationInfo, citationBusy, familyInfo, familyBusy,
    axes, axesOnCount, buildCompare, compareBuilt, compareStatus, compareRows,
    outline, reportType, setReportType, reportTitle, setReportTitle, reportTypeOptions,
    genReport, reportText, reportBusy, reportStatus, setReportText, reportEdit, toggleReportEdit, exportReportMd,
    exportReportFile, exportReportPdf,
    chat, chatBusy, chatInput, setChatInput, chatSuggests, sendChat,
    topics, projects, audit, fitReady, fitResults, runFit, fitBusy, fitError, fitInput, setFitField,
    projectMembers, memberProjectId, onSelectMemberProject, memberEmail, setMemberEmail,
    memberRole, setMemberRole, memberBusy, memberMsg, addProjectMember,
    changeProjectMemberRole, removeProjectMember, isOwnerOfSelected,
    teams, selectedTeamId, setSelectedTeamId, teamName, setTeamName, teamMembers, teamStats,
    teamMemberEmail, setTeamMemberEmail, teamMemberRole, setTeamMemberRole, teamBusy, teamMsg,
    createTeam, addTeamMember, changeTeamMemberRole, removeTeamMember,
    projectTeamId, setProjectTeamId, assignProjectTeam,
    transferEmail, setTransferEmail, transferBusy, transferMsg, transferOwnership,
    aiEngineNote, userInitial, userName, userOrg, roleLabel,
    statProjects, statProjectsSub, statDocs, statDocsSub, statReports, statReportsSub, statWatch, statWatchSub,
    digestMeta, docVenue, docDoi, docSource, docUrl, docUrlHost, docTypeLabel, docDomain, compareHeaders,
    clearDocument,
    isSettings, settingsDeepSeekConfigured, settingsAnthropicConfigured, settingsActiveProvider,
    dsKey, setDsKey, dsModel, setDsModel, anKey, setAnKey, anModel, setAnModel,
    dsMsg, anMsg, dsMsgStyle, anMsgStyle, dsBusy, anBusy,
    testDeepSeek, saveDeepSeek, clearDeepSeek, clearDsInput,
    testAnthropic, saveAnthropic, clearAnthropic, clearAnInput, settingsAccessDenied,
    ingestRuns, ingestBusy, ingestMsg, runIngestNow,
    docId, saveOpenFor, saveProjectId, setSaveProjectId, saveBusy, saveMsg, startSave, confirmSave, cancelSave, clearSaveMsg,
    trendRows, alertRows, recentProjectRows, projectStatusCounts, projectFilter, setProjectFilter,
    newProjectTitle, setNewProjectTitle, showNewProject, setShowNewProject, createProject, projectMsg,
    watchName, setWatchName, watchTerms, setWatchTerms, watchFreq, setWatchFreq,
    showWatchForm, setShowWatchForm, createWatchTopic, watchMsg, watchMsgStyle, watchNotices,
    digestFreq, setDigestFreq, chatPaperCount, chatPatentCount, chatBookCount, chatWebCount, chatDocCount, chatBusyText,
    docActionMsg, adoptSummary, discardSummary, editSummary,
    claimsNote, claimsText,
    exportCompareCsv, compareSummary, adminTotalUsers, adminAdmins, adminCostLabel, adminCostSub, llmUsage,
    adminConnectorLabel, adminRejectLabel, adminRejectSub, adminAccessDenied,
    audience, setAudience
  } = v as Record<string, any>;

  const savePicker = () => (
    <span style={css("display:inline-flex;gap:6px;align-items:center;flex-wrap:wrap")}>
      <select aria-label="保存先プロジェクト" value={saveProjectId} onChange={setSaveProjectId} style={css("font:inherit;font-size:12px;padding:6px 9px;border:1px solid #E3E8EF;border-radius:8px;color:#1A2433;max-width:230px;background:#fff")}>
        {projects.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
      </select>
      <button onClick={confirmSave} disabled={saveBusy} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{saveBusy ? "保存中…" : "保存する"}</button>
      <button onClick={cancelSave} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>取消</button>
    </span>
  );
  return (
    <>

    <a className="icrps-skip-link" href="#icrps-main">本文へ移動</a>

<div className="icrps-shell" style={css("display:flex;height:100vh;width:100%;overflow:hidden;background:#EEF1F5")}>

  <aside className="icrps-aside" style={css("width:252px;flex-shrink:0;background:#fff;border-right:1px solid #E3E8EF;display:flex;flex-direction:column;color:#5A6678")}>
    <div style={css("padding:18px 18px 16px;display:flex;align-items:center;gap:11px;border-bottom:1px solid #EEF1F5")}>
      <span style={css("width:34px;height:34px;border-radius:8px;background:#B25E0F;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff")}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path></svg>
      </span>
      <div style={css("line-height:1.2")}>
        <div style={css("color:#1A2433;font-weight:600;font-size:14.5px;letter-spacing:.2px")}>ICRPS</div>
        <div style={css("font-size:11px;color:#5F6B7C")}>土木技術リサーチ基盤</div>
      </div>
    </div>

    <nav style={css("flex:1;overflow-y:auto;padding:10px 12px 14px;display:flex;flex-direction:column;gap:1px")}>
      {(navGroups ).map((group: any) => (<Fragment key={group.label}>
        <div className="icrps-nav-group" style={css("padding:13px 8px 6px;font-size:11px;letter-spacing:1px;color:#5F6B7C;font-weight:600")}>{group.label}</div>
        {(group.items ).map((item: any) => (<Fragment key={item.label}>
          <button type="button" className="icrps-nav-item" aria-current={item.active ? "page" : undefined} onClick={item.go } style={css("position:relative;display:flex;align-items:center;gap:10px;padding:8px 11px;border-radius:7px;font-size:13px;font-weight:500;text-decoration:none;color:#5A6678;cursor:pointer;background:none;border:none;width:100%;text-align:left;font-family:inherit")}>
            {(item.active ) && (<>
              <span style={css("position:absolute;inset:0;background:#FDEFE0;border-radius:7px")}></span>
              <span style={css("position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:2px;background:#B25E0F")}></span>
            </>)}
            <span style={css("position:relative;width:18px;text-align:center;flex-shrink:0;font-size:13px")}>{item.ico}</span>
            <span style={css("position:relative;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{item.label}</span>
            {(item.badge ) && (<>
              <span style={css("position:relative;font-family:'IBM Plex Mono',monospace;font-size:10.5px;padding:1px 6px;border-radius:9px;background:#F2F4F8;color:#5A6678")}>{item.badge}</span>
            </>)}
          </button>
        </Fragment>))}
      </Fragment>))}
    </nav>

    <div style={css("padding:11px 14px;border-top:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}>
      <span style={css("width:7px;height:7px;border-radius:50%;background:#2E9E6B;box-shadow:0 0 0 3px rgba(46,158,107,.18);flex-shrink:0")}></span>
      <div style={css("flex:1;line-height:1.3")}>
        <div style={css("font-size:11.5px;color:#1A2433;font-weight:500")}>AI エンジン稼働中</div>
        <div style={css("font-size:10.5px;color:#5F6B7C;font-family:'IBM Plex Mono',monospace")}>{aiEngineNote}</div>
      </div>
    </div>

    <div style={css("padding:13px 14px;border-top:1px solid #EEF1F5;display:flex;align-items:center;gap:11px")}>
      <span style={css("width:34px;height:34px;border-radius:50%;background:#EEF1F5;color:#5A6678;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0")}>{userInitial}</span>
      <div style={css("flex:1;line-height:1.25")}>
        <div style={css("color:#1A2433;font-size:13px;font-weight:500")}>{userName}</div>
        <div style={css("font-size:11px;color:#5F6B7C")}>{userOrg}</div>
      </div>
      <span style={css("font-size:10px;font-weight:600;color:#B25E0F;border:1px solid rgba(224,138,43,.4);padding:1px 6px;border-radius:5px")}>{roleLabel}</span>
    </div>
  </aside>

  <div className="icrps-column" style={css("flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden")}>

    <header className="icrps-header" style={css("height:62px;flex-shrink:0;background:#fff;border-bottom:1px solid #E3E8EF;display:flex;align-items:center;padding:0 22px;gap:16px")}>
      <div style={css("min-width:0")}>
        <h1 className="icrps-page-title" style={css("font-size:16px;font-weight:600;color:#1A2433;line-height:1.2;margin:0")}>{pageTitle}</h1>
        <p className="icrps-page-sub" style={css("font-size:11.5px;color:#5F6B7C;margin:2px 0 0")}>{pageSub}</p>
      </div>
      <div style={css("flex:1")}></div>
      <div style={css("display:flex;align-items:center;gap:7px;background:#F2F4F8;border:1px solid #E3E8EF;border-radius:8px;padding:7px 11px;color:#5F6B7C")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
        <input aria-label="全体を検索" placeholder="全体を検索  ⌘K" value={headerQuery ?? ""} onChange={setHeaderQuery} onKeyDown={(e: any) => { if (e.key === "Enter") runHeaderSearch(headerQuery ?? ""); }} style={css("border:none;background:none;font:inherit;font-size:12.5px;width:170px;color:#1A2433;padding:0")} />
      </div>
      <button onClick={goChat } style={css("display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>AI に相談</button>
    </header>

    <main id="icrps-main" className="icrps-content" style={css("flex:1;overflow:auto;padding:20px 22px 40px")}>

      {(saveMsg) && (<div style={css("margin-bottom:14px;padding:10px 13px;border-radius:8px;font-size:12px;line-height:1.7;display:flex;align-items:center;gap:10px;" + (saveMsg.type === "ok" ? "background:#E4F3EC;border:1px solid #B7E0C5;color:#1E7A50" : "background:#FCE9E7;border:1px solid #F5B3AD;color:#B5322A"))}>
        <span style={css("flex:1")}>{saveMsg.text}</span>
        <button onClick={clearSaveMsg} style={css("cursor:pointer;border:none;background:none;color:inherit;font:inherit;font-size:14px;font-weight:700")}>×</button>
      </div>)}

      {/* ===================== ダッシュボード ===================== */}
      {(isDashboard ) && (<>
        <div data-screen-label="01 ダッシュボード">

          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:16px")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>調査プロジェクト</span><span style={css("width:8px;height:8px;border-radius:3px;background:#2E5AAC")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statProjects}</div>
              <div style={css("font-size:11px;font-weight:500;color:#1E7A50")}>{statProjectsSub}</div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>保存文献</span><span style={css("width:8px;height:8px;border-radius:3px;background:#1E7A50")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statDocs}</div>
              <div style={css("font-size:11px;font-weight:500;color:#5A6678")}>{statDocsSub}</div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>生成レポート</span><span style={css("width:8px;height:8px;border-radius:3px;background:#B25E0F")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statReports}</div>
              <div style={css("font-size:11px;font-weight:500;color:#5A6678")}>{statReportsSub}</div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>未読ウォッチ通知</span><span style={css("width:8px;height:8px;border-radius:3px;background:#B5322A")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statWatch}</div>
              <div style={css("font-size:11px;font-weight:500;color:#9A5A0E")}>{statWatchSub}</div>
            </div>
          </div>

          <div style={css("display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:16px;align-items:start")}>
            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                  <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#9A5A0E;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AI</span>
                  <div style={css("flex:1")}>
                    <h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>リサーチ・ダイジェスト</h2>
                    <div style={css("font-size:11.5px;color:#5F6B7C")}>{digestMeta}</div>
                  </div>
                  <button onClick={regenDigest } style={css("display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>再生成</button>
                </div>
                <div style={css("padding:15px 18px 17px;font-size:13px;line-height:1.75;color:#1A2433;min-height:96px")}>
                  <span data-stream="digestText">{digestText}</span>{(digestBusy ) && (<><span style={css("display:inline-block;width:7px;height:15px;background:#B25E0F;vertical-align:-2px;margin-left:2px;animation:icrps-blink 1s steps(1) infinite")}></span></>)}
                </div>
                <div style={css("padding:0 18px 16px;display:flex;gap:8px;flex-wrap:wrap")}>
                  <button onClick={goFeed } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>保存文献 {feedCount} 件を見る</button>
                  <button onClick={goWatch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>配信設定</button>
                  <span style={css("margin-left:auto;font-size:11px;color:#5F6B7C;align-self:center")}>出典リンク {feed.filter((f: any) => f.url && f.url !== "#").length} 件</span>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                  <div style={css("flex:1")}><h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>技術トレンド分析</h2><div style={css("font-size:11.5px;color:#5F6B7C")}>保存文献のテーマ別件数（キーワード分類・ルールベース）</div></div>
                  <span style={css("font-size:11px;font-weight:600;color:#1E7A50;background:#E4F3EC;padding:2px 8px;border-radius:6px")}>自動更新</span>
                </div>
                <div style={css("padding:16px 18px;display:flex;flex-direction:column;gap:13px")}>
                  {(trendRows ).map((t: any) => (<Fragment key={t.label}>
                    <div style={css("display:flex;align-items:center;gap:12px")}>
                      <span style={css("width:150px;flex-shrink:0;font-size:12.5px;color:#5A6678")}>{t.label}</span>
                      <span style={css("flex:1;height:8px;background:#EEF1F5;border-radius:4px;overflow:hidden;display:block")}><span style={css("display:block;height:100%;width:" + t.width + "%;background:" + t.color + ";border-radius:4px")}></span></span>
                      <span style={css("width:110px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#1E7A50;font-weight:600")}>{t.value}</span>
                    </div>
                  </Fragment>))}
                  <div style={css("margin-top:4px;padding:11px 13px;background:#FDEFE0;border-radius:8px;font-size:12px;line-height:1.7;color:#7A4B10")}>
                    <b>キーワード分析の所見：</b>保存文献の件数が多いテーマから、低炭素コンクリートと UAV 点検・画像診断の 2 領域に集中しています。重点テーマの文献が少ない場合は、検索で補完してください。
                    <button type="button" className="icrps-link-btn" onClick={goSearch } style={css("cursor:pointer;font-weight:600;white-space:nowrap;color:#2E5AAC")}>→ この観点で検索</button>
                  </div>
                </div>
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><h2 className="icrps-card-title" style={css("flex:1;font-size:14px;font-weight:600;margin:0")}>要確認のアラート</h2><span style={css("font-size:11px;font-weight:600;color:#B5322A;background:#FCE9E7;padding:2px 8px;border-radius:6px")}>{alertRows.length}</span></div>
                {(alertRows ).map((a: any, idx: number) => (<Fragment key={`alert-${idx}`}>
                  <div style={css("padding:13px 18px;" + (idx < alertRows.length - 1 ? "border-bottom:1px solid #EEF1F5;" : "") + "display:flex;gap:11px")}>
                    <span style={css("width:8px;height:8px;border-radius:50%;background:" + a.color + ";margin-top:5px;flex-shrink:0")}></span>
                    <div style={css("min-width:0")}><div style={css("font-size:12.5px;font-weight:600;line-height:1.5")}>{a.title}</div><div style={css("font-size:11.5px;color:#5F6B7C;margin-top:3px")}>{a.sub}</div></div>
                  </div>
                </Fragment>))}
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><h2 className="icrps-card-title" style={css("flex:1;font-size:14px;font-weight:600;margin:0")}>最近の調査プロジェクト</h2><button type="button" className="icrps-link-btn" onClick={goProjects } style={css("cursor:pointer;font-size:11.5px;color:#2E5AAC")}>すべて</button></div>
                {(recentProjectRows ).map((p: any, idx: number) => (<Fragment key={`recent-${idx}`}>
                  <div style={css("padding:12px 18px;" + (idx < recentProjectRows.length - 1 ? "border-bottom:1px solid #EEF1F5;" : "") + "display:flex;align-items:center;gap:10px")}>
                    <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:500;color:#1A2433")}>{p.title}</div><div style={css("font-size:11px;color:#5F6B7C;margin-top:2px")}>{p.meta}</div></div>
                    <span style={css(p.statusStyle )}>{p.status}</span>
                  </div>
                </Fragment>))}
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== 技術文献フィード ===================== */}
      {(isFeed ) && (<>
        <div data-screen-label="02 技術文献フィード">
          <div style={css("display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap")}>
            <button onClick={() => setFeedTab("saved")} style={css(feedTab === "saved" ? "cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600" : "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>保存文献</button>
            <button onClick={() => setFeedTab("collected")} style={css(feedTab === "collected" ? "cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600" : "cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>収集文献（土木建設技術）</button>
            <div style={css("flex:1")}></div>
            <span style={css("font-size:11.5px;color:#5F6B7C;align-self:center")}>2時間ごとに J-STAGE / 土木研究所 / ITC / 国交省 / 関東地整 から自動収集</span>
          </div>

          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
            <div style={css("padding:13px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:22px;height:22px;border-radius:6px;background:#E9F0FB;color:#2E5AAC;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>＋</span>
              <div style={css("flex:1")}>
                <h2 className="icrps-card-title" style={css("font-size:13.5px;font-weight:600;margin:0")}>手動で文献を登録（特許・論文・Web・PDF）</h2>
                <div style={css("font-size:11.5px;color:#5F6B7C")}>J-PlatPat / PATENTSCOPE / 社内資料など、自動収集対象外の情報源もメタデータ登録できます</div>
              </div>
              <button onClick={() => setImportOpen(!importOpen)} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{importOpen ? "閉じる" : "登録フォーム"}</button>
            </div>
            {(importOpen ) && (<>
              <div style={css("padding:15px 18px;display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:11px;background:#FAFBFC")}>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>種別
                  <select value={importForm.sourceType} onChange={setImportField("sourceType")} style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")}>
                    <option value="patent">特許</option><option value="paper">論文</option><option value="web">Web</option><option value="pdf">PDF・技術書</option>
                  </select>
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>タイトル *
                  <input value={importForm.title} onChange={setImportField("title")} placeholder="文献のタイトル" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>URL（必須のいずれか）
                  <input value={importForm.url} onChange={setImportField("url")} placeholder="https://…" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>DOI
                  <input value={importForm.doi} onChange={setImportField("doi")} placeholder="10.xxxx/xxxx" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>特許番号
                  <input value={importForm.patentNumber} onChange={setImportField("patentNumber")} placeholder="JP2023-123456A 等" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>著者（, 区切り）
                  <input value={importForm.authors} onChange={setImportField("authors")} placeholder="氏名1, 氏名2" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>公開日（YYYY-MM-DD）
                  <input value={importForm.publicationDate} onChange={setImportField("publicationDate")} placeholder="2026-08-01" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>保存先プロジェクト
                  <select value={importForm.projectId} onChange={setImportField("projectId")} style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")}>
                    <option value="">保存しない</option>
                    {importProjects.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                  </select>
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>要旨
                  <textarea value={importForm.abstract} onChange={setImportField("abstract")} rows={2} placeholder="要旨・請求項の概要（任意）" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff;resize:vertical")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>PDF ファイル（本文抽出・任意）
                  <input type="file" accept="application/pdf" aria-label="PDF ファイルを選択" onChange={(e) => void handlePdfFile(e.target.files?.[0])} style={css("font:inherit;font-size:12px;padding:6px 8px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")} />
                  {(pdfInfo?.text || pdfInfo?.error) && (
                    <span style={css("font-size:11px;line-height:1.6;color:" + (pdfInfo.error ? "#B5322A" : "#1E7A50") + ";font-weight:400")}>
                      {pdfInfo.error ?? `抽出済み: ${pdfInfo.pages} ページ・${pdfInfo.text.length.toLocaleString("ja-JP")} 文字${pdfInfo.truncated ? "（上限で切捨て）" : ""}`}
                    </span>
                  )}
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px")}>
                  <span style={css("display:flex;gap:8px;align-items:flex-start")}>
                    <input type="checkbox" checked={!!importForm.licenseConfirmed} onChange={(e) => setImportLicense(e.target.checked)} style={css("margin-top:2px;width:16px;height:16px")} />
                    <span>本文の保存を許諾するライセンスがあります（公開資料・社内許諾等）。ライセンス不明の場合はチェックせず、メタデータのみ登録されます。</span>
                  </span>
                </label>
                <div style={css("display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap")}>
                  <button onClick={submitImport} disabled={importBusy} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:8px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>{importBusy ? "登録中…" : "登録する"}</button>
                  {importForm.bodyText && !importForm.licenseConfirmed && (
                    <span style={css("font-size:11px;color:#B5322A;line-height:1.6")}>ライセンス未確認のため、本文は保存せずメタデータのみ登録されます。</span>
                  )}
                  {(importMsg.text) && <span style={css("font-size:11.5px;color:" + (importMsg.type === "ok" ? "#1E7A50" : importMsg.type === "error" ? "#B5322A" : "#2E5AAC") + ";line-height:1.6")}>{importMsg.text}</span>}
                </div>
              </div>
            </>)}
          </div>

          {feedTab === "saved" && (<>
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:16px;display:flex;flex-direction:column;gap:11px")}>
            <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
              <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;width:52px")}>分野</span>
              {(domainChips ).map((chip: any) => (<Fragment key={chip.label}>
                <button onClick={chip.go } style={css(chip.style )}>{chip.label}<span style={css("font-family:'IBM Plex Mono',monospace;opacity:.65;margin-left:5px")}>{chip.n}</span></button>
              </Fragment>))}
            </div>
            <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #EEF1F5;padding-top:11px")}>
              <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;width:52px")}>種別</span>
              {(typeChips ).map((chip: any) => (<Fragment key={chip.label}>
                <button onClick={chip.go } style={css(chip.style )}>{chip.label}</button>
              </Fragment>))}
              <div style={css("flex:1")}></div>
              <span style={css("font-size:11.5px;color:#5F6B7C")}>{feedCount} 件 · AI 選別スコア順</span>
            </div>
          </div>

          <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:16px;align-items:start")}>
            {(feed ).map((it: any) => (<Fragment key={it.id}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;display:flex;flex-direction:column;animation:icrps-in .25s ease both")}>
                <div style={css("padding:14px 17px 0;display:flex;align-items:center;gap:7px;flex-wrap:wrap")}>
                  <span style={css(it.typeStyle )}>{it.typeLabel}</span>
                  <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>{it.domain}</span>
                  <div style={css("flex:1")}></div>
                  <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#5F6B7C")}>{it.date}</span>
                </div>
                <div style={css("padding:11px 17px 0")}>
                  <div style={css("font-size:14px;font-weight:600;line-height:1.55;text-wrap:pretty")}>{it.title}</div>
                  <div style={css("font-size:11.5px;color:#5F6B7C;margin-top:5px;line-height:1.5")}>{it.original}</div>
                  <div style={css("font-size:11.5px;color:#5A6678;margin-top:6px;font-family:'IBM Plex Mono',monospace")}>{it.venue}</div>
                </div>
                <div style={css("margin:13px 17px 0;padding:12px 13px;background:#FAFBFC;border:1px solid #EEF1F5;border-radius:8px")}>
                  <div style={css("display:flex;align-items:center;gap:6px;margin-bottom:7px")}>
                    <span style={css("font-size:10px;font-weight:700;color:#9A5A0E;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>AI 要約</span>
                    <span style={css("font-size:10.5px;color:#5F6B7C")}>信頼度</span>
                    <span style={css("font-family:'IBM Plex Mono',monospace;font-size:10.5px;font-weight:600;color:#1E7A50")}>{it.conf}</span>
                  </div>
                  <div style={css("font-size:12.5px;line-height:1.75;color:#1A2433")}>{it.summary}</div>
                </div>
                <div style={css("padding:12px 17px 0;display:flex;flex-direction:column;gap:5px")}>
                  {(it.points ).map((p: any) => (<Fragment key={p}>
                    <div style={css("display:flex;gap:8px;font-size:12px;line-height:1.65;color:#5A6678")}><span style={css("color:#B25E0F;font-weight:700")}>•</span><span>{p}</span></div>
                  </Fragment>))}
                </div>
                <div style={css("margin-top:auto;padding:14px 17px;display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                  <button onClick={it.goDoc } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>詳細と全文要約</button>
                  {saveOpenFor === it.id ? savePicker() : (<button onClick={() => startSave(it.id)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>保存</button>)}
                  <div style={css("flex:1")}></div>
                  <a href={it.url} target="_blank" rel="noreferrer" style={css("font-size:11.5px;font-weight:600")}>出典 ↗</a>
                </div>
              </div>
            </Fragment>))}
          </div>
          </>)}

          {feedTab === "collected" && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
              <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>情報源</span>
              <select aria-label="情報源" value={litSource} onChange={(e: any) => changeLitSource(e.target.value)} style={css("font:inherit;font-size:12px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;color:#1A2433;background:#fff")}>
                <option value="all">すべて</option>
                <option value="jstage">J-STAGE</option>
                <option value="pwri">土木研究所</option>
                <option value="itc">ITC Digital Library</option>
                <option value="mlit">国土交通省</option>
                <option value="ktr">関東地整</option>
              </select>
              <input aria-label="タイトル・著者・キーワードで検索" value={litQueryInput} onChange={setLitQueryInput} placeholder="タイトル・著者・キーワードで検索" style={css("font:inherit;font-size:12.5px;padding:7px 11px;border:1px solid #E3E8EF;border-radius:8px;color:#1A2433;width:240px;max-width:100%")} />
              <button onClick={applyLitSearch } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>検索</button>
              <div style={css("flex:1")}></div>
              <span style={css("font-size:11.5px;color:#5F6B7C")}>{litTotal} 件 · 公開日・収集日時順</span>
            </div>

            {(litError ) && (<div style={css("margin-bottom:14px;padding:10px 13px;background:#FCE9E7;border:1px solid #F5B3AD;color:#B5322A;border-radius:8px;font-size:12px;line-height:1.7")}>{litError}</div>)}

            <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:16px;align-items:start")}>
              {(litRows ).map((it: any) => (<Fragment key={it.id}>
                <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;display:flex;flex-direction:column;animation:icrps-in .25s ease both")}>
                  <div style={css("padding:14px 17px 0;display:flex;align-items:center;gap:7px;flex-wrap:wrap")}>
                    <span style={css(it.typeStyle )}>{it.typeLabel}</span>
                    <span style={css("font-size:11px;font-weight:600;color:#2E5AAC;background:#E9F0FB;border:1px solid #C9D7EC;padding:2px 8px;border-radius:6px")}>{it.sourceLabel}</span>
                    <div style={css("flex:1")}></div>
                    <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#5F6B7C")}>{it.date}</span>
                  </div>
                  <div style={css("padding:11px 17px 0")}>
                    <button type="button" className="icrps-text-btn" onClick={it.goDoc } style={css("font-size:14px;font-weight:600;line-height:1.55;text-wrap:pretty;cursor:pointer;color:#1A2433")}>{it.title}</button>
                    <div style={css("font-size:11.5px;color:#5F6B7C;margin-top:5px;line-height:1.5")}>{it.original}</div>
                    {(it.authors ) && (<div style={css("font-size:11.5px;color:#5A6678;margin-top:6px")}>著者: {it.authors}</div>)}
                    <div style={css("font-size:11.5px;color:#5A6678;margin-top:6px;font-family:'IBM Plex Mono',monospace")}>{it.venue}{it.doi ? ` · DOI: ${it.doi}` : ""}</div>
                  </div>
                  <div style={css("margin:13px 17px 0;padding:12px 13px;background:#FAFBFC;border:1px solid #EEF1F5;border-radius:8px")}>
                    <div style={css("display:flex;align-items:center;gap:6px;margin-bottom:7px")}>
                      <span style={css("font-size:10px;font-weight:700;color:#2E5AAC;background:#E9F0FB;padding:1px 6px;border-radius:5px")}>収集メタデータ</span>
                      <span style={css("font-size:10.5px;color:#5F6B7C")}>要旨があるもののみ表示</span>
                    </div>
                    <div style={css("font-size:12.5px;line-height:1.75;color:#1A2433;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden")}>{it.summary}</div>
                  </div>
                  <div style={css("margin-top:auto;padding:14px 17px;display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                    <button onClick={it.goDoc } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>詳細を開く</button>
                    {saveOpenFor === it.documentId ? savePicker() : (<button onClick={() => startSave(it.documentId)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>プロジェクトに保存</button>)}
                    <div style={css("flex:1")}></div>
                    <a href={it.url} target="_blank" rel="noreferrer" style={css("font-size:11.5px;font-weight:600")}>出典 ↗</a>
                  </div>
                </div>
              </Fragment>))}
            </div>

            {(litLoading ) && (<div style={css("text-align:center;padding:18px;font-size:12px;color:#5F6B7C")}>読み込み中…</div>)}
            {(!litLoading && litRows.length === 0 && !litError ) && (<div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:34px 22px;text-align:center;font-size:12.5px;color:#5F6B7C")}>該当する収集文献はありません。情報源や検索条件を変えてお試しください。</div>)}
            {(hasMoreLit && !litLoading ) && (<div style={css("display:flex;justify-content:center;margin-top:16px")}>
              <button onClick={loadMoreLiterature } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 16px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>さらに読み込む（残り {Math.max(litTotal - litRows.length, 0)} 件）</button>
            </div>)}
          </>)}
        </div>
      </>)}

      {/* ===================== AI 横断検索 ===================== */}
      {(isSearch ) && (<>
        <div data-screen-label="03 AI横断検索">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:18px;margin-bottom:16px")}>
            <label htmlFor="icrps-search-q" style={css("font-size:12px;font-weight:600;color:#5A6678;display:block;margin-bottom:6px")}>調べたいことを、そのまま日本語で書いてください</label>
            <textarea id="icrps-search-q" value={q} onChange={setQ} rows={2} placeholder="例：海洋環境の飛沫帯で使える低炭素コンクリート。塩害に対する耐久性の実証データがあるものを中心に。" style={css("font:inherit;font-size:14px;padding:11px 13px;border:1px solid #E3E8EF;border-radius:8px;background:#fff;color:#1A2433;width:100%;resize:vertical;line-height:1.7")}></textarea>
            <div style={css("display:flex;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-top:11px;padding-top:11px;border-top:1px solid #EEF1F5")}>
              <div style={css("display:flex;flex-direction:column;gap:6px")}>
                <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>情報種別</span>
                <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                  {["paper", "patent", "web"].map((t: string) => (
                    <button key={t} onClick={() => toggleSearchType(t)} style={css("cursor:pointer;font-size:11.5px;font-weight:600;padding:5px 10px;border-radius:7px;border:1px solid " + (searchTypes.includes(t) ? "#B25E0F" : "#E3E8EF") + ";background:" + (searchTypes.includes(t) ? "#FDEFE0" : "#fff") + ";color:" + (searchTypes.includes(t) ? "#9A5A0E" : "#5A6678"))}>
                      {t === "paper" ? "論文" : t === "patent" ? "特許" : "Web"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:6px")}>
                <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>発行年</span>
                <div style={css("display:flex;gap:8px;align-items:center")}>
                  <input aria-label="発行年（開始）" value={yearFrom} onChange={setYearFrom} placeholder="2015" inputMode="numeric" style={css("font:inherit;font-size:12.5px;padding:6px 9px;border:1px solid #E3E8EF;border-radius:8px;width:86px")} />
                  <span style={css("color:#5F6B7C")}>–</span>
                  <input aria-label="発行年（終了）" value={yearTo} onChange={setYearTo} placeholder="2026" inputMode="numeric" style={css("font:inherit;font-size:12.5px;padding:6px 9px;border:1px solid #E3E8EF;border-radius:8px;width:86px")} />
                </div>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:6px")}>
                <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>国・地域</span>
                <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                  {["JP", "US", "EP", "CN"].map((c: string) => (
                    <button key={c} onClick={() => toggleCountry(c)} style={css("cursor:pointer;font-size:11px;font-weight:600;padding:5px 9px;border-radius:7px;font-family:'IBM Plex Mono',monospace;border:1px solid " + (countries.includes(c) ? "#B25E0F" : "#E3E8EF") + ";background:" + (countries.includes(c) ? "#FDEFE0" : "#fff") + ";color:" + (countries.includes(c) ? "#9A5A0E" : "#5A6678"))}>{c}</button>
                  ))}
                </div>
              </div>
              <div style={css("flex:1")}></div>
              <span style={css("font-size:11px;color:#5F6B7C;align-self:flex-end;padding-bottom:6px")}>種別をすべて外すと既定（論文・特許・Web）で検索します</span>
            </div>
            <div style={css("display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:12px")}>
              <button onClick={runSearch } style={css("display:inline-flex;align-items:center;gap:7px;cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:9px 16px;border-radius:8px;font:inherit;font-size:13px;font-weight:600")}>AI に解釈させて検索</button>
              <button onClick={shareSearch } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>条件を共有（URL コピー）</button>
              <span style={css("font-size:11.5px;color:#5F6B7C")}>論文 · 特許 · 技術書 · Web を横断／日英自動展開</span>
              <div style={css("flex:1")}></div>
              <span style={css("font-size:11.5px;color:#5F6B7C;font-family:'IBM Plex Mono',monospace")}>{searchStatus}</span>
            </div>
            {(shareMsg) && (<div style={css("margin-top:9px;padding:8px 12px;background:#E9F0FB;border:1px solid #C9D7EC;color:#2E5AAC;border-radius:8px;font-size:11.5px;line-height:1.7")}>{shareMsg}</div>)}
          </div>

          {(historyBusy || searchHistory.length > 0) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
              <h2 className="icrps-card-title" style={css("padding:13px 18px;border-bottom:1px solid #EEF1F5;font-size:13px;font-weight:600;margin:0")}>検索履歴（直近 {searchHistory.length} 件）</h2>
              <div style={css("padding:10px 14px;display:flex;flex-direction:column;gap:4px")}>
                {historyBusy && searchHistory.length === 0 && <div style={css("font-size:12px;color:#5F6B7C;padding:6px 4px")}>履歴を読み込み中…</div>}
                {searchHistory.map((h: any) => (
                  <div key={h.id} style={css("display:flex;align-items:center;gap:10px;padding:7px 6px;border-radius:7px")}>
                    <span style={css("font-size:10.5px;font-weight:700;color:" + (h.status === "completed" ? "#1E7A50" : "#9A5A0E") + ";background:" + (h.status === "completed" ? "#E4F3EC" : "#FDEFE0") + ";padding:2px 8px;border-radius:5px;flex:none")}>{h.status === "completed" ? "完了" : h.status}</span>
                    <button onClick={h.apply} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:12.5px;color:#1A2433;text-align:left;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{h.query}</button>
                    <button onClick={h.toggleBookmark} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:13px;color:" + (h.bookmarked ? "#B25E0F" : "#5F6B7C") + ";flex:none")} title={h.bookmarked ? "ブックマーク解除" : "ブックマーク"}>{h.bookmarked ? "★" : "☆"}</button>
                    <span style={css("font-size:11px;color:#5F6B7C;font-family:'IBM Plex Mono',monospace;flex:none")}>{h.resultCount} 件 · {h.at}</span>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {(bookmarks.length > 0) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
              <div style={css("padding:13px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}>
                <h2 className="icrps-card-title" style={css("flex:1;font-size:13px;font-weight:600;margin:0")}>保存済み検索（★ブックマーク）</h2>
                <span style={css("font-size:11px;color:#5F6B7C")}>{bookmarks.length} 件</span>
              </div>
              <div style={css("padding:10px 14px;display:flex;flex-direction:column;gap:4px")}>
                {bookmarks.map((b: any) => (
                  <div key={b.id} style={css("display:flex;align-items:center;gap:10px;padding:7px 6px;border-radius:7px")}>
                    <span style={css("font-size:13px;color:#B25E0F;flex:none")}>★</span>
                    <button onClick={b.apply} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:12.5px;color:#1A2433;text-align:left;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{b.query}</button>
                    <span style={css("font-size:11px;color:#5F6B7C;font-family:'IBM Plex Mono',monospace;flex:none")}>{b.resultCount} 件 · {b.at}</span>
                    <button onClick={b.unbookmark} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:11px;color:#B5322A;flex:none")}>解除</button>
                  </div>
                ))}
              </div>
            </div>
          </>)}

          {(hasSteps ) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
              <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:9px")}>
                <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#9A5A0E;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AI</span>
                <h2 className="icrps-card-title" style={css("flex:1;font-size:14px;font-weight:600;margin:0")}>検索意図の解釈</h2>
                <button onClick={toggleQueryEdit } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:5px 10px;border-radius:8px;font:inherit;font-size:11.5px;font-weight:600")}>展開語を手で修正</button>
              </div>
              <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:10px")}>
                {(steps ).map((s: any) => (<Fragment key={s.label}>
                  <div style={css("display:flex;gap:11px;align-items:flex-start;animation:icrps-in .3s ease both")}>
                    <span style={css(s.dot )}></span>
                    <div style={css("min-width:0;flex:1")}>
                      <div style={css("font-size:12.5px;font-weight:600;color:#1A2433")}>{s.label}</div>
                      <div style={css("font-size:12px;color:#5A6678;line-height:1.7;margin-top:3px")}>{s.detail}</div>
                    </div>
                  </div>
                </Fragment>))}
                {(termsReady ) && (<>
                  <div style={css("border-top:1px solid #EEF1F5;padding-top:12px;display:flex;gap:7px;flex-wrap:wrap;align-items:center")}>
                    <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;margin-right:3px")}>展開クエリ</span>
                    {(terms ).map((t: any) => (<Fragment key={t.text}>
                      <span style={css(t.style )}>{t.text}</span>
                    </Fragment>))}
                  </div>
                </>)}
              </div>
            </div>
          </>)}

          {(resultsReady ) && (<>
            <div style={css("display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start")}>
              <div style={css("display:flex;flex-direction:column;gap:12px;min-width:0")}>
                {(searchFailureSources && searchFailureSources.length > 0) && (
                  <div style={css("padding:10px 13px;background:#FCE9E7;border:1px solid #F5B3AD;color:#B5322A;border-radius:8px;font-size:12px;line-height:1.7")}>
                    一部の情報源で取得に失敗しました（{searchFailureSources.length} 件）: {searchFailureSources.join(" / ")}
                  </div>
                )}
                <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
                  <h2 className="icrps-card-title" style={css("font-size:13px;font-weight:600;margin:0")}>検索結果 {resultCount} 件{facetActive ? `・表示 ${visibleCount} 件` : ""}</h2>
                  <span style={css("font-size:11.5px;color:#5F6B7C")}>展開クエリ・重複排除済み</span>
                  <div style={css("flex:1")}></div>
                  <button onClick={exportResultsCsv} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>CSV 出力</button>
                  {(hasCompare ) && (<>
                    <button onClick={goCompare } style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>選択 {compareCount} 件で AI 比較表</button>
                  </>)}
                </div>
                {(results ).map((r: any) => (<Fragment key={r.title}>
                  <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:16px 18px;animation:icrps-in .25s ease both")}>
                    <div style={css("display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:9px")}>
                      <span style={css(r.typeStyle )}>{r.typeLabel}</span>
                      <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>{r.domain}</span>
                      <div style={css("flex:1")}></div>
                      <span style={css("font-size:11px;color:#5F6B7C")}>関連度</span>
                      <span style={css("font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:#1E7A50")}>{r.score}</span>
                    </div>
                    <button type="button" className="icrps-text-btn" onClick={r.goDoc } style={css("font-size:14.5px;font-weight:600;line-height:1.55;cursor:pointer;color:#1A2433;text-wrap:pretty")}>{r.title}</button>
                    <div style={css("font-size:11.5px;color:#5F6B7C;margin-top:5px;line-height:1.5")}>{r.original}</div>
                    <div style={css("font-size:12.5px;line-height:1.75;color:#5A6678;margin-top:9px")}>{r.summary}</div>
                    {(r.patentStatus || (r.applicants ?? []).length > 0 || (r.inventors ?? []).length > 0) && (<div style={css("display:flex;gap:6px;flex-wrap:wrap;margin-top:8px")}>
                      {r.patentStatus && <span style={css("font-size:10.5px;font-weight:700;color:#6B45B0;background:#EDE7F6;padding:2px 8px;border-radius:5px")}>ステータス: {r.patentStatus}</span>}
                      {(r.applicants ?? []).slice(0, 2).map((a: string) => <span key={a} style={css("font-size:10.5px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:5px")}>出願人: {a}</span>)}
                      {(r.inventors ?? []).slice(0, 2).map((i: string) => <span key={i} style={css("font-size:10.5px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:5px")}>発明者: {i}</span>)}
                    </div>)}
                    <div style={css("font-size:11.5px;color:#5F6B7C;margin-top:9px;font-family:'IBM Plex Mono',monospace")}>{r.venue}</div>
                    <div style={css("display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center")}>
                      <button onClick={r.toggle } style={css(r.pickStyle )}>{r.pickLabel}</button>
                      {saveOpenFor === r.documentId ? savePicker() : (<button onClick={() => startSave(r.documentId)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>プロジェクトに保存</button>)}
                      <div style={css("flex:1")}></div>
                      <a href={r.url} target="_blank" rel="noreferrer" style={css("font-size:11.5px;font-weight:600")}>出典 ↗</a>
                    </div>
                  </div>
                </Fragment>))}
              </div>

              <div style={css("display:flex;flex-direction:column;gap:16px")}>
                <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                  <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}>
                    <h2 className="icrps-card-title" style={css("flex:1;font-size:13.5px;font-weight:600;margin:0")}>絞り込み</h2>
                    {facetActive && <button onClick={clearFacets} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5F6B7C;padding:4px 10px;border-radius:7px;font:inherit;font-size:11px;font-weight:600")}>クリア</button>}
                  </div>
                  <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:13px")}>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>情報種別</span>
                      <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                        {facetTypeOptions.map((f: any) => (
                          <button key={f.value} onClick={f.toggle} style={css("cursor:pointer;font-size:11.5px;font-weight:600;padding:5px 10px;border-radius:7px;border:1px solid " + (f.on ? "#B25E0F" : "#E3E8EF") + ";background:" + (f.on ? "#FDEFE0" : "#fff") + ";color:" + (f.on ? "#9A5A0E" : "#5A6678"))}>
                            {f.value === "paper" ? "論文" : f.value === "patent" ? "特許" : f.value === "web" ? "Web" : f.value} {f.count}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>国・地域</span>
                      <div style={css("display:flex;gap:8px;align-items:center")}>
                        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                          {facetCountryOptions.map((f: any) => (
                            <button key={f.value} onClick={f.toggle} style={css("cursor:pointer;font-size:11px;font-weight:600;padding:5px 9px;border-radius:7px;font-family:'IBM Plex Mono',monospace;border:1px solid " + (f.on ? "#B25E0F" : "#E3E8EF") + ";background:" + (f.on ? "#FDEFE0" : "#fff") + ";color:" + (f.on ? "#9A5A0E" : "#5A6678"))}>{f.value} {f.count}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>発行年</span>
                      <div style={css("display:flex;gap:8px;align-items:center")}>
                        <input aria-label="絞り込み 発行年（開始）" value={facetYearFrom} onChange={setFacetYearFrom} placeholder="2015" inputMode="numeric" style={css("font:inherit;font-size:12.5px;padding:6px 9px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} />
                        <span style={css("color:#5F6B7C")}>–</span>
                        <input aria-label="絞り込み 発行年（終了）" value={facetYearTo} onChange={setFacetYearTo} placeholder="2026" inputMode="numeric" style={css("font:inherit;font-size:12.5px;padding:6px 9px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} />
                      </div>
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>特許ステータス</span>
                      <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                        {facetStatusOptions.map((f: any) => (
                          <button key={f.value} onClick={f.toggle} style={css("cursor:pointer;font-size:11px;font-weight:600;padding:5px 9px;border-radius:7px;border:1px solid " + (f.on ? "#B25E0F" : "#E3E8EF") + ";background:" + (f.on ? "#FDEFE0" : "#fff") + ";color:" + (f.on ? "#9A5A0E" : "#5A6678"))}>{f.value} {f.count}</button>
                        ))}
                        {facetStatusOptions.length === 0 && <span style={css("font-size:11px;color:#5F6B7C")}>特許ステータス情報なし</span>}
                      </div>
                    </div>
                  </div>
                </div>

                {(suggestDismissed ) ? null : (<>
                <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                  <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}><span style={css("font-size:10px;font-weight:700;color:#9A5A0E;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>AI</span><h2 className="icrps-card-title" style={css("font-size:13.5px;font-weight:600;margin:0")}>次の一手</h2></div>
                  <div style={css("padding:13px 17px;font-size:12.5px;line-height:1.8;color:#5A6678")}>
                    上位 12 件のうち 9 件が室内試験のみです。<b style={css("color:#1A2433")}>実構造物の暴露試験</b>を条件に加えると母集団が絞られます。
                  </div>
                  <div style={css("padding:0 17px 15px;display:flex;gap:7px;flex-wrap:wrap")}>
                    <button onClick={acceptSuggest } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>条件に追加</button>
                    <button onClick={dismissSuggest } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5F6B7C;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>却下</button>
                  </div>
                </div>
                </>)}
              </div>
            </div>
          </>)}
        </div>
      </>)}

      {/* ===================== 文書詳細 ===================== */}
      {(isDoc ) && (<>
        <div data-screen-label="04 文書詳細">
          {(!docId ) ? (<div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:46px 24px;text-align:center")}>
            <div style={css("font-size:28px;margin-bottom:10px")}>📄</div>
            <h2 className="icrps-card-title" style={css("font-size:14.5px;font-weight:600;color:#1A2433;margin:0 0 6px")}>文書が選択されていません</h2>
            <div style={css("font-size:12px;color:#5F6B7C;line-height:1.8;margin-bottom:18px")}>検索結果または技術文献フィードで文書タイトルをクリックすると、この画面に詳細が表示されます。</div>
            <div style={css("display:flex;gap:8px;justify-content:center;flex-wrap:wrap")}>
              <button onClick={goSearch } style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>AI 横断検索へ</button>
              <button onClick={goFeed } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>技術文献フィードへ</button>
            </div>
          </div>) : (<>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:16px;align-items:start")}>
            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:20px 22px")}>
                <div style={css("display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:11px")}>
                  <span style={css("font-size:11px;font-weight:600;color:#1E7A50;background:#E4F3EC;padding:2px 8px;border-radius:6px")}>{docTypeLabel}</span>
                  <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>{docDomain}</span>
                  <div style={css("flex:1")}></div>
                  <button onClick={toggleEn } style={css(enBtnStyle )}>{enBtnLabel}</button>
                  <button onClick={clearDocument } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:11.5px;font-weight:600")}>画面クリア</button>
                </div>
                <h1 style={css("font-size:20px;font-weight:600;line-height:1.5;margin:0 0 8px;text-wrap:pretty")}>{docTitle}</h1>
                <div style={css("font-size:12.5px;color:#5F6B7C;line-height:1.7")}>{docSub}</div>
                <div style={css("display:grid;grid-template-columns:max-content 1fr;gap:9px 18px;margin:16px 0 0;padding-top:15px;border-top:1px solid #EEF1F5")}>
                  <span style={css("color:#5F6B7C;font-weight:600;font-size:12px")}>掲載誌</span><span style={css("font-size:12.5px")}>{docVenue}</span>
                  <span style={css("color:#5F6B7C;font-weight:600;font-size:12px")}>DOI</span><span style={css("font-size:12.5px;font-family:'IBM Plex Mono',monospace")}>{docDoi}</span>
                  <span style={css("color:#5F6B7C;font-weight:600;font-size:12px")}>取得元</span><span style={css("font-size:12.5px")}>{docSource}</span>
                  <span style={css("color:#5F6B7C;font-weight:600;font-size:12px")}>出典</span><span style={css("font-size:12.5px")}><a href={docUrl} target="_blank" rel="noreferrer">{docUrlHost} ↗</a></span>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("display:flex;gap:2px;padding:10px 14px 0;border-bottom:1px solid #EEF1F5")}>
                  {(docTabs ).map((t: any) => (<Fragment key={t.label}>
                    <button onClick={t.go } style={css(t.style )}>{t.label}</button>
                  </Fragment>))}
                </div>

                {(docTabSummary ) && (<>
                  <div style={css("padding:16px 20px 20px")}>
                    <div style={css("display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:14px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;margin-right:3px")}>要約の粒度</span>
                      {(sumLevels ).map((l: any) => (<Fragment key={l.label}>
                        <button onClick={l.go } style={css(l.style )}>{l.label}</button>
                      </Fragment>))}
                      <div style={css("flex:1")}></div>
                      <span style={css("font-size:11px;color:#5F6B7C")}>生成モデル</span>
                      <span style={css("font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:#5A6678")}>{summaryMeta}</span>
                    </div>
                    {summaryEditing ? (
                      <div style={css("display:flex;flex-direction:column;gap:9px")}>
                        <textarea aria-label="要約本文（編集）" value={draftSummaryText} onChange={setDraftSummaryText} rows={10} style={css("font:inherit;font-size:13.5px;line-height:1.95;padding:12px 14px;border:1px solid #E3E8EF;border-radius:8px;resize:vertical;color:#1A2433")} />
                        <div style={css("display:flex;gap:8px")}>
                          <button onClick={saveEditedSummary} style={css("cursor:pointer;border:1px solid #1E7A50;background:#1E7A50;color:#fff;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>編集を保存</button>
                          <button onClick={cancelSummaryEdit} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>キャンセル</button>
                        </div>
                      </div>
                    ) : (
                      <div style={css("font-size:13.5px;line-height:1.95;color:#1A2433;min-height:150px;white-space:pre-wrap")}><span data-stream="sumText">{sumText}</span>{(sumBusy ) && (<><span style={css("display:inline-block;width:7px;height:16px;background:#B25E0F;vertical-align:-3px;margin-left:2px;animation:icrps-blink 1s steps(1) infinite")}></span></>)}</div>
                    )}
                    <div style={css("margin-top:18px;padding-top:15px;border-top:1px solid #EEF1F5;display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                      <button onClick={adoptSummary } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#1E7A50;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>この要約を採用</button>
                      <button onClick={regenSum } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>再生成</button>
                      <button onClick={editSummary } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>手で編集</button>
                      <button onClick={discardSummary } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5F6B7C;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>却下</button>
                      <div style={css("flex:1")}></div>
                      <span style={css("font-size:11px;color:#5F6B7C")}>{docActionMsg ?? "根拠：要約の引用・出典に基づきます"}</span>
                    </div>
                  </div>
                </>)}

                {(docTabAbstract ) && (<>
                  <div style={css("padding:18px 20px 20px;display:flex;flex-direction:column;gap:16px")}>
                    <div>
                      <div style={css("font-size:11.5px;font-weight:600;color:#5F6B7C;margin-bottom:7px")}>原文抄録（English）</div>
                      <div style={css("font-size:13px;line-height:1.9;color:#5A6678;background:#FAFBFC;border:1px solid #EEF1F5;border-radius:8px;padding:14px 16px")}>{abstractEn}</div>
                    </div>
                    <div>
                      <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:7px")}><span style={css("font-size:11.5px;font-weight:600;color:#5F6B7C")}>抄録・メタデータ</span><span style={css("font-size:10px;font-weight:700;color:#9A5A0E;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>自動翻訳は未実装</span></div>
                      <div style={css("font-size:13.5px;line-height:1.95;color:#1A2433")}>{abstractJa}</div>
                    </div>
                    <div style={css("padding:11px 13px;background:#FDEFE0;border-radius:8px;font-size:11.5px;line-height:1.7;color:#7A4B10")}>現在は取得メタデータ（抄録・タイトル）をそのまま表示しています。AI 翻訳はロードマップ項目です（要約タブの AI 要約では日本語生成が可能）。</div>
                  </div>
                </>)}

                {(docTabClaims ) && (<>
                  <div style={css("padding:18px 20px 20px;display:flex;flex-direction:column;gap:14px")}>
                    <div style={css("padding:10px 13px;background:#FCE9E7;border-radius:8px;font-size:11.5px;line-height:1.7;color:#8E2B23")}>{claimsNote}</div>
                    {(claimsText ) && (<div style={css("display:flex;flex-direction:column;gap:11px")}>
                      <div style={css("border:1px solid #E3E8EF;border-radius:8px;overflow:hidden")}>
                        <div style={css("padding:9px 13px;background:#FAFBFC;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}><span style={css("font-family:'IBM Plex Mono',monospace;font-size:11.5px;font-weight:600")}>請求項 1（独立項）</span><span style={css("font-size:10.5px;font-weight:600;color:#B5322A;background:#FCE9E7;padding:1px 7px;border-radius:5px")}>要注意</span></div>
                        <div style={css("padding:13px;font-size:12.5px;line-height:1.9;color:#5A6678")}>{claimsText}</div>
                        <div style={css("padding:12px 13px;border-top:1px solid #EEF1F5;background:#FAFBFC")}>
                          <div style={css("font-size:11px;font-weight:700;color:#9A5A0E;margin-bottom:6px")}>AI 読み解き</div>
                          <div style={css("font-size:12.5px;line-height:1.85;color:#1A2433")}>特許要約・クレーム関連情報は AI 要約タブの「特許要約」で再生成できます。特許の法的有効性・侵害判断は行いません。</div>
                        </div>
                      </div>
                    </div>)}
                    <div style={css("display:flex;gap:8px;flex-wrap:wrap")}><button onClick={goSearch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>類似特許を再検索</button></div>
                  </div>
                </>)}

                {(docTabCite ) && (<>
                  <div style={css("padding:18px 20px 20px")}>
                    <div style={css("font-size:12.5px;color:#5A6678;line-height:1.8;margin-bottom:14px")}>Crossref / OpenAlex の引用情報と、主題の近さから関連文献を並べています。</div>
                    <div style={css("display:flex;gap:9px;flex-wrap:wrap;margin-bottom:14px")}>
                      <span style={css("font-size:11.5px;font-weight:700;color:#1E7A50;background:#E4F3EC;border:1px solid #B7E0C5;padding:6px 12px;border-radius:8px")}>被引用 {citationInfo?.citedByCount ?? "—"} 回</span>
                      <span style={css("font-size:11.5px;font-weight:700;color:#2E5AAC;background:#E9F0FB;border:1px solid #C9D7EC;padding:6px 12px;border-radius:8px")}>参考文献 {citationInfo?.referenceCount ?? "—"} 件</span>
                      {citationBusy && <span style={css("font-size:11.5px;color:#5F6B7C;align-self:center")}>引用情報を取得中…</span>}
                      <button onClick={() => setCiteExpand(!citeExpand)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:5px 11px;border-radius:8px;font:inherit;font-size:11.5px;font-weight:600")}>{citeExpand ? "5件に戻す" : "すべて表示（最大10件）"}</button>
                    </div>
                    {(citationInfo && (citationInfo.citedBy.length > 0 || citationInfo.references.length > 0)) && (
                      <div style={css("margin-bottom:14px;border:1px solid #EEF1F5;border-radius:10px;padding:12px;background:#FAFBFC")}>
                        <div style={css("font-size:11.5px;font-weight:700;color:#5A6678;margin-bottom:8px")}>引用ネットワーク（グラフ）</div>
                        <svg viewBox="0 0 520 250" style={css("width:100%;max-width:520px;display:block;margin:0 auto")}>
                          {citationInfo.citedBy.slice(0, citeExpand ? 10 : 5).map((c: any, i: number) => (
                            <line key={`cb-${i}`} x1={260} y1={125} x2={60 + i * 100} y2={35} stroke="#C9D7EC" strokeWidth="1" />
                          ))}
                          {citationInfo.references.slice(0, citeExpand ? 10 : 5).map((r: any, i: number) => (
                            <line key={`ref-${i}`} x1={260} y1={125} x2={60 + i * 100} y2={215} stroke="#D8DEE7" strokeWidth="1" strokeDasharray="3 3" />
                          ))}
                          <circle cx={260} cy={125} r={26} fill="#B25E0F" />
                          <text x={260} y={129} textAnchor="middle" fill="#fff" fontSize="9" fontWeight="700">この文献</text>
                          {citationInfo.citedBy.slice(0, citeExpand ? 10 : 5).map((c: any, i: number) => {
                            const url = c.doi ? `https://doi.org/${c.doi}` : c.openalexId ? `https://openalex.org/${c.openalexId}` : undefined;
                            return (
                              <g key={`cbn-${i}`} onClick={() => url && window.open(url, "_blank", "noreferrer")} style={{ cursor: "pointer" }}>
                                <circle cx={60 + i * 100} cy={35} r={16} fill="#2E9E6B" />
                                <text x={60 + i * 100} y={61} textAnchor="middle" fill="#1A2433" fontSize="9">{(c.title ?? c.doi ?? "引用").slice(0, 10)}</text>
                              </g>
                            );
                          })}
                          {citationInfo.references.slice(0, citeExpand ? 10 : 5).map((r: any, i: number) => {
                            const url = r.doi ? `https://doi.org/${r.doi}` : undefined;
                            return (
                              <g key={`refn-${i}`} onClick={() => url && window.open(url, "_blank", "noreferrer")} style={{ cursor: "pointer" }}>
                                <circle cx={60 + i * 100} cy={215} r={16} fill="#2E5AAC" />
                                <text x={60 + i * 100} y={241} textAnchor="middle" fill="#1A2433" fontSize="9">{(r.title ?? r.doi ?? "参考").slice(0, 10)}</text>
                              </g>
                            );
                          })}
                        </svg>
                        <div style={css("font-size:10.5px;color:#5F6B7C;margin-top:6px;text-align:center")}>緑＝引用元（Cited by）・青＝参考文献・クリックで原典を開きます</div>
                      </div>
                    )}
                    {(citationInfo?.citedBy.length ?? 0) > 0 && (<>
                      <div style={css("font-size:12px;font-weight:700;color:#5A6678;margin:12px 0 7px")}>引用元（Cited by・最大10件）</div>
                      <div style={css("display:flex;flex-direction:column;gap:6px;margin-bottom:12px")}>
                        {citationInfo?.citedBy.slice(0, citeExpand ? 10 : 5).map((c: any, i: number) => (
                          <a key={i} href={c.doi ? `https://doi.org/${c.doi}` : c.openalexId ? `https://openalex.org/${c.openalexId}` : undefined} target="_blank" rel="noreferrer" style={css("font-size:12px;line-height:1.6;color:#2E5AAC;text-decoration:none")}>・{c.title ?? c.doi ?? "引用文献"}</a>
                        ))}
                      </div>
                    </>)}
                    {(citationInfo?.references.length ?? 0) > 0 && (<>
                      <div style={css("font-size:12px;font-weight:700;color:#5A6678;margin:12px 0 7px")}>参考文献（最大10件）</div>
                      <div style={css("display:flex;flex-direction:column;gap:6px;margin-bottom:12px")}>
                        {citationInfo?.references.slice(0, citeExpand ? 10 : 5).map((r: any, i: number) => (
                          <a key={i} href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer" style={css("font-size:12px;line-height:1.6;color:#2E5AAC;text-decoration:none")}>・{r.title ?? r.doi}</a>
                        ))}
                      </div>
                    </>)}
                    {!citationBusy && citationInfo && citationInfo.citedBy.length === 0 && citationInfo.references.length === 0 && (
                      <div style={css("font-size:11.5px;color:#5F6B7C;margin-bottom:12px")}>引用情報を取得できませんでした（DOI 未設定または外部 API が利用できない場合があります）。</div>
                    )}
                    <div style={css("font-size:12.5px;color:#5A6678;line-height:1.8;margin-bottom:14px")}>類似文献（主題の近さスコア）</div>
                    <div style={css("display:flex;flex-direction:column;gap:9px")}>
                      {(related ).map((rl: any) => (<Fragment key={rl.title}>
                        <button type="button" className="icrps-text-btn" onClick={rl.go} style={css("display:flex;align-items:center;gap:13px;padding:11px 13px;border:1px solid #E3E8EF;border-radius:8px;cursor:pointer;width:100%;background:#fff")}>
                          <span style={css(rl.relStyle )}>{rl.rel}</span>
                          <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:500;line-height:1.6")}>{rl.title}</div><div style={css("font-size:11px;color:#5F6B7C;margin-top:3px;font-family:'IBM Plex Mono',monospace")}>{rl.venue}</div></div>
                          <span style={css("width:64px;height:6px;background:#EEF1F5;border-radius:3px;overflow:hidden;display:block;flex-shrink:0")}><span style={css(rl.barStyle )}></span></span>
                          <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:#5A6678;width:34px;text-align:right")}>{rl.sim}</span>
                        </button>
                      </Fragment>))}
                    </div>
                  </div>
                </>)}

                {(docTabFamily ) && (<>
                  <div style={css("padding:18px 20px 20px")}>
                    <div style={css("font-size:12.5px;color:#5A6678;line-height:1.8;margin-bottom:12px")}>同一発明の同族特許（特許ファミリー）を表示します。Espacenet OPS キー設定時は INPADOC ファミリー、未設定時は保存文献からの同族候補です。</div>
                    {familyBusy && <div style={css("font-size:12px;color:#5F6B7C")}>ファミリー情報を取得中…</div>}
                    {!familyBusy && familyInfo && (
                      <>
                        {familyInfo.note && <div style={css("padding:10px 13px;background:#FDEFE0;border:1px solid #F0D5AF;color:#7A4B10;border-radius:8px;font-size:11.5px;line-height:1.7;margin-bottom:12px")}>{familyInfo.note}</div>}
                        {familyInfo.mode === "ops" && familyInfo.familyId && <div style={css("font-size:11.5px;color:#5F6B7C;margin-bottom:10px")}>INPADOC ファミリー ID: {familyInfo.familyId}</div>}
                        {familyInfo.members.length === 0 && <div style={css("font-size:12px;color:#5F6B7C")}>同族特許が見つかりませんでした。</div>}
                        {familyInfo.members.length > 0 && (
                          <table style={css("border-collapse:collapse;width:100%;font-size:12px")}>
                            <thead>
                              <tr>
                                <th style={css("text-align:left;padding:8px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;font-weight:600;background:#FAFBFC")}>公開番号</th>
                                <th style={css("text-align:left;padding:8px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;font-weight:600;background:#FAFBFC")}>国</th>
                                <th style={css("text-align:left;padding:8px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;font-weight:600;background:#FAFBFC")}>公開日</th>
                                <th style={css("text-align:left;padding:8px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;font-weight:600;background:#FAFBFC")}>タイトル</th>
                                <th style={css("text-align:left;padding:8px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;font-weight:600;background:#FAFBFC")}>出願人</th>
                              </tr>
                            </thead>
                            <tbody>
                              {familyInfo.members.map((m: any) => (
                                <tr key={m.patentNumber}>
                                  <td style={css("padding:8px 10px;border-bottom:1px solid #F2F4F8;font-family:'IBM Plex Mono',monospace")}>{m.patentNumber}</td>
                                  <td style={css("padding:8px 10px;border-bottom:1px solid #F2F4F8")}>{m.country ?? "—"}</td>
                                  <td style={css("padding:8px 10px;border-bottom:1px solid #F2F4F8")}>{m.publicationDate ?? "—"}</td>
                                  <td style={css("padding:8px 10px;border-bottom:1px solid #F2F4F8;line-height:1.6")}>{m.title ?? "—"}</td>
                                  <td style={css("padding:8px 10px;border-bottom:1px solid #F2F4F8")}>{(m.applicants ?? []).join("、") || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </>
                    )}
                    {!familyBusy && !familyInfo && <div style={css("font-size:12px;color:#5F6B7C")}>ファミリー情報を取得できませんでした。</div>}
                  </div>
                </>)}
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <h2 className="icrps-card-title" style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600;margin:0")}>AI 抽出データ</h2>
                <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:11px")}>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#5F6B7C")}>床版抽出 ピクセル精度</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>98.63%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#5F6B7C")}>床版抽出 IoU</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>97.18%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#5F6B7C")}>ひび割れ Dice 係数</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>85.32%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#5F6B7C")}>ひび割れ ピクセル精度</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>95.04%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#5F6B7C")}>モデル</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>DeepLab v3+ / U-Net</span></div>
                  <div style={css("padding-top:10px;border-top:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;line-height:1.7")}>数値は本文 Abstract から抽出。採用前に原典で確認してください。</div>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <h2 className="icrps-card-title" style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600;margin:0")}>この文献に質問する</h2>
                <div style={css("padding:13px 17px;display:flex;flex-direction:column;gap:7px")}>
                  <button onClick={goChat } style={css("text-align:left;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 12px;border-radius:8px;font:inherit;font-size:12px;line-height:1.6")}>実橋への適用条件は？</button>
                  <button onClick={goChat } style={css("text-align:left;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 12px;border-radius:8px;font:inherit;font-size:12px;line-height:1.6")}>学習データの規模と偏りは？</button>
                  <button onClick={goChat } style={css("text-align:left;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 12px;border-radius:8px;font:inherit;font-size:12px;line-height:1.6")}>当社の点検フローに組み込むには？</button>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 17px;display:flex;flex-direction:column;gap:8px")}>
                {saveOpenFor === docId ? savePicker() : (<button onClick={() => startSave(docId)} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>プロジェクトに保存</button>)}
                <button onClick={goCompare } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>比較表に追加</button>
                <button onClick={goWatch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>著者・主題をウォッチ</button>
              </div>
            </div>
          </div>
          </>)}
        </div>
      </>)}

      {/* ===================== 比較表 ===================== */}
      {(isCompare ) && (<>
        <div data-screen-label="05 比較表">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#9A5A0E;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AI</span>
              <div style={css("flex:1")}><h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>比較軸の提案</h2><div style={css("font-size:11.5px;color:#5F6B7C")}>選択した 4 文献の内容から、意味のある比較軸を AI が提案しました。採否を選んでください。</div></div>
            </div>
            <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:8px")}>
              {(axes ).map((ax: any) => (<Fragment key={ax.name}>
                <div style={css("display:flex;align-items:center;gap:12px;padding:10px 13px;border:1px solid #E3E8EF;border-radius:8px")}>
                  <span style={css(ax.markStyle )}>{ax.mark}</span>
                  <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:600")}>{ax.name}</div><div style={css("font-size:11.5px;color:#5F6B7C;margin-top:2px;line-height:1.6")}>{ax.why}</div></div>
                  <button onClick={ax.accept } style={css(ax.acceptStyle )}>採用</button>
                  <button onClick={ax.reject } style={css(ax.rejectStyle )}>却下</button>
                </div>
              </Fragment>))}
              <div style={css("display:flex;gap:9px;align-items:center;margin-top:5px")}>
                <button onClick={buildCompare } style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:9px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>採用 {axesOnCount} 軸で比較表を生成</button>
                <button style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>軸を自分で追加</button>
                <div style={css("flex:1")}></div>
                <span style={css("font-size:11.5px;color:#5F6B7C")}>{compareStatus}</span>
              </div>
            </div>
          </div>

          {(compareBuilt ) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;animation:icrps-in .3s ease both")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                <div style={css("flex:1")}><h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>技術比較表：UAV／画像診断による構造物点検</h2><div style={css("font-size:11.5px;color:#5F6B7C")}>セルは AI 生成。セルをクリックすると根拠箇所と原典リンクが開きます。</div></div>
                <button onClick={exportCompareCsv } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>Excel 出力（CSV）</button>
                <button onClick={goReport } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>レポートへ</button>
              </div>
              <div style={css("overflow-x:auto")}>
                <table style={css("border-collapse:collapse;width:100%;font-size:12.5px;min-width:900px")}>
                  <thead>
                    <tr>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:150px;position:sticky;left:0")}>比較軸</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC")}>{compareHeaders[0]}</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC")}>{compareHeaders[1]}</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC")}>{compareHeaders[2]}</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC")}>{compareHeaders[3]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(compareRows ).map((row: any) => (<Fragment key={row.axis}>
                      <tr>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;font-weight:600;color:#5A6678;background:#FAFBFC;position:sticky;left:0")}>{row.axis}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.a}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.b}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.c}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.d}</td>
                      </tr>
                    </Fragment>))}
                  </tbody>
                </table>
              </div>
              <div style={css("padding:15px 18px;border-top:1px solid #EEF1F5;background:#FAFBFC")}>
                <div style={css("font-size:11px;font-weight:700;color:#9A5A0E;margin-bottom:7px")}>比較の総括（要約・メタデータに基づく）</div>
                <div style={css("font-size:12.5px;line-height:1.9;color:#1A2433")}>{compareSummary}</div>
              </div>
            </div>
          </>)}
        </div>
      </>)}

      {/* ===================== 適用可否チェック ===================== */}
      {(isFit ) && (<>
        <div data-screen-label="06 適用可否チェック">
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;align-items:start")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5")}><h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>設計・施工条件</h2><div style={css("font-size:11.5px;color:#5F6B7C;margin-top:2px")}>条件を入れると、保存文献のタイトル・要旨とキーワード照合します（ルールベース）</div></div>
              <div style={css("padding:16px 18px;display:flex;flex-direction:column;gap:13px")}>
                <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>対象工種</label><select aria-label="対象工種" value={fitInput.workType} onChange={setFitField("workType")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")}><option>橋梁下部工（場所打ち）</option><option>橋梁上部工（PC 桁）</option><option>護岸・防波堤</option><option>トンネル覆工</option></select></div>
                <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>環境区分</label><select aria-label="環境区分" value={fitInput.environment} onChange={setFitField("environment")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")}><option>海洋・飛沫帯</option><option>海洋・海中</option><option>一般外気（凍結防止剤あり）</option><option>一般外気</option></select></div>
                <div style={css("display:flex;gap:10px")}>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>設計基準強度</label><input aria-label="設計基準強度" value={fitInput.designStrength} onChange={setFitField("designStrength")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} /></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>かぶり</label><input aria-label="かぶり" value={fitInput.cover} onChange={setFitField("cover")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} /></div>
                </div>
                <div style={css("display:flex;gap:10px")}>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>設計供用年数</label><input aria-label="設計供用年数" value={fitInput.serviceLife} onChange={setFitField("serviceLife")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} /></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>CO₂ 削減目標</label><input aria-label="CO₂ 削減目標" value={fitInput.co2Target} onChange={setFitField("co2Target")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} /></div>
                </div>
                <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>候補材料・工法</label><input aria-label="候補材料・工法" value={fitInput.candidates} onChange={setFitField("candidates")} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} /></div>
                <button onClick={runFit } disabled={fitBusy} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:10px 15px;border-radius:8px;font:inherit;font-size:13px;font-weight:600;margin-top:4px")}>{fitBusy ? "判定中…" : "適用可否を判定（ルールベース）"}</button>
                {fitError && <div style={css("padding:10px 13px;background:#FCE9E7;border:1px solid #F5B3AD;color:#B5322A;border-radius:8px;font-size:12px;line-height:1.7")}>{fitError}</div>}
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>
              {!fitReady && !fitBusy && !fitError && <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:24px 18px;text-align:center;font-size:12.5px;color:#5F6B7C")}>左の条件を入力して「適用可否を判定」を実行してください。</div>}
              {(fitReady ) && (<>
                {(fitResults ).map((f: any) => (<Fragment key={f.name}>
                  <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;animation:icrps-in .3s ease both")}>
                    <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:11px;flex-wrap:wrap")}>
                      <span style={css(f.verdictStyle )}>{f.verdict}</span>
                      <span style={css("display:flex;align-items:center;gap:6px;margin-left:auto")}><span style={css("font-size:11px;color:#5F6B7C")}>信頼度</span><span style={css("font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:600;color:#5A6678")}>{f.conf}</span></span>
                      <div style={css("flex:1 1 100%;min-width:0")}><div style={css("font-size:14px;font-weight:600;line-height:1.5;text-wrap:pretty")}>{f.name}</div><div style={css("font-size:11.5px;color:#5F6B7C;margin-top:3px;line-height:1.6")}>{f.headline}</div></div>
                    </div>
                    <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:9px")}>
                      {(f.checks ).map((c: any) => (<Fragment key={c.text}>
                        <div style={css("display:flex;gap:11px;align-items:flex-start")}>
                          <span style={css(c.iconStyle )}>{c.icon}</span>
                          <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;line-height:1.75")}>{c.text}</div><div style={css("font-size:11px;color:#5F6B7C;margin-top:3px")}>根拠：<a href={c.url} target="_blank" rel="noreferrer">{c.src} ↗</a></div></div>
                        </div>
                      </Fragment>))}
                    </div>
                  </div>
                </Fragment>))}
              </>)}
              <div style={css("padding:12px 15px;background:#FDEFE0;border-radius:8px;font-size:11.5px;line-height:1.8;color:#7A4B10")}>本チェックは保存文献とのキーワード照合によるルールベース判定です（AI 生成ではありません）。設計判断・施工可否・安全性を保証するものではないため、採用前に必ず原典と示方書を確認し、社内基準に従って専門家の承認を得てください。</div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== レポート生成 ===================== */}
      {(isReport ) && (<>
        <div data-screen-label="07 レポート生成">
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;align-items:start")}>
            <div style={css("display:flex;flex-direction:column;gap:16px")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <h2 className="icrps-card-title" style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;font-size:14px;font-weight:600;margin:0")}>レポート設定</h2>
                <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:13px")}>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>種別</label><select aria-label="レポート種別" value={reportType} onChange={(e) => setReportType(e.target.value)} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")}>{reportTypeOptions.map((o: any) => (<option key={o.value} value={o.value}>{o.label}</option>))}</select></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>タイトル</label><input aria-label="レポートタイトル" value={reportTitle} onChange={setReportTitle} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")} /></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>想定読者</label><select aria-label="想定読者" value={audience} onChange={setAudience} style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%")}><option>技術研究所内（専門家）</option><option>事業部門の技術者</option><option>経営層</option><option>発注者向け提案</option></select></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>引用文献</label><div style={css("font-size:12.5px;color:#5A6678;padding:8px 11px;background:#F2F4F8;border-radius:8px")}>保存文献 {statDocs} 件（生成時に保存済み文献を最大20件参照）</div></div>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}><span style={css("font-size:10px;font-weight:700;color:#9A5A0E;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>AI</span><h2 className="icrps-card-title" style={css("flex:1;font-size:13.5px;font-weight:600;margin:0")}>章立ての提案</h2></div>
                <div style={css("padding:12px 15px;display:flex;flex-direction:column;gap:6px")}>
                  {(outline ).map((o: any) => (<Fragment key={o.no}>
                    <div style={css("display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid #E3E8EF;border-radius:8px")}>
                      <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#5F6B7C;width:16px")}>{o.no}</span>
                      <span style={css("flex:1;font-size:12.5px;line-height:1.5")}>{o.title}</span>
                      <button onClick={o.toggle } style={css(o.style )}>{o.state}</button>
                    </div>
                  </Fragment>))}
                </div>
                <div style={css("padding:0 15px 15px")}><button onClick={genReport } style={css("width:100%;cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:10px 15px;border-radius:8px;font:inherit;font-size:13px;font-weight:600")}>この構成でドラフト生成</button></div>
              </div>
            </div>

            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;min-height:520px;display:flex;flex-direction:column")}>
              <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
                <h2 className="icrps-card-title" style={css("flex:1 1 auto;min-width:150px;font-size:14px;font-weight:600;margin:0")}>ドラフト（Markdown）</h2>
                <span style={css("font-size:11.5px;color:#5F6B7C;font-family:'IBM Plex Mono',monospace;white-space:nowrap")}>{reportStatus}</span>
                <button onClick={toggleReportEdit } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{reportEdit ? "プレビューに戻る" : "編集"}</button>
                <button onClick={exportReportMd } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>.md 出力</button>
                <button onClick={() => exportReportFile("word")} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>Word 出力</button>
                <button onClick={() => exportReportFile("excel")} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>Excel 出力</button>
                <button onClick={exportReportPdf } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>PDF（印刷）</button>
              </div>
              {(reportEdit ) ? (<textarea aria-label="レポート本文（編集）" value={reportText} onChange={(e) => setReportText(e.target.value)} style={css("flex:1;padding:20px 24px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;line-height:2;color:#1A2433;border:none;resize:none;white-space:pre-wrap;overflow:auto")}></textarea>) : (<div style={css("flex:1;padding:20px 24px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;line-height:2;color:#1A2433;white-space:pre-wrap;overflow:auto")}><span data-stream="reportText">{reportText}</span>{(reportBusy ) && (<><span style={css("display:inline-block;width:7px;height:14px;background:#B25E0F;vertical-align:-2px;margin-left:2px;animation:icrps-blink 1s steps(1) infinite")}></span></>)}</div>)}
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== AI アシスタント ===================== */}
      {(isChat ) && (<>
        <div data-screen-label="08 AIアシスタント" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;align-items:start")}>
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;min-height:560px;max-height:calc(100vh - 124px);overflow:hidden")}>
            <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <div style={css("flex:1")}><h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>リサーチアシスタント</h2><div style={css("font-size:11.5px;color:#5F6B7C")}>対象：保存文献 {chatDocCount} 件</div></div>
              <span style={css("font-size:11px;font-weight:600;color:#1E7A50;background:#E4F3EC;padding:3px 9px;border-radius:6px")}>出典付き回答</span>
            </div>

            <div style={css("flex:1;min-height:240px;overflow:auto;padding:20px 22px;display:flex;flex-direction:column;gap:18px")}>
              {(chat ).map((m: any, i: number) => (<Fragment key={`chat-${i}`}>
                <div style={css(m.wrapStyle )}>
                  <div style={css(m.bubbleStyle )}>{m.text}</div>
                  {(m.hasCites ) && (<>
                    <div style={css("display:flex;flex-direction:column;gap:6px;margin-top:10px;max-width:760px")}>
                      <div style={css("font-size:11px;font-weight:700;color:#5F6B7C")}>出典</div>
                      {(m.cites ).map((c: any) => (<Fragment key={c.n}>
                        <a href={c.url} target="_blank" rel="noreferrer" style={css("display:flex;gap:9px;align-items:center;padding:9px 11px;border:1px solid #E3E8EF;border-radius:8px;text-decoration:none")}>
                          <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#9A5A0E;background:#FDEFE0;padding:1px 6px;border-radius:5px;flex-shrink:0")}>{c.n}</span>
                          <span style={css("flex:1;min-width:0;font-size:12px;color:#1A2433;line-height:1.55")}>{c.title}</span>
                          <span style={css("font-size:11px;color:#5F6B7C;flex-shrink:0")}>↗</span>
                        </a>
                      </Fragment>))}
                    </div>
                  </>)}
                </div>
              </Fragment>))}
              {(chatBusy ) && (<>
                <div style={css("display:flex;gap:6px;align-items:center;color:#5F6B7C;font-size:12px")}><span style={css("width:6px;height:6px;border-radius:50%;background:#B25E0F;animation:icrps-pulse 1.1s infinite")}></span>{chatBusyText}</div>
              </>)}
            </div>

            <div style={css("border-top:1px solid #EEF1F5;padding:13px 18px;display:flex;flex-direction:column;gap:9px")}>
              <div style={css("display:flex;gap:7px;flex-wrap:wrap")}>
                {(chatSuggests ).map((s: any) => (<Fragment key={s.label}>
                  <button onClick={s.go } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:11.5px")}>{s.label}</button>
                </Fragment>))}
              </div>
              <div style={css("display:flex;gap:9px;align-items:flex-end")}>
                <textarea aria-label="保存文献への質問" value={chatInput} onChange={setChatInput} rows={1} placeholder="保存文献に対して質問してください（例：室内試験と実構造物試験の結果が食い違う点は？）" style={css("font:inherit;font-size:13px;padding:10px 12px;border:1px solid #E3E8EF;border-radius:8px;width:100%;resize:none;line-height:1.6")}></textarea>
                <button onClick={sendChat } style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:10px 17px;border-radius:8px;font:inherit;font-size:13px;font-weight:600;flex-shrink:0")}>送信</button>
              </div>
              <div style={css("font-size:10.5px;color:#5F6B7C;line-height:1.6")}>回答は保存文献の範囲内で生成され、出典のない主張は表示しません。重要な判断には原典確認を行ってください。</div>
            </div>
          </div>

          <div style={css("display:flex;flex-direction:column;gap:16px")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <h2 className="icrps-card-title" style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600;margin:0")}>参照範囲</h2>
              <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:10px")}>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#5F6B7C")}>論文</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatPaperCount}</span></div>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#5F6B7C")}>特許</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatPatentCount}</span></div>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#5F6B7C")}>技術書・示方書</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatBookCount}</span></div>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#5F6B7C")}>Web</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatWebCount}</span></div>
                <div style={css("padding-top:10px;border-top:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;line-height:1.7")}>参照範囲外の一般知識で答えた場合は、その旨を明示します。</div>
              </div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <h2 className="icrps-card-title" style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600;margin:0")}>この会話から</h2>
              <div style={css("padding:13px 17px;display:flex;flex-direction:column;gap:7px")}>
                <button onClick={goReport } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600;text-align:left")}>レポートの節にする</button>
                <button onClick={goCompare } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600;text-align:left")}>論点を比較軸にする</button>
                <button onClick={goWatch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600;text-align:left")}>この論点をウォッチ登録</button>
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== 更新監視 ===================== */}
      {(isWatch ) && (<>
        <div data-screen-label="09 更新監視">
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:16px;align-items:start")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}>
                <h2 className="icrps-card-title" style={css("flex:1;font-size:14px;font-weight:600;margin:0")}>ウォッチしているテーマ</h2>
                <button onClick={runWatchNow} disabled={watchRunBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600;margin-right:8px")}>{watchRunBusy ? "監視中…" : "今すぐ監視"}</button>
                <button onClick={() => setShowWatchForm(!showWatchForm)} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:6px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>＋ 追加</button>
              </div>
              {(watchRunMsg.text) && (<div style={css("padding:10px 18px;border-bottom:1px solid #EEF1F5;font-size:12px;line-height:1.7;color:" + (watchRunMsg.type === "ok" ? "#1E7A50" : watchRunMsg.type === "error" ? "#B5322A" : "#2E5AAC") + ";background:#FAFBFC")}>{watchRunMsg.text}</div>)}
              {(showWatchForm ) && (<>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;flex-direction:column;gap:10px;background:#FAFBFC")}>
                  <h3 className="icrps-card-title" style={css("font-size:12px;font-weight:700;color:#5A6678;margin:0")}>新しいウォッチテーマ</h3>
                  <input aria-label="テーマ名" value={watchName} onChange={setWatchName} placeholder="テーマ名（例: 低炭素コンクリート（海洋環境））" style={css("font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px")} />
                  <input aria-label="キーワード" value={watchTerms} onChange={setWatchTerms} placeholder="キーワード（例: 低炭素コンクリート / low-carbon / GGBS / splash zone）" style={css("font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px")} />
                  <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                    <select aria-label="監視頻度" value={watchFreq} onChange={setWatchFreq} style={css("font:inherit;font-size:12.5px;padding:6px 10px;border:1px solid #E3E8EF;border-radius:8px")}><option value="daily">毎日</option><option value="weekly">毎週</option><option value="monthly">毎月</option></select>
                    <button onClick={createWatchTopic } style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>登録</button>
                    <button onClick={() => setShowWatchForm(false)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>キャンセル</button>
                  </div>
                  {(watchMsg.text ) && (<div style={css(watchMsgStyle )}>{watchMsg.text}</div>)}
                </div>
              </>)}
              {(topics ).map((t: any) => (<Fragment key={t.name}>
                <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:14px")}>
                  <div style={css("flex:1;min-width:0")}>
                    <div style={css("display:flex;align-items:center;gap:8px;flex-wrap:wrap")}><span style={css("font-size:13px;font-weight:600")}>{t.name}</span>{(t.isNew ) && (<><span style={css("font-size:10.5px;font-weight:700;color:#B5322A;background:#FCE9E7;padding:1px 7px;border-radius:5px")}>新着 {t.newCount}</span></>)}</div>
                    <div style={css("font-size:11.5px;color:#5F6B7C;margin-top:4px;line-height:1.6")}>{t.terms}</div>
                    <div style={css("font-size:11px;color:#5F6B7C;margin-top:5px;font-family:'IBM Plex Mono',monospace")}>{t.meta}</div>
                  </div>
                  <div style={css("display:flex;flex-direction:column;gap:5px;align-items:flex-end")}>
                    <button onClick={t.toggle } style={css(t.style )}>{t.label}</button>
                    <span style={css("font-size:10.5px;color:#5F6B7C")}>{t.freq} · <button type="button" className="icrps-link-btn" onClick={t.remove } style={css("cursor:pointer;color:#B5322A;font-size:inherit")}>削除</button></span>
                  </div>
                </div>
              </Fragment>))}
              <div style={css("padding:15px 18px;background:#FAFBFC")}>
                <div style={css("font-size:11px;font-weight:700;color:#9A5A0E;margin-bottom:7px")}>AI 選別ルール</div>
                <div style={css("font-size:12.5px;line-height:1.9;color:#5A6678")}>2時間ごとの自動監視（systemd timer）が、テーマのキーワード・用語から論文・特許・Web を横断検索し、未通知の新着候補を検知します。初回実行は既存マッチをベースライン登録するため、初回以降の新規分だけが未読通知になります。監視間隔はテーマの頻度（毎日/毎週/毎月）に従います。</div>
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <h2 className="icrps-card-title" style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600;margin:0")}>ダイジェスト配信</h2>
                <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:12px")}>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>配信頻度</span><select value={digestFreq} onChange={setDigestFreq} style={css("font:inherit;font-size:12.5px;padding:6px 10px;border:1px solid #E3E8EF;border-radius:8px;width:auto")}><option>毎朝 6:00</option><option>週 1（月曜）</option><option>即時</option></select></div>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>宛先</span><span style={css("font-size:12px;font-family:'IBM Plex Mono',monospace;color:#5A6678")}>{userOrg}</span></div>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>要約の粒度</span><span style={css("font-size:12px;color:#5A6678")}>短文（3 行）</span></div>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>上限件数</span><span style={css("font-size:12px;font-family:'IBM Plex Mono',monospace;color:#5A6678")}>5 件/回</span></div>
                </div>
              </div>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}>
                  <h2 className="icrps-card-title" style={css("flex:1;font-size:13.5px;font-weight:600;margin:0")}>直近の通知</h2>
                  {unreadCount > 0 && (<button onClick={markAllNotificationsRead} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:5px 11px;border-radius:8px;font:inherit;font-size:11.5px;font-weight:600")}>すべて既読</button>)}
                </div>
                <div style={css("padding:10px 15px;display:flex;flex-direction:column;gap:2px")}>
                  {notifications.length === 0 && (<div style={css("padding:8px 4px;font-size:12px;line-height:1.8;color:#5F6B7C")}>{watchNotices}</div>)}
                  {notifications.map((n: any) => (
                    <div key={n.id} style={css("display:flex;align-items:flex-start;gap:9px;padding:9px 5px;border-bottom:1px solid #F2F4F8")}>
                      <span style={css("width:7px;height:7px;border-radius:50%;flex:none;margin-top:6px;background:" + (n.read ? "#D4DAE2" : "#B5322A") + ";box-shadow:" + (n.read ? "none" : "0 0 0 3px rgba(197,57,47,.14)"))}></span>
                      <div style={css("flex:1;min-width:0")}>
                        <div style={css("font-size:12.5px;font-weight:" + (n.read ? "500" : "600") + ";color:#1A2433;line-height:1.55")}>{n.title}</div>
                        {n.body && <div style={css("font-size:11.5px;color:#5A6678;margin-top:3px;line-height:1.65")}>{n.body}</div>}
                        <div style={css("font-size:10.5px;color:#5F6B7C;margin-top:4px;font-family:'IBM Plex Mono',monospace")}>{n.createdAt.slice(5, 16).replace("T", " ")} · {n.kind === "baseline" ? "ベースライン" : "新着"}</div>
                      </div>
                      <div style={css("display:flex;gap:5px;flex:none;flex-direction:column;align-items:flex-end")}>
                        {n.url && n.url !== "#" && <a href={n.url} target="_blank" rel="noreferrer" style={css("font-size:11px;font-weight:600;color:#2E5AAC")}>出典 ↗</a>}
                        {n.markRead && <button onClick={n.markRead} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:11px;color:#5F6B7C;padding:0")}>既読にする</button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== プロジェクト ===================== */}
      {(isProjects ) && (<>
        <div data-screen-label="10 プロジェクト">
          <div style={css("display:flex;gap:9px;align-items:center;margin-bottom:14px;flex-wrap:wrap")}>
            <button onClick={() => setShowNewProject(!showNewProject)} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>＋ 新規プロジェクト</button>
            <button onClick={() => setProjectFilter("すべて")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "すべて" ? "#B25E0F" : "#E3E8EF") + ";background:" + (projectFilter === "すべて" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "すべて" ? "#9A5A0E" : "#5A6678") + ";cursor:pointer")}>すべて</button>
            <button onClick={() => setProjectFilter("進行中")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "進行中" ? "#B25E0F" : "#E3E8EF") + ";background:" + (projectFilter === "進行中" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "進行中" ? "#9A5A0E" : "#5A6678") + ";cursor:pointer")}>進行中 {projectStatusCounts["進行中"]}</button>
            <button onClick={() => setProjectFilter("報告済")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "報告済" ? "#B25E0F" : "#E3E8EF") + ";background:" + (projectFilter === "報告済" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "報告済" ? "#9A5A0E" : "#5A6678") + ";cursor:pointer")}>報告済 {projectStatusCounts["報告済"]}</button>
            <button onClick={() => setProjectFilter("アーカイブ")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "アーカイブ" ? "#B25E0F" : "#E3E8EF") + ";background:" + (projectFilter === "アーカイブ" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "アーカイブ" ? "#9A5A0E" : "#5A6678") + ";cursor:pointer")}>アーカイブ {projectStatusCounts["アーカイブ"]}</button>
          </div>
          {(showNewProject ) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:14px;display:flex;gap:9px;align-items:center;flex-wrap:wrap")}>
              <input aria-label="新しい調査テーマの名前" value={newProjectTitle} onChange={setNewProjectTitle} placeholder="新しい調査テーマの名前" style={css("flex:1;min-width:220px;font:inherit;font-size:13px;padding:9px 12px;border:1px solid #E3E8EF;border-radius:8px")} />
              <button onClick={createProject } style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>作成</button>
              <button onClick={() => setShowNewProject(false)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>キャンセル</button>
              {(projectMsg ) && (<span style={css("font-size:12px;font-weight:600;color:" + (projectMsg.type === "ok" ? "#1E7A50" : "#B5322A") + ")")}>{projectMsg.text}</span>)}
            </div>
          </>)}
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
            <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:22px;height:22px;border-radius:6px;background:#EDE7F6;color:#6B45B0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>👥</span>
              <h2 className="icrps-card-title" style={css("flex:1;font-size:13.5px;font-weight:600;margin:0")}>チーム共有・メンバー管理</h2>
              <span style={css("font-size:11px;color:#5F6B7C")}>viewer=閲覧 / editor=編集 / admin=管理</span>
            </div>
            <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:12px")}>
              <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>対象プロジェクト</span>
                <select aria-label="対象プロジェクト" value={memberProjectId} onChange={onSelectMemberProject} style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff;min-width:240px")}>
                  {projects.map((p: any) => (<option key={p.id} value={p.id}>{p.title}</option>))}
                </select>
              </div>
              <div style={css("display:flex;flex-direction:column;gap:5px")}>
                <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>メンバー</span>
                {(projectMembers[memberProjectId] ?? []).length === 0 && <span style={css("font-size:12px;color:#5F6B7C")}>共有メンバーはいません（オーナーのみ）。メールアドレスで追加できます。</span>}
                {(projectMembers[memberProjectId] ?? []).map((m: any) => (
                  <div key={m.id} style={css("display:flex;align-items:center;gap:10px;padding:8px 11px;border:1px solid #EEF1F5;border-radius:8px;background:#FAFBFC")}>
                    <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:600;color:#1A2433")}>{m.user?.name ?? "ユーザー"}</div><div style={css("font-size:11px;color:#5F6B7C;font-family:'IBM Plex Mono',monospace")}>{m.user?.email ?? ""}</div></div>
                    <select aria-label="メンバーのロール変更" value={m.role} onChange={(e) => changeProjectMemberRole(memberProjectId, m.userId, e.target.value)} style={css("font:inherit;font-size:12px;padding:5px 8px;border:1px solid #E3E8EF;border-radius:7px;background:#fff")}>
                      <option value="viewer">閲覧</option><option value="editor">編集</option><option value="admin">管理</option>
                    </select>
                    <button onClick={() => removeProjectMember(memberProjectId, m.userId)} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:11px;color:#B5322A")}>削除</button>
                  </div>
                ))}
              </div>
              <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap;border-top:1px solid #EEF1F5;padding-top:11px")}>
                <input aria-label="追加するユーザーのメールアドレス" value={memberEmail} onChange={setMemberEmail} placeholder="追加するユーザーのメールアドレス" style={css("flex:1;min-width:220px;font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px")} />
                <select aria-label="追加メンバーのロール" value={memberRole} onChange={setMemberRole} style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff")}>
                  <option value="viewer">閲覧</option><option value="editor">編集</option><option value="admin">管理</option>
                </select>
                <button onClick={addProjectMember} disabled={memberBusy} style={css("cursor:pointer;border:1px solid #6B45B0;background:#6B45B0;color:#fff;padding:8px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>{memberBusy ? "追加中…" : "メンバーを追加"}</button>
                {memberMsg && <span style={css("font-size:12px;font-weight:600;color:" + (memberMsg.type === "ok" ? "#1E7A50" : "#B5322A") + ")")}>{memberMsg.text}</span>}
              </div>
              <div style={css("border-top:1px solid #EEF1F5;padding-top:12px;display:flex;flex-direction:column;gap:10px")}>
                <h3 className="icrps-card-title" style={css("font-size:12px;font-weight:700;color:#5A6678;margin:0")}>組織（チーム）管理</h3>
                <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                  <select aria-label="チーム選択" value={selectedTeamId} onChange={setSelectedTeamId} style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff;min-width:200px")}>
                    <option value="">チームを選択</option>
                    {teams.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                  <input aria-label="新しいチーム名" value={teamName} onChange={setTeamName} placeholder="新しいチーム名" style={css("flex:1;min-width:160px;font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px")} />
                  <button onClick={createTeam} disabled={teamBusy} style={css("cursor:pointer;border:1px solid #2E5AAC;background:#2E5AAC;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{teamBusy ? "処理中…" : "チーム作成"}</button>
                </div>
                {teamStats && selectedTeamId && (
                  <div style={css("display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:#5A6678")}>
                    <span>プロジェクト <b>{teamStats.projectCount}</b></span>
                    <span>メンバー <b>{teamStats.memberCount}</b></span>
                    <span>保存文献 <b>{teamStats.documentCount}</b></span>
                    <span>レポート <b>{teamStats.reportCount}</b></span>
                    <span>比較表 <b>{teamStats.comparisonCount}</b></span>
                  </div>
                )}
                {selectedTeamId && (<div style={css("display:flex;flex-direction:column;gap:5px")}>
                  {(teamMembers[selectedTeamId] ?? []).map((m: any) => (
                    <div key={m.id} style={css("display:flex;align-items:center;gap:10px;padding:7px 10px;border:1px solid #EEF1F5;border-radius:8px;background:#FAFBFC")}>
                      <div style={css("flex:1;min-width:0")}><span style={css("font-size:12.5px;font-weight:600")}>{m.user?.name ?? "ユーザー"}</span><span style={css("font-size:11px;color:#5F6B7C;margin-left:8px;font-family:'IBM Plex Mono',monospace")}>{m.user?.email ?? ""}</span></div>
                      <select aria-label="チームメンバーのロール変更" value={m.role} onChange={(e) => changeTeamMemberRole(selectedTeamId, m.userId, e.target.value)} style={css("font:inherit;font-size:12px;padding:4px 8px;border:1px solid #E3E8EF;border-radius:7px;background:#fff")}>
                        <option value="viewer">閲覧</option><option value="editor">編集</option><option value="admin">管理</option>
                      </select>
                      <button onClick={() => removeTeamMember(selectedTeamId, m.userId)} style={css("cursor:pointer;border:none;background:none;font:inherit;font-size:11px;color:#B5322A")}>削除</button>
                    </div>
                  ))}
                  <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                    <input aria-label="チームメンバーのメールアドレス" value={teamMemberEmail} onChange={setTeamMemberEmail} placeholder="チームメンバーのメールアドレス" style={css("flex:1;min-width:180px;font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px")} />
                    <select aria-label="追加チームメンバーのロール" value={teamMemberRole} onChange={setTeamMemberRole} style={css("font:inherit;font-size:12px;padding:6px 9px;border:1px solid #E3E8EF;border-radius:7px;background:#fff")}>
                      <option value="viewer">閲覧</option><option value="editor">編集</option><option value="admin">管理</option>
                    </select>
                    <button onClick={addTeamMember} disabled={teamBusy} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>追加</button>
                  </div>
                </div>)}
                <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                  <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>プロジェクトをチームに割当</span>
                  <select aria-label="プロジェクトをチームに割当" value={projectTeamId} onChange={setProjectTeamId} style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;background:#fff;min-width:180px")}>
                    <option value="">チームなし</option>
                    {teams.map((t: any) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                  <button onClick={assignProjectTeam} disabled={teamBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>割当を更新</button>
                </div>
                {teamMsg && <span style={css("font-size:12px;font-weight:600;color:" + (teamMsg.type === "ok" ? "#1E7A50" : "#B5322A") + ")")}>{teamMsg.text}</span>}
              </div>
              {isOwnerOfSelected && (<div style={css("border-top:1px solid #EEF1F5;padding-top:12px;display:flex;flex-direction:column;gap:8px")}>
                <h3 className="icrps-card-title" style={css("font-size:12px;font-weight:700;color:#5A6678;margin:0")}>オーナー移譲（自分は admin メンバーとして残ります）</h3>
                <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                  <input aria-label="移譲先ユーザーのメールアドレス" value={transferEmail} onChange={setTransferEmail} placeholder="移譲先ユーザーのメールアドレス" style={css("flex:1;min-width:220px;font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px")} />
                  <button onClick={transferOwnership} disabled={transferBusy} style={css("cursor:pointer;border:1px solid #B5322A;background:#FCE9E7;color:#B5322A;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{transferBusy ? "移譲中…" : "オーナーを移譲"}</button>
                </div>
                {transferMsg && <span style={css("font-size:12px;font-weight:600;color:" + (transferMsg.type === "ok" ? "#1E7A50" : "#B5322A") + ")")}>{transferMsg.text}</span>}
              </div>)}
            </div>
          </div>
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
            <table style={css("border-collapse:collapse;width:100%;font-size:12.5px")}>
              <thead><tr>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC")}>プロジェクト</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:190px")}>タグ</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:96px")}>文献</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:150px")}>AI 進捗</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:88px")}>状態</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:96px")}>更新</th>
              </tr></thead>
              <tbody>
                {(projects ).map((p: any) => (<Fragment key={p.title}>
                  <tr onClick={p.go } style={css("cursor:pointer")}>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><div style={css("font-weight:500;color:#1A2433;line-height:1.5")}>{p.title}</div><div style={css("font-size:11px;color:#5F6B7C;margin-top:3px")}>{p.owner}</div></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><span style={css("font-family:'IBM Plex Mono',monospace;background:#F2F4F8;color:#5A6678;border-radius:5px;padding:2px 7px;font-size:11px")}>{p.tag1}</span> <span style={css("font-family:'IBM Plex Mono',monospace;background:#F2F4F8;color:#5A6678;border-radius:5px;padding:2px 7px;font-size:11px")}>{p.tag2}</span></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5;font-family:'IBM Plex Mono',monospace")}>{p.docs}</td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><span style={css("display:block;height:6px;background:#EEF1F5;border-radius:3px;overflow:hidden")}><span style={css(p.barStyle )}></span></span><span style={css("font-size:10.5px;color:#5F6B7C;display:block;margin-top:4px")}>{p.progressLabel}</span></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><span style={css(p.statusStyle )}>{p.status}</span></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5;color:#5F6B7C")}>{p.updated}</td>
                  </tr>
                </Fragment>))}
              </tbody>
            </table>
          </div>
        </div>
      </>)}

      {/* ===================== 管理・監査ログ ===================== */}
      {(adminAccessDenied ) && (<>
        <div data-screen-label="11b 管理・監査ログ（権限なし）" style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:28px 22px;text-align:center")}>
          <div style={css("font-size:13px;font-weight:600;color:#1A2433;margin-bottom:6px")}>管理・監査ログは管理者権限が必要です</div>
          <div style={css("font-size:12px;color:#5F6B7C")}>管理者アカウントでログインすると、ユーザー管理・監査ログ・システム設定を利用できます。</div>
        </div>
      </>)}
      {(isAdmin ) && (<>
        <div data-screen-label="11 管理・監査ログ">
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:16px")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>利用ユーザー</span><span style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums")}>{adminTotalUsers}</span><span style={css("font-size:11px;color:#5A6678")}>admin {adminAdmins} · user {Math.max(0, adminTotalUsers - adminAdmins)}</span></div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>DB 文献数</span><span style={css("font-size:18px;font-weight:600;line-height:1.2;font-variant-numeric:tabular-nums;color:#5A6678")}>{adminCostLabel}</span><span style={css("font-size:11px;color:#5A6678")}>{adminCostSub}</span></div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>AI プロバイダ</span><span style={css("font-size:18px;font-weight:600;line-height:1.2;font-variant-numeric:tabular-nums;color:#5A6678")}>{adminConnectorLabel}</span><span style={css("font-size:11px;color:#9A5A0E")}>システム設定から変更可能</span></div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#5F6B7C;font-weight:500")}>ウォッチ・収集</span><span style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;color:#5F6B7C")}>{adminRejectLabel}</span><span style={css("font-size:11px;color:#5A6678")}>{adminRejectSub}</span></div>
          </div>

          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}>
              <h2 className="icrps-card-title" style={css("flex:1;font-size:14px;font-weight:600;margin:0")}>LLM 使用量（直近30日）</h2>
              <span style={css("font-size:11.5px;color:#5F6B7C")}>コストは概算（モデル別レート）</span>
            </div>
            <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:10px")}>
              {!llmUsage && <span style={css("font-size:12px;color:#5F6B7C")}>使用量データがありません（LLM 呼び出しがまだ無いか、トークン情報が返っていません）。</span>}
              {llmUsage && (<>
                <div style={css("display:flex;gap:14px;flex-wrap:wrap")}>
                  <span style={css("font-size:12px;font-weight:700;color:#1A2433")}>呼び出し {llmUsage.totalCalls} 回</span>
                  <span style={css("font-size:12px;font-weight:700;color:#1A2433")}>入力トークン {llmUsage.totalInputTokens.toLocaleString()}</span>
                  <span style={css("font-size:12px;font-weight:700;color:#1A2433")}>出力トークン {llmUsage.totalOutputTokens.toLocaleString()}</span>
                  <span style={css("font-size:12px;font-weight:700;color:#9A5A0E")}>概算コスト ${llmUsage.totalCost.toFixed(4)}</span>
                </div>
                <table style={css("border-collapse:collapse;width:100%;font-size:12px")}>
                  <thead><tr>
                    <th style={css("text-align:left;padding:7px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;background:#FAFBFC")}>モデル</th>
                    <th style={css("text-align:left;padding:7px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;background:#FAFBFC")}>呼び出し</th>
                    <th style={css("text-align:left;padding:7px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;background:#FAFBFC")}>入力トークン</th>
                    <th style={css("text-align:left;padding:7px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;background:#FAFBFC")}>出力トークン</th>
                    <th style={css("text-align:left;padding:7px 10px;border-bottom:1px solid #EEF1F5;color:#5F6B7C;font-size:11px;background:#FAFBFC")}>概算コスト</th>
                  </tr></thead>
                  <tbody>
                    {llmUsage.byModel.map((m: any) => (
                      <tr key={m.model}>
                        <td style={css("padding:7px 10px;border-bottom:1px solid #F2F4F8;font-family:'IBM Plex Mono',monospace")}>{m.provider} / {m.model}</td>
                        <td style={css("padding:7px 10px;border-bottom:1px solid #F2F4F8")}>{m.calls}</td>
                        <td style={css("padding:7px 10px;border-bottom:1px solid #F2F4F8")}>{m.inputTokens.toLocaleString()}</td>
                        <td style={css("padding:7px 10px;border-bottom:1px solid #F2F4F8")}>{m.outputTokens.toLocaleString()}</td>
                        <td style={css("padding:7px 10px;border-bottom:1px solid #F2F4F8")}>${m.cost.toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>)}
            </div>
          </div>

          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><h2 className="icrps-card-title" style={css("flex:1;font-size:14px;font-weight:600;margin:0")}>監査ログ</h2><span style={css("font-size:11.5px;color:#5F6B7C")}>AI 操作は入力・モデル・信頼度まで記録</span></div>
            <table style={css("border-collapse:collapse;width:100%;font-size:12.5px")}>
              <thead><tr>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:150px")}>日時</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:130px")}>ユーザー</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC;width:150px")}>操作</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#5F6B7C;font-weight:600;background:#FAFBFC")}>対象・詳細</th>
              </tr></thead>
              <tbody>
                {(audit ).map((a: any) => (<Fragment key={`${a.at}-${a.user}-${a.act}`}>
                  <tr>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5;font-family:'IBM Plex Mono',monospace;color:#5F6B7C")}>{a.at}</td>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5")}>{a.user}</td>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5")}><span style={css(a.actStyle )}>{a.act}</span></td>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5;color:#5A6678;line-height:1.6")}>{a.detail}</td>
                  </tr>
                </Fragment>))}
              </tbody>
            </table>
          </div>
        </div>
      </>)}

      {(showDisclaimer ) && (<>
        <div style={css("margin-top:22px;padding:12px 15px;border-left:3px solid #B25E0F;background:#fff;border-radius:0 8px 8px 0;font-size:11.5px;line-height:1.8;color:#5A6678")}>
          本システムの AI 要約・比較・判定結果は、公開情報に基づく<b>調査支援情報</b>です。特許の権利判断、設計判断、施工可否、安全性判断を保証するものではありません。重要な判断には、原典確認および専門家確認を行ってください。
        </div>
      </>)}

      {/* ===================== システム設定 ===================== */}
      {(isSettings ) && (<>
        <div data-screen-label="12 システム設定">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px")}>
            <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#9A5A0E;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>⚙</span>
            <div style={css("flex:1")}>
              <h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>AI プロバイダ設定</h2>
              <div style={css("font-size:11.5px;color:#5F6B7C")}>
                アクティブ: {settingsActiveProvider ?? "未設定（ルール応答）"} · DeepSeek {settingsDeepSeekConfigured ? "設定済み" : "未設定"} · Anthropic {settingsAnthropicConfigured ? "設定済み" : "未設定"}
              </div>
            </div>
          </div>

          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:22px;height:22px;border-radius:6px;background:#E4F3EC;color:#1E7A50;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>🔑</span>
              <div style={css("flex:1")}><h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>パスワード変更</h2><div style={css("font-size:11.5px;color:#5F6B7C")}>現在のパスワードを確認したうえで、新しいパスワード（8 文字以上）に変更します</div></div>
            </div>
            <div style={css("padding:15px 18px;display:flex;gap:11px;flex-wrap:wrap;align-items:flex-end")}>
              <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px;flex:1;min-width:180px")}>現在のパスワード
                <input type="password" value={pwdCurrent} onChange={setPwdCurrent} autoComplete="current-password" style={css("font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;color:#1A2433")} />
              </label>
              <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:flex;flex-direction:column;gap:5px;flex:1;min-width:180px")}>新しいパスワード
                <input type="password" value={pwdNew} onChange={setPwdNew} autoComplete="new-password" style={css("font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;color:#1A2433")} />
              </label>
              <button onClick={changePassword} disabled={pwdBusy} style={css("cursor:pointer;border:1px solid #1E7A50;background:#1E7A50;color:#fff;padding:8px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>{pwdBusy ? "変更中…" : "パスワードを変更"}</button>
              {(pwdMsg.text) && <div style={css("flex-basis:100%")}><div style={css(pwdMsgStyle)}>{pwdMsg.text}</div></div>}
            </div>
          </div>

          {(settingsAccessDenied ) ? (<div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:28px 22px;text-align:center")}>
            <div style={css("font-size:13px;font-weight:600;color:#1A2433;margin-bottom:6px")}>システム設定は管理者権限が必要です</div>
            <div style={css("font-size:12px;color:#5F6B7C")}>パスワード変更は上記のカードで利用できます。管理者アカウントでログインすると、DeepSeek / Anthropic の API キー設定・テスト・保存と文献データ連携の管理が利用できます。</div>
          </div>) : (<>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:16px;align-items:start")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                <span style={css("width:30px;height:30px;border-radius:8px;background:#141C29;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>DS</span>
                <div style={css("flex:1")}>
                  <h3 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>DeepSeek（OpenAI 互換）</h3>
                  <div style={css("font-size:11.5px;color:#5F6B7C")}>ステータス: {settingsDeepSeekConfigured ? "設定済み" : "未設定"} · モデル {dsModel}</div>
                </div>
              </div>
              <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:11px")}>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  API キー
                  <input type="password" value={dsKey} onChange={setDsKey} placeholder="sk-…（保存済みキーは表示されません）" autoComplete="off" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  モデル名
                  <input value={dsModel} onChange={setDsModel} placeholder="deepseek-chat" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433")} />
                </label>
                <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                  <button onClick={testDeepSeek} disabled={dsBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{dsBusy ? "テスト中…" : "設定テスト"}</button>
                  <button onClick={saveDeepSeek} disabled={dsBusy} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定保存</button>
                  <button onClick={clearDsInput} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>入力クリア</button>
                  <button onClick={clearDeepSeek} style={css("cursor:pointer;border:1px solid #F5B3AD;background:#FCE9E7;color:#B5322A;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定クリア</button>
                </div>
                {(dsMsg.text ) && (<div style={css(dsMsgStyle )}>{dsMsg.text}</div>)}
              </div>
            </div>

            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                <span style={css("width:30px;height:30px;border-radius:8px;background:#9A5A0E;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AN</span>
                <div style={css("flex:1")}>
                  <h3 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>Anthropic（Claude）</h3>
                  <div style={css("font-size:11.5px;color:#5F6B7C")}>ステータス: {settingsAnthropicConfigured ? "設定済み" : "未設定"} · モデル {anModel}</div>
                </div>
              </div>
              <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:11px")}>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  API キー
                  <input type="password" value={anKey} onChange={setAnKey} placeholder="sk-ant-…（保存済みキーは表示されません）" autoComplete="off" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  モデル名
                  <input value={anModel} onChange={setAnModel} placeholder="claude-sonnet-4-5" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433")} />
                </label>
                <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                  <button onClick={testAnthropic} disabled={anBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{anBusy ? "テスト中…" : "設定テスト"}</button>
                  <button onClick={saveAnthropic} disabled={anBusy} style={css("cursor:pointer;border:1px solid #B25E0F;background:#B25E0F;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定保存</button>
                  <button onClick={clearAnInput} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>入力クリア</button>
                  <button onClick={clearAnthropic} style={css("cursor:pointer;border:1px solid #F5B3AD;background:#FCE9E7;color:#B5322A;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定クリア</button>
                </div>
                {(anMsg.text ) && (<div style={css(anMsgStyle )}>{anMsg.text}</div>)}
              </div>
            </div>
          </div>

          <div style={css("margin-top:16px;background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:30px;height:30px;border-radius:8px;background:#2E5AAC;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700")}>📚</span>
              <div style={css("flex:1")}>
                <h2 className="icrps-card-title" style={css("font-size:14px;font-weight:600;margin:0")}>文献データ連携（土木建設技術）</h2>
                <div style={css("font-size:11.5px;color:#5F6B7C")}>J-STAGE / 土木研究所 / ITC Digital Library / 国交省 / 関東地整 ・ 2時間ごとに自動取得（cron 相当）</div>
              </div>
              <button onClick={runIngestNow} disabled={ingestBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{ingestBusy ? "収集中…" : "今すぐ取得"}</button>
            </div>
            <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:8px")}>
              {(ingestRuns ?? []).length === 0 && (<div style={css("font-size:12px;color:#5F6B7C")}>実行履歴はまだありません。「今すぐ取得」または2時間ごとの自動実行で記録されます。</div>)}
              {(ingestRuns ?? []).slice(0, 10).map((run: { id: string; createdAt: string; detail: Record<string, unknown> | null }) => {
                const d = (run.detail ?? {}) as Record<string, unknown>;
                const t = new Date(run.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={run.id} style={css("display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #EEF1F5;border-radius:8px;background:#FAFBFC")}>
                    <span style={css("width:8px;height:8px;border-radius:50%;flex:none;background:" + (d.status === "error" ? "#B5322A" : "#1E7A50"))} />
                    <span style={css("flex:1;font-size:12px;font-weight:600;color:#1A2433")}>{String(d.source ?? "")}</span>
                    <span style={css("font-size:11px;color:#5A6678")}>取得 {String(d.fetched ?? 0)} ・ 新規 {String(d.inserted ?? 0)} ・ 重複 {String(d.skipped ?? 0)}</span>
                    <span style={css("font-size:11px;color:#5F6B7C")}>{t}</span>
                  </div>
                );
              })}
            </div>
            <div style={css("padding:0 18px 15px")}>
              {(ingestMsg?.text) && (<div style={css("margin-bottom:10px;padding:10px 13px;background:#E9F0FB;border:1px solid #C9D7EC;color:#2E5AAC;border-radius:8px;font-size:12px;line-height:1.7")}>{ingestMsg.text}</div>)}
              <div style={css("padding:10px 13px;background:#F7F8FA;border:1px solid #EEF1F5;border-radius:8px;font-size:11.5px;line-height:1.8;color:#5A6678")}>
                <b>運用：</b>取得データはメタデータ（タイトル・著者・要旨・DOI/URL）のみで、本文・PDFは保存しません。取得失敗時は監査ログに記録され、次回実行で自動リトライします。確実な手動実行はサーバー上で <code>sudo systemctl start icrps-ingest.service</code> をご利用ください（Cloudflare 経由の手動実行はタイムアウトする場合があります）。
              </div>
            </div>
          </div>

          <div style={css("margin-top:16px;padding:12px 15px;border-left:3px solid #B25E0F;background:#fff;border-radius:0 8px 8px 0;font-size:11.5px;line-height:1.8;color:#5A6678")}>
            <b>セキュリティ：</b>API キーは AES-256-GCM で暗号化して保存され、画面・ログ・監査ログに出力されません。「設定テスト」は接続確認のみで保存は行いません。「入力クリア」は入力欄のみ、「設定クリア」は保存済みキーを削除します。
          </div>
          </>)}
        </div>
      </>)}

      <footer className="icrps-footer" role="contentinfo">
        ICRPS 国際土木技術・論文・特許リサーチ支援システム
      </footer>
    </main>
  </div>
</div>


    </>
  );
}
