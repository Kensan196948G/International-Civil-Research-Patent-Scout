/* eslint-disable @typescript-eslint/no-explicit-any */
// 生成ファイル: ICRPS WebUI (standalone).html のテンプレートを機械変換した React ビュー
// 元テンプレートとの差分を保つため、手動編集は最小限にする
import { css } from "../lib/css";

export function StandaloneView({ v }: { v: any }) {
  const {
    showDisclaimer, navGroups, pageTitle, pageSub,
    isDashboard, isFeed, isSearch, isDoc, isCompare, isFit, isReport, isChat, isWatch, isProjects, isAdmin,
    goFeed, goSearch, goChat, goWatch, goProjects, goCompare, goReport,
    digestText, digestBusy, regenDigest,
    domainChips, typeChips, feed, feedCount,
    q, setQ, runSearch, searchStatus, hasSteps, steps, termsReady, terms,
    resultsReady, results, resultCount, hasCompare, compareCount, toggleQueryEdit, acceptSuggest, dismissSuggest, suggestDismissed,
    docTitle, docSub, enBtnLabel, enBtnStyle, toggleEn, docTabs, docTabSummary, docTabAbstract, docTabClaims, docTabCite,
    sumLevels, sumText, sumBusy, regenSum, abstractEn, abstractJa, related,
    axes, axesOnCount, buildCompare, compareBuilt, compareStatus, compareRows,
    outline, genReport, reportText, reportBusy, reportStatus, setReportText, reportEdit, setReportEdit, toggleReportEdit, exportReportMd,
    chat, chatBusy, chatInput, setChatInput, chatSuggests, sendChat,
    topics, projects, audit, fitReady, fitResults, runFit,
    aiEngineNote, userInitial, userName, userOrg, roleLabel,
    statProjects, statProjectsSub, statDocs, statDocsSub, statReports, statReportsSub, statWatch, statWatchSub,
    digestMeta, docVenue, docDoi, docSource, docUrl, docUrlHost, docTypeLabel, docDomain, compareHeaders,
    isSettings, settingsDeepSeekConfigured, settingsAnthropicConfigured, settingsActiveProvider,
    dsKey, setDsKey, dsModel, setDsModel, anKey, setAnKey, anModel, setAnModel,
    dsMsg, anMsg, dsMsgStyle, anMsgStyle, dsBusy, anBusy,
    testDeepSeek, saveDeepSeek, clearDeepSeek, clearDsInput,
    testAnthropic, saveAnthropic, clearAnthropic, clearAnInput, settingsAccessDenied,
    ingestRuns, ingestBusy, ingestMsg, runIngestNow,
    trendRows, alertRows, recentProjectRows, projectStatusCounts, projectFilter, setProjectFilter,
    newProjectTitle, setNewProjectTitle, showNewProject, setShowNewProject, createProject, projectMsg,
    watchName, setWatchName, watchTerms, setWatchTerms, watchFreq, setWatchFreq,
    showWatchForm, setShowWatchForm, createWatchTopic, watchMsg, watchMsgStyle, watchNotices,
    digestFreq, setDigestFreq, chatPaperCount, chatPatentCount, chatBookCount, chatDocCount, chatBusyText,
    docActionMsg, adoptSummary, discardSummary, editSummary,
    claimsNote, claimsText,
    exportCompareCsv, compareSummary, adminTotalUsers, adminAdmins, adminCostLabel,
    adminConnectorLabel, adminRejectLabel, adminAccessDenied
  } = v as Record<string, any>;
  return (
    <>



<div style={css("display:flex;height:100vh;width:100%;overflow:hidden;background:#EEF1F5")}>

  <aside style={css("width:252px;flex-shrink:0;background:#fff;border-right:1px solid #E3E8EF;display:flex;flex-direction:column;color:#5A6678")}>
    <div style={css("padding:18px 18px 16px;display:flex;align-items:center;gap:11px;border-bottom:1px solid #EEF1F5")}>
      <span style={css("width:34px;height:34px;border-radius:8px;background:#E08A2B;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff")}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M5 21V7l8-4v18"></path><path d="M19 21V11l-6-4"></path></svg>
      </span>
      <div style={css("line-height:1.2")}>
        <div style={css("color:#1A2433;font-weight:600;font-size:14.5px;letter-spacing:.2px")}>ICRPS</div>
        <div style={css("font-size:11px;color:#8A97A8")}>土木技術リサーチ基盤</div>
      </div>
    </div>

    <nav style={css("flex:1;overflow-y:auto;padding:10px 12px 14px;display:flex;flex-direction:column;gap:1px")}>
      {(navGroups ).map((group: any) => (<>
        <div style={css("padding:13px 8px 6px;font-size:10px;letter-spacing:1px;color:#A2AEBC;font-weight:600")}>{group.label}</div>
        {(group.items ).map((item: any) => (<>
          <a onClick={item.go } style={css("position:relative;display:flex;align-items:center;gap:10px;padding:8px 11px;border-radius:7px;font-size:13px;font-weight:500;text-decoration:none;color:#5A6678;cursor:pointer")}>
            {(item.active ) && (<>
              <span style={css("position:absolute;inset:0;background:#FDEFE0;border-radius:7px")}></span>
              <span style={css("position:absolute;left:0;top:8px;bottom:8px;width:3px;border-radius:2px;background:#E08A2B")}></span>
            </>)}
            <span style={css("position:relative;width:18px;text-align:center;flex-shrink:0;font-size:13px")}>{item.ico}</span>
            <span style={css("position:relative;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{item.label}</span>
            {(item.badge ) && (<>
              <span style={css("position:relative;font-family:'IBM Plex Mono',monospace;font-size:10.5px;padding:1px 6px;border-radius:9px;background:#F2F4F8;color:#5A6678")}>{item.badge}</span>
            </>)}
          </a>
        </>))}
      </>))}
    </nav>

    <div style={css("padding:11px 14px;border-top:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}>
      <span style={css("width:7px;height:7px;border-radius:50%;background:#2E9E6B;box-shadow:0 0 0 3px rgba(46,158,107,.18);flex-shrink:0")}></span>
      <div style={css("flex:1;line-height:1.3")}>
        <div style={css("font-size:11.5px;color:#1A2433;font-weight:500")}>AI エンジン稼働中</div>
        <div style={css("font-size:10.5px;color:#8A97A8;font-family:'IBM Plex Mono',monospace")}>{aiEngineNote}</div>
      </div>
    </div>

    <div style={css("padding:13px 14px;border-top:1px solid #EEF1F5;display:flex;align-items:center;gap:11px")}>
      <span style={css("width:34px;height:34px;border-radius:50%;background:#EEF1F5;color:#5A6678;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;flex-shrink:0")}>{userInitial}</span>
      <div style={css("flex:1;line-height:1.25")}>
        <div style={css("color:#1A2433;font-size:13px;font-weight:500")}>{userName}</div>
        <div style={css("font-size:11px;color:#8A97A8")}>{userOrg}</div>
      </div>
      <span style={css("font-size:10px;font-weight:600;color:#E08A2B;border:1px solid rgba(224,138,43,.4);padding:1px 6px;border-radius:5px")}>{roleLabel}</span>
    </div>
  </aside>

  <div style={css("flex:1;min-width:0;display:flex;flex-direction:column;overflow:hidden")}>

    <header style={css("height:62px;flex-shrink:0;background:#fff;border-bottom:1px solid #E3E8EF;display:flex;align-items:center;padding:0 22px;gap:16px")}>
      <div style={css("min-width:0")}>
        <div style={css("font-size:16px;font-weight:600;color:#1A2433;line-height:1.2")}>{pageTitle}</div>
        <div style={css("font-size:11.5px;color:#8A97A8")}>{pageSub}</div>
      </div>
      <div style={css("flex:1")}></div>
      <div style={css("display:flex;align-items:center;gap:7px;background:#F2F4F8;border:1px solid #E3E8EF;border-radius:8px;padding:7px 11px;color:#8A97A8")}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
        <input placeholder="全体を検索  ⌘K" style={css("border:none;background:none;outline:none;font:inherit;font-size:12.5px;width:170px;color:#1A2433;padding:0")} />
      </div>
      <button onClick={goChat } style={css("display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>AI に相談</button>
    </header>

    <div style={css("flex:1;overflow:auto;padding:20px 22px 40px")}>

      {/* ===================== ダッシュボード ===================== */}
      {(isDashboard ) && (<>
        <div data-screen-label="01 ダッシュボード">

          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:16px")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>調査プロジェクト</span><span style={css("width:8px;height:8px;border-radius:3px;background:#2E5AAC")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statProjects}</div>
              <div style={css("font-size:11px;font-weight:500;color:#1F8255")}>{statProjectsSub}</div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>保存文献</span><span style={css("width:8px;height:8px;border-radius:3px;background:#1F8255")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statDocs}</div>
              <div style={css("font-size:11px;font-weight:500;color:#5A6678")}>{statDocsSub}</div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>AI 要約生成</span><span style={css("width:8px;height:8px;border-radius:3px;background:#E08A2B")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statReports}</div>
              <div style={css("font-size:11px;font-weight:500;color:#5A6678")}>{statReportsSub}</div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>未読ウォッチ通知</span><span style={css("width:8px;height:8px;border-radius:3px;background:#C5392F")}></span></div>
              <div style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;letter-spacing:-.5px")}>{statWatch}</div>
              <div style={css("font-size:11px;font-weight:500;color:#B5701A")}>{statWatchSub}</div>
            </div>
          </div>

          <div style={css("display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);gap:16px;align-items:start")}>
            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                  <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#B5701A;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AI</span>
                  <div style={css("flex:1")}>
                    <div style={css("font-size:14px;font-weight:600")}>リサーチ・ダイジェスト</div>
                    <div style={css("font-size:11.5px;color:#8A97A8")}>{digestMeta}</div>
                  </div>
                  <button onClick={regenDigest } style={css("display:inline-flex;align-items:center;gap:6px;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>再生成</button>
                </div>
                <div style={css("padding:15px 18px 17px;font-size:13px;line-height:1.75;color:#1A2433;min-height:96px")}>
                  <span data-stream="digestText">{digestText}</span>{(digestBusy ) && (<><span style={css("display:inline-block;width:7px;height:15px;background:#E08A2B;vertical-align:-2px;margin-left:2px;animation:icrps-blink 1s steps(1) infinite")}></span></>)}
                </div>
                <div style={css("padding:0 18px 16px;display:flex;gap:8px;flex-wrap:wrap")}>
                  <button onClick={goFeed } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>選別された 4 件を見る</button>
                  <button onClick={goWatch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>配信設定</button>
                  <span style={css("margin-left:auto;font-size:11px;color:#8A97A8;align-self:center")}>全 4 件に出典リンクあり</span>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                  <div style={css("flex:1")}><div style={css("font-size:14px;font-weight:600")}>技術トレンド分析</div><div style={css("font-size:11.5px;color:#8A97A8")}>当社ウォッチ分野の論文数推移（直近 24 か月・AI 分類）</div></div>
                  <span style={css("font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:6px")}>自動更新</span>
                </div>
                <div style={css("padding:16px 18px;display:flex;flex-direction:column;gap:13px")}>
                  {(trendRows ).map((t: any) => (<>
                    <div style={css("display:flex;align-items:center;gap:12px")}>
                      <span style={css("width:150px;flex-shrink:0;font-size:12.5px;color:#5A6678")}>{t.label}</span>
                      <span style={css("flex:1;height:8px;background:#EEF1F5;border-radius:4px;overflow:hidden;display:block")}><span style={css("display:block;height:100%;width:" + t.width + "%;background:" + t.color + ";border-radius:4px")}></span></span>
                      <span style={css("width:110px;text-align:right;font-family:'IBM Plex Mono',monospace;font-size:12px;color:#1F8255;font-weight:600")}>{t.value}</span>
                    </div>
                  </>))}
                  <div style={css("margin-top:4px;padding:11px 13px;background:#FDEFE0;border-radius:8px;font-size:12px;line-height:1.7;color:#7A4B10")}>
                    <b>AI の所見：</b>低炭素系（LC3・ジオポリマー）と UAV 画像診断の 2 領域が同時に加速しています。当社の重点テーマ「海洋環境下の低炭素コンクリート」は前者の伸びの中で相対的に手薄で、参入余地があります。
                    <a onClick={goSearch } style={css("cursor:pointer;font-weight:600;white-space:nowrap")}>→ この観点で検索</a>
                  </div>
                </div>
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><span style={css("flex:1;font-size:14px;font-weight:600")}>要確認のアラート</span><span style={css("font-size:11px;font-weight:600;color:#C5392F;background:#FCE9E7;padding:2px 8px;border-radius:6px")}>{alertRows.length}</span></div>
                {(alertRows ).map((a: any, idx: number) => (<>
                  <div style={css("padding:13px 18px;" + (idx < alertRows.length - 1 ? "border-bottom:1px solid #EEF1F5;" : "") + "display:flex;gap:11px")}>
                    <span style={css("width:8px;height:8px;border-radius:50%;background:" + a.color + ";margin-top:5px;flex-shrink:0")}></span>
                    <div style={css("min-width:0")}><div style={css("font-size:12.5px;font-weight:600;line-height:1.5")}>{a.title}</div><div style={css("font-size:11.5px;color:#8A97A8;margin-top:3px")}>{a.sub}</div></div>
                  </div>
                </>))}
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><span style={css("flex:1;font-size:14px;font-weight:600")}>最近の調査プロジェクト</span><a onClick={goProjects } style={css("cursor:pointer;font-size:11.5px")}>すべて</a></div>
                {(recentProjectRows ).map((p: any, idx: number) => (<>
                  <div style={css("padding:12px 18px;" + (idx < recentProjectRows.length - 1 ? "border-bottom:1px solid #EEF1F5;" : "") + "display:flex;align-items:center;gap:10px")}>
                    <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:500;color:#1A2433")}>{p.title}</div><div style={css("font-size:11px;color:#8A97A8;margin-top:2px")}>{p.meta}</div></div>
                    <span style={css(p.statusStyle )}>{p.status}</span>
                  </div>
                </>))}
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== 技術文献フィード ===================== */}
      {(isFeed ) && (<>
        <div data-screen-label="02 技術文献フィード">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:16px;display:flex;flex-direction:column;gap:11px")}>
            <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
              <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;width:52px")}>分野</span>
              {(domainChips ).map((chip: any) => (<>
                <button onClick={chip.go } style={css(chip.style )}>{chip.label}<span style={css("font-family:'IBM Plex Mono',monospace;opacity:.65;margin-left:5px")}>{chip.n}</span></button>
              </>))}
            </div>
            <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap;border-top:1px solid #EEF1F5;padding-top:11px")}>
              <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;width:52px")}>種別</span>
              {(typeChips ).map((chip: any) => (<>
                <button onClick={chip.go } style={css(chip.style )}>{chip.label}</button>
              </>))}
              <div style={css("flex:1")}></div>
              <span style={css("font-size:11.5px;color:#8A97A8")}>{feedCount} 件 · AI 選別スコア順</span>
            </div>
          </div>

          <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(430px,1fr));gap:16px;align-items:start")}>
            {(feed ).map((it: any) => (<>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;display:flex;flex-direction:column;animation:icrps-in .25s ease both")}>
                <div style={css("padding:14px 17px 0;display:flex;align-items:center;gap:7px;flex-wrap:wrap")}>
                  <span style={css(it.typeStyle )}>{it.typeLabel}</span>
                  <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>{it.domain}</span>
                  <div style={css("flex:1")}></div>
                  <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8A97A8")}>{it.date}</span>
                </div>
                <div style={css("padding:11px 17px 0")}>
                  <div style={css("font-size:14px;font-weight:600;line-height:1.55;text-wrap:pretty")}>{it.title}</div>
                  <div style={css("font-size:11.5px;color:#8A97A8;margin-top:5px;line-height:1.5")}>{it.original}</div>
                  <div style={css("font-size:11.5px;color:#5A6678;margin-top:6px;font-family:'IBM Plex Mono',monospace")}>{it.venue}</div>
                </div>
                <div style={css("margin:13px 17px 0;padding:12px 13px;background:#FAFBFC;border:1px solid #EEF1F5;border-radius:8px")}>
                  <div style={css("display:flex;align-items:center;gap:6px;margin-bottom:7px")}>
                    <span style={css("font-size:10px;font-weight:700;color:#B5701A;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>AI 要約</span>
                    <span style={css("font-size:10.5px;color:#8A97A8")}>信頼度</span>
                    <span style={css("font-family:'IBM Plex Mono',monospace;font-size:10.5px;font-weight:600;color:#1F8255")}>{it.conf}</span>
                  </div>
                  <div style={css("font-size:12.5px;line-height:1.75;color:#1A2433")}>{it.summary}</div>
                </div>
                <div style={css("padding:12px 17px 0;display:flex;flex-direction:column;gap:5px")}>
                  {(it.points ).map((p: any) => (<>
                    <div style={css("display:flex;gap:8px;font-size:12px;line-height:1.65;color:#5A6678")}><span style={css("color:#E08A2B;font-weight:700")}>•</span><span>{p}</span></div>
                  </>))}
                </div>
                <div style={css("margin-top:auto;padding:14px 17px;display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                  <button onClick={it.goDoc } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>詳細と全文要約</button>
                  <button style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>保存</button>
                  <div style={css("flex:1")}></div>
                  <a href={it.url} target="_blank" rel="noreferrer" style={css("font-size:11.5px;font-weight:600")}>出典 ↗</a>
                </div>
              </div>
            </>))}
          </div>
        </div>
      </>)}

      {/* ===================== AI 横断検索 ===================== */}
      {(isSearch ) && (<>
        <div data-screen-label="03 AI横断検索">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:18px;margin-bottom:16px")}>
            <label style={css("font-size:12px;font-weight:600;color:#5A6678;display:block;margin-bottom:6px")}>調べたいことを、そのまま日本語で書いてください</label>
            <textarea value={q} onChange={setQ} rows={2} placeholder="例：海洋環境の飛沫帯で使える低炭素コンクリート。塩害に対する耐久性の実証データがあるものを中心に。" style={css("font:inherit;font-size:14px;padding:11px 13px;border:1px solid #E3E8EF;border-radius:8px;background:#fff;color:#1A2433;width:100%;outline:none;resize:vertical;line-height:1.7")}></textarea>
            <div style={css("display:flex;gap:9px;align-items:center;flex-wrap:wrap;margin-top:12px")}>
              <button onClick={runSearch } style={css("display:inline-flex;align-items:center;gap:7px;cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:9px 16px;border-radius:8px;font:inherit;font-size:13px;font-weight:600")}>AI に解釈させて検索</button>
              <span style={css("font-size:11.5px;color:#8A97A8")}>論文 · 特許 · 技術書 · Web を横断／日英自動展開</span>
              <div style={css("flex:1")}></div>
              <span style={css("font-size:11.5px;color:#8A97A8;font-family:'IBM Plex Mono',monospace")}>{searchStatus}</span>
            </div>
          </div>

          {(hasSteps ) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
              <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:9px")}>
                <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#B5701A;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AI</span>
                <span style={css("flex:1;font-size:14px;font-weight:600")}>検索意図の解釈</span>
                <button onClick={toggleQueryEdit } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:5px 10px;border-radius:8px;font:inherit;font-size:11.5px;font-weight:600")}>展開語を手で修正</button>
              </div>
              <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:10px")}>
                {(steps ).map((s: any) => (<>
                  <div style={css("display:flex;gap:11px;align-items:flex-start;animation:icrps-in .3s ease both")}>
                    <span style={css(s.dot )}></span>
                    <div style={css("min-width:0;flex:1")}>
                      <div style={css("font-size:12.5px;font-weight:600;color:#1A2433")}>{s.label}</div>
                      <div style={css("font-size:12px;color:#5A6678;line-height:1.7;margin-top:3px")}>{s.detail}</div>
                    </div>
                  </div>
                </>))}
                {(termsReady ) && (<>
                  <div style={css("border-top:1px solid #EEF1F5;padding-top:12px;display:flex;gap:7px;flex-wrap:wrap;align-items:center")}>
                    <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;margin-right:3px")}>展開クエリ</span>
                    {(terms ).map((t: any) => (<>
                      <span style={css(t.style )}>{t.text}</span>
                    </>))}
                  </div>
                </>)}
              </div>
            </div>
          </>)}

          {(resultsReady ) && (<>
            <div style={css("display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:16px;align-items:start")}>
              <div style={css("display:flex;flex-direction:column;gap:12px;min-width:0")}>
                <div style={css("display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
                  <span style={css("font-size:13px;font-weight:600")}>検索結果 {resultCount} 件</span>
                  <span style={css("font-size:11.5px;color:#8A97A8")}>重複排除 18 件 · Crossref 失敗（OpenAlex で補完）</span>
                  <div style={css("flex:1")}></div>
                  {(hasCompare ) && (<>
                    <button onClick={goCompare } style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>選択 {compareCount} 件で AI 比較表</button>
                  </>)}
                </div>
                {(results ).map((r: any) => (<>
                  <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:16px 18px;animation:icrps-in .25s ease both")}>
                    <div style={css("display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:9px")}>
                      <span style={css(r.typeStyle )}>{r.typeLabel}</span>
                      <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>{r.domain}</span>
                      <div style={css("flex:1")}></div>
                      <span style={css("font-size:11px;color:#8A97A8")}>関連度</span>
                      <span style={css("font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:#1F8255")}>{r.score}</span>
                    </div>
                    <div onClick={r.goDoc } style={css("font-size:14.5px;font-weight:600;line-height:1.55;cursor:pointer;color:#1A2433;text-wrap:pretty")}>{r.title}</div>
                    <div style={css("font-size:11.5px;color:#8A97A8;margin-top:5px;line-height:1.5")}>{r.original}</div>
                    <div style={css("font-size:12.5px;line-height:1.75;color:#5A6678;margin-top:9px")}>{r.summary}</div>
                    <div style={css("font-size:11.5px;color:#8A97A8;margin-top:9px;font-family:'IBM Plex Mono',monospace")}>{r.venue}</div>
                    <div style={css("display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center")}>
                      <button onClick={r.toggle } style={css(r.pickStyle )}>{r.pickLabel}</button>
                      <button style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>プロジェクトに保存</button>
                      <div style={css("flex:1")}></div>
                      <a href={r.url} target="_blank" rel="noreferrer" style={css("font-size:11.5px;font-weight:600")}>出典 ↗</a>
                    </div>
                  </div>
                </>))}
              </div>

              <div style={css("display:flex;flex-direction:column;gap:16px")}>
                <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                  <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>絞り込み</div>
                  <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:13px")}>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>情報種別</span>
                      <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                        <span style={css("font-size:11.5px;font-weight:600;color:#B5701A;background:#FDEFE0;border:1px solid #E08A2B;padding:5px 10px;border-radius:7px")}>論文 42</span>
                        <span style={css("font-size:11.5px;font-weight:600;color:#B5701A;background:#FDEFE0;border:1px solid #E08A2B;padding:5px 10px;border-radius:7px")}>特許 11</span>
                        <span style={css("font-size:11.5px;font-weight:500;color:#5A6678;background:#fff;border:1px solid #E3E8EF;padding:5px 10px;border-radius:7px")}>技術書 4</span>
                        <span style={css("font-size:11.5px;font-weight:500;color:#5A6678;background:#fff;border:1px solid #E3E8EF;padding:5px 10px;border-radius:7px")}>Web 9</span>
                      </div>
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>発行年</span>
                      <div style={css("display:flex;gap:8px;align-items:center")}>
                        <input value="2018" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} />
                        <span style={css("color:#8A97A8")}>–</span>
                        <input value="2026" style={css("font:inherit;font-size:12.5px;padding:7px 10px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} />
                      </div>
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:6px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678")}>国・地域</span>
                      <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                        <span style={css("font-size:11.5px;font-weight:600;color:#B5701A;background:#FDEFE0;border:1px solid #E08A2B;padding:5px 10px;border-radius:7px")}>JP</span>
                        <span style={css("font-size:11.5px;font-weight:600;color:#B5701A;background:#FDEFE0;border:1px solid #E08A2B;padding:5px 10px;border-radius:7px")}>US</span>
                        <span style={css("font-size:11.5px;font-weight:600;color:#B5701A;background:#FDEFE0;border:1px solid #E08A2B;padding:5px 10px;border-radius:7px")}>EP</span>
                        <span style={css("font-size:11.5px;font-weight:500;color:#5A6678;background:#fff;border:1px solid #E3E8EF;padding:5px 10px;border-radius:7px")}>CN</span>
                      </div>
                    </div>
                  </div>
                </div>

                {(suggestDismissed ) ? null : (<>
                <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                  <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}><span style={css("font-size:10px;font-weight:700;color:#B5701A;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>AI</span><span style={css("font-size:13.5px;font-weight:600")}>次の一手</span></div>
                  <div style={css("padding:13px 17px;font-size:12.5px;line-height:1.8;color:#5A6678")}>
                    上位 12 件のうち 9 件が室内試験のみです。<b style={css("color:#1A2433")}>実構造物の暴露試験</b>を条件に加えると母集団が絞られます。
                  </div>
                  <div style={css("padding:0 17px 15px;display:flex;gap:7px;flex-wrap:wrap")}>
                    <button onClick={acceptSuggest } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>条件に追加</button>
                    <button onClick={dismissSuggest } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#8A97A8;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>却下</button>
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
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:16px;align-items:start")}>
            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:20px 22px")}>
                <div style={css("display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin-bottom:11px")}>
                  <span style={css("font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:2px 8px;border-radius:6px")}>{docTypeLabel}</span>
                  <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>{docDomain}</span>
                  <span style={css("font-size:11px;font-weight:600;color:#5A6678;background:#F2F4F8;border:1px solid #E3E8EF;padding:2px 8px;border-radius:6px")}>維持管理</span>
                  <div style={css("flex:1")}></div>
                  <button onClick={toggleEn } style={css(enBtnStyle )}>{enBtnLabel}</button>
                </div>
                <h1 style={css("font-size:20px;font-weight:600;line-height:1.5;margin:0 0 8px;text-wrap:pretty")}>{docTitle}</h1>
                <div style={css("font-size:12.5px;color:#8A97A8;line-height:1.7")}>{docSub}</div>
                <div style={css("display:grid;grid-template-columns:max-content 1fr;gap:9px 18px;margin:16px 0 0;padding-top:15px;border-top:1px solid #EEF1F5")}>
                  <span style={css("color:#8A97A8;font-weight:600;font-size:12px")}>掲載誌</span><span style={css("font-size:12.5px")}>{docVenue}</span>
                  <span style={css("color:#8A97A8;font-weight:600;font-size:12px")}>DOI</span><span style={css("font-size:12.5px;font-family:'IBM Plex Mono',monospace")}>{docDoi}</span>
                  <span style={css("color:#8A97A8;font-weight:600;font-size:12px")}>取得元</span><span style={css("font-size:12.5px")}>{docSource}</span>
                  <span style={css("color:#8A97A8;font-weight:600;font-size:12px")}>出典</span><span style={css("font-size:12.5px")}><a href={docUrl} target="_blank" rel="noreferrer">{docUrlHost} ↗</a></span>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("display:flex;gap:2px;padding:10px 14px 0;border-bottom:1px solid #EEF1F5")}>
                  {(docTabs ).map((t: any) => (<>
                    <button onClick={t.go } style={css(t.style )}>{t.label}</button>
                  </>))}
                </div>

                {(docTabSummary ) && (<>
                  <div style={css("padding:16px 20px 20px")}>
                    <div style={css("display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin-bottom:14px")}>
                      <span style={css("font-size:11.5px;font-weight:600;color:#5A6678;margin-right:3px")}>要約の粒度</span>
                      {(sumLevels ).map((l: any) => (<>
                        <button onClick={l.go } style={css(l.style )}>{l.label}</button>
                      </>))}
                      <div style={css("flex:1")}></div>
                      <span style={css("font-size:11px;color:#8A97A8")}>信頼度</span>
                      <span style={css("font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:600;color:#1F8255")}>0.91</span>
                      <span style={css("width:70px;height:6px;background:#EEF1F5;border-radius:3px;overflow:hidden;display:block")}><span style={css("display:block;height:100%;width:91%;background:#2E9E6B;border-radius:3px")}></span></span>
                    </div>
                    <div style={css("font-size:13.5px;line-height:1.95;color:#1A2433;min-height:150px;white-space:pre-wrap")}><span data-stream="sumText">{sumText}</span>{(sumBusy ) && (<><span style={css("display:inline-block;width:7px;height:16px;background:#E08A2B;vertical-align:-3px;margin-left:2px;animation:icrps-blink 1s steps(1) infinite")}></span></>)}</div>
                    <div style={css("margin-top:18px;padding-top:15px;border-top:1px solid #EEF1F5;display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                      <button onClick={adoptSummary } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#1F8255;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>この要約を採用</button>
                      <button onClick={regenSum } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>再生成</button>
                      <button onClick={editSummary } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>手で編集</button>
                      <button onClick={discardSummary } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#8A97A8;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>却下</button>
                      <div style={css("flex:1")}></div>
                      <span style={css("font-size:11px;color:#8A97A8")}>{docActionMsg ?? "根拠：要約の引用・出典に基づきます"}</span>
                    </div>
                  </div>
                </>)}

                {(docTabAbstract ) && (<>
                  <div style={css("padding:18px 20px 20px;display:flex;flex-direction:column;gap:16px")}>
                    <div>
                      <div style={css("font-size:11.5px;font-weight:600;color:#8A97A8;margin-bottom:7px")}>原文抄録（English）</div>
                      <div style={css("font-size:13px;line-height:1.9;color:#5A6678;background:#FAFBFC;border:1px solid #EEF1F5;border-radius:8px;padding:14px 16px")}>{abstractEn}</div>
                    </div>
                    <div>
                      <div style={css("display:flex;align-items:center;gap:7px;margin-bottom:7px")}><span style={css("font-size:11.5px;font-weight:600;color:#8A97A8")}>AI 訳（日本語）</span><span style={css("font-size:10px;font-weight:700;color:#B5701A;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>専門用語辞書適用</span></div>
                      <div style={css("font-size:13.5px;line-height:1.95;color:#1A2433")}>{abstractJa}</div>
                    </div>
                    <div style={css("padding:11px 13px;background:#FDEFE0;border-radius:8px;font-size:11.5px;line-height:1.7;color:#7A4B10")}>訳語は土木用語辞書（JSCE 用語集ベース）で統制しています。「deck」は文脈から<b>床版</b>と訳出しました。</div>
                  </div>
                </>)}

                {(docTabClaims ) && (<>
                  <div style={css("padding:18px 20px 20px;display:flex;flex-direction:column;gap:14px")}>
                    <div style={css("padding:10px 13px;background:#FCE9E7;border-radius:8px;font-size:11.5px;line-height:1.7;color:#8E2B23")}>{claimsNote}</div>
                    {(claimsText ) && (<div style={css("display:flex;flex-direction:column;gap:11px")}>
                      <div style={css("border:1px solid #E3E8EF;border-radius:8px;overflow:hidden")}>
                        <div style={css("padding:9px 13px;background:#FAFBFC;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}><span style={css("font-family:'IBM Plex Mono',monospace;font-size:11.5px;font-weight:600")}>請求項 1（独立項）</span><span style={css("font-size:10.5px;font-weight:600;color:#C5392F;background:#FCE9E7;padding:1px 7px;border-radius:5px")}>要注意</span></div>
                        <div style={css("padding:13px;font-size:12.5px;line-height:1.9;color:#5A6678")}>{claimsText}</div>
                        <div style={css("padding:12px 13px;border-top:1px solid #EEF1F5;background:#FAFBFC")}>
                          <div style={css("font-size:11px;font-weight:700;color:#B5701A;margin-bottom:6px")}>AI 読み解き</div>
                          <div style={css("font-size:12.5px;line-height:1.85;color:#1A2433")}>特許要約・クレーム関連情報は AI 要約タブの「特許要約」で再生成できます。特許の法的有効性・侵害判断は行いません。</div>
                        </div>
                      </div>
                    </div>)}
                    <div style={css("display:flex;gap:8px;flex-wrap:wrap")}><button onClick={goSearch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>類似特許を再検索</button></div>
                  </div>
                </>)}

                {(docTabCite ) && (<>
                  <div style={css("padding:18px 20px 20px")}>
                    <div style={css("font-size:12.5px;color:#5A6678;line-height:1.8;margin-bottom:14px")}>この文献を起点に、AI が引用・被引用関係と主題の近さから関連文献を並べています。数値は主題の近さです。</div>
                    <div style={css("display:flex;flex-direction:column;gap:9px")}>
                      {(related ).map((rl: any) => (<>
                        <div style={css("display:flex;align-items:center;gap:13px;padding:11px 13px;border:1px solid #E3E8EF;border-radius:8px")}>
                          <span style={css(rl.relStyle )}>{rl.rel}</span>
                          <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:500;line-height:1.6")}>{rl.title}</div><div style={css("font-size:11px;color:#8A97A8;margin-top:3px;font-family:'IBM Plex Mono',monospace")}>{rl.venue}</div></div>
                          <span style={css("width:64px;height:6px;background:#EEF1F5;border-radius:3px;overflow:hidden;display:block;flex-shrink:0")}><span style={css(rl.barStyle )}></span></span>
                          <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11.5px;color:#5A6678;width:34px;text-align:right")}>{rl.sim}</span>
                        </div>
                      </>))}
                    </div>
                  </div>
                </>)}
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>AI 抽出データ</div>
                <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:11px")}>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#8A97A8")}>床版抽出 ピクセル精度</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>98.63%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#8A97A8")}>床版抽出 IoU</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>97.18%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#8A97A8")}>ひび割れ Dice 係数</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>85.32%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#8A97A8")}>ひび割れ ピクセル精度</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>95.04%</span></div>
                  <div style={css("display:flex;justify-content:space-between;gap:10px;font-size:12.5px")}><span style={css("color:#8A97A8")}>モデル</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>DeepLab v3+ / U-Net</span></div>
                  <div style={css("padding-top:10px;border-top:1px solid #EEF1F5;font-size:11px;color:#8A97A8;line-height:1.7")}>数値は本文 Abstract から抽出。採用前に原典で確認してください。</div>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>この文献に質問する</div>
                <div style={css("padding:13px 17px;display:flex;flex-direction:column;gap:7px")}>
                  <button onClick={goChat } style={css("text-align:left;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 12px;border-radius:8px;font:inherit;font-size:12px;line-height:1.6")}>実橋への適用条件は？</button>
                  <button onClick={goChat } style={css("text-align:left;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 12px;border-radius:8px;font:inherit;font-size:12px;line-height:1.6")}>学習データの規模と偏りは？</button>
                  <button onClick={goChat } style={css("text-align:left;cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 12px;border-radius:8px;font:inherit;font-size:12px;line-height:1.6")}>当社の点検フローに組み込むには？</button>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 17px;display:flex;flex-direction:column;gap:8px")}>
                <button style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>プロジェクトに保存</button>
                <button onClick={goCompare } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>比較表に追加</button>
                <button onClick={goWatch } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>著者・主題をウォッチ</button>
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== 比較表 ===================== */}
      {(isCompare ) && (<>
        <div data-screen-label="05 比較表">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);margin-bottom:16px;overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#B5701A;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AI</span>
              <div style={css("flex:1")}><div style={css("font-size:14px;font-weight:600")}>比較軸の提案</div><div style={css("font-size:11.5px;color:#8A97A8")}>選択した 4 文献の内容から、意味のある比較軸を AI が提案しました。採否を選んでください。</div></div>
            </div>
            <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:8px")}>
              {(axes ).map((ax: any) => (<>
                <div style={css("display:flex;align-items:center;gap:12px;padding:10px 13px;border:1px solid #E3E8EF;border-radius:8px")}>
                  <span style={css(ax.markStyle )}>{ax.mark}</span>
                  <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;font-weight:600")}>{ax.name}</div><div style={css("font-size:11.5px;color:#8A97A8;margin-top:2px;line-height:1.6")}>{ax.why}</div></div>
                  <button onClick={ax.accept } style={css(ax.acceptStyle )}>採用</button>
                  <button onClick={ax.reject } style={css(ax.rejectStyle )}>却下</button>
                </div>
              </>))}
              <div style={css("display:flex;gap:9px;align-items:center;margin-top:5px")}>
                <button onClick={buildCompare } style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:9px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>採用 {axesOnCount} 軸で比較表を生成</button>
                <button style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:9px 15px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>軸を自分で追加</button>
                <div style={css("flex:1")}></div>
                <span style={css("font-size:11.5px;color:#8A97A8")}>{compareStatus}</span>
              </div>
            </div>
          </div>

          {(compareBuilt ) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;animation:icrps-in .3s ease both")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                <div style={css("flex:1")}><div style={css("font-size:14px;font-weight:600")}>技術比較表：UAV／画像診断による構造物点検</div><div style={css("font-size:11.5px;color:#8A97A8")}>セルは AI 生成。セルをクリックすると根拠箇所と原典リンクが開きます。</div></div>
                <button onClick={exportCompareCsv } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>Excel 出力（CSV）</button>
                <button onClick={goReport } style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>レポートへ</button>
              </div>
              <div style={css("overflow-x:auto")}>
                <table style={css("border-collapse:collapse;width:100%;font-size:12.5px;min-width:900px")}>
                  <thead>
                    <tr>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:150px;position:sticky;left:0")}>比較軸</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC")}>{compareHeaders[0]}</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC")}>{compareHeaders[1]}</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC")}>{compareHeaders[2]}</th>
                      <th style={css("text-align:left;padding:11px 14px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC")}>{compareHeaders[3]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(compareRows ).map((row: any) => (<>
                      <tr>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;font-weight:600;color:#5A6678;background:#FAFBFC;position:sticky;left:0")}>{row.axis}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.a}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.b}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.c}</td>
                        <td style={css("padding:12px 14px;border-bottom:1px solid #EEF1F5;line-height:1.75;vertical-align:top")}>{row.d}</td>
                      </tr>
                    </>))}
                  </tbody>
                </table>
              </div>
              <div style={css("padding:15px 18px;border-top:1px solid #EEF1F5;background:#FAFBFC")}>
                <div style={css("font-size:11px;font-weight:700;color:#B5701A;margin-bottom:7px")}>AI の総括（信頼度 0.78）</div>
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
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5")}><div style={css("font-size:14px;font-weight:600")}>設計・施工条件</div><div style={css("font-size:11.5px;color:#8A97A8;margin-top:2px")}>条件を入れると、保存文献と示方書から適用可否を突合します</div></div>
              <div style={css("padding:16px 18px;display:flex;flex-direction:column;gap:13px")}>
                <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>対象工種</label><select style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")}><option>橋梁下部工（場所打ち）</option><option>橋梁上部工（PC 桁）</option><option>護岸・防波堤</option><option>トンネル覆工</option></select></div>
                <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>環境区分</label><select style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")}><option>海洋・飛沫帯</option><option>海洋・海中</option><option>一般外気（凍結防止剤あり）</option><option>一般外気</option></select></div>
                <div style={css("display:flex;gap:10px")}>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>設計基準強度</label><input value="40 N/mm²" style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} /></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>かぶり</label><input value="70 mm" style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} /></div>
                </div>
                <div style={css("display:flex;gap:10px")}>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>設計供用年数</label><input value="100 年" style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} /></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px;flex:1")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>CO₂ 削減目標</label><input value="30% 以上" style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} /></div>
                </div>
                <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>候補材料・工法</label><input value="高炉スラグ高置換コンクリート / LC3 / ジオポリマー" style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} /></div>
                <button onClick={runFit } style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:10px 15px;border-radius:8px;font:inherit;font-size:13px;font-weight:600;margin-top:4px")}>AI で適用可否を判定</button>
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>
              {(fitReady ) && (<>
                {(fitResults ).map((f: any) => (<>
                  <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;animation:icrps-in .3s ease both")}>
                    <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:11px;flex-wrap:wrap")}>
                      <span style={css(f.verdictStyle )}>{f.verdict}</span>
                      <span style={css("display:flex;align-items:center;gap:6px;margin-left:auto")}><span style={css("font-size:11px;color:#8A97A8")}>信頼度</span><span style={css("font-family:'IBM Plex Mono',monospace;font-size:12.5px;font-weight:600;color:#5A6678")}>{f.conf}</span></span>
                      <div style={css("flex:1 1 100%;min-width:0")}><div style={css("font-size:14px;font-weight:600;line-height:1.5;text-wrap:pretty")}>{f.name}</div><div style={css("font-size:11.5px;color:#8A97A8;margin-top:3px;line-height:1.6")}>{f.headline}</div></div>
                    </div>
                    <div style={css("padding:14px 18px;display:flex;flex-direction:column;gap:9px")}>
                      {(f.checks ).map((c: any) => (<>
                        <div style={css("display:flex;gap:11px;align-items:flex-start")}>
                          <span style={css(c.iconStyle )}>{c.icon}</span>
                          <div style={css("flex:1;min-width:0")}><div style={css("font-size:12.5px;line-height:1.75")}>{c.text}</div><div style={css("font-size:11px;color:#8A97A8;margin-top:3px")}>根拠：<a href={c.url} target="_blank" rel="noreferrer">{c.src} ↗</a></div></div>
                        </div>
                      </>))}
                    </div>
                  </div>
                </>))}
              </>)}
              <div style={css("padding:12px 15px;background:#FDEFE0;border-radius:8px;font-size:11.5px;line-height:1.8;color:#7A4B10")}>本判定は公開情報に基づく調査支援であり、設計判断・施工可否・安全性を保証するものではありません。採用前に必ず原典と示方書を確認し、社内基準に従って専門家の承認を得てください。</div>
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
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;font-size:14px;font-weight:600")}>レポート設定</div>
                <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:13px")}>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>種別</label><select style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")}><option>技術比較レポート</option><option>調査概要レポート</option><option>特許調査レポート</option><option>論文レビュー</option><option>技術提案下調べ</option></select></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>タイトル</label><input value="UAV 画像診断による橋梁点検の技術動向と当社適用方針" style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")} /></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>想定読者</label><select style={css("font:inherit;font-size:13px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none")}><option>技術研究所内（専門家）</option><option>事業部門の技術者</option><option>経営層</option><option>発注者向け提案</option></select></div>
                  <div style={css("display:flex;flex-direction:column;gap:5px")}><label style={css("font-size:12px;font-weight:600;color:#5A6678")}>引用文献</label><div style={css("font-size:12.5px;color:#5A6678;padding:8px 11px;background:#F2F4F8;border-radius:8px")}>比較表の 4 文献 ＋ 保存文献 12 件</div></div>
                </div>
              </div>

              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:8px")}><span style={css("font-size:10px;font-weight:700;color:#B5701A;background:#FDEFE0;padding:1px 6px;border-radius:5px")}>AI</span><span style={css("flex:1;font-size:13.5px;font-weight:600")}>章立ての提案</span></div>
                <div style={css("padding:12px 15px;display:flex;flex-direction:column;gap:6px")}>
                  {(outline ).map((o: any) => (<>
                    <div style={css("display:flex;align-items:center;gap:9px;padding:8px 10px;border:1px solid #E3E8EF;border-radius:8px")}>
                      <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#8A97A8;width:16px")}>{o.no}</span>
                      <span style={css("flex:1;font-size:12.5px;line-height:1.5")}>{o.title}</span>
                      <button onClick={o.toggle } style={css(o.style )}>{o.state}</button>
                    </div>
                  </>))}
                </div>
                <div style={css("padding:0 15px 15px")}><button onClick={genReport } style={css("width:100%;cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:10px 15px;border-radius:8px;font:inherit;font-size:13px;font-weight:600")}>この構成でドラフト生成</button></div>
              </div>
            </div>

            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden;min-height:520px;display:flex;flex-direction:column")}>
              <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px;flex-wrap:wrap")}>
                <span style={css("flex:1 1 auto;min-width:150px;font-size:14px;font-weight:600")}>ドラフト（Markdown）</span>
                <span style={css("font-size:11.5px;color:#8A97A8;font-family:'IBM Plex Mono',monospace;white-space:nowrap")}>{reportStatus}</span>
                <button onClick={toggleReportEdit } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{reportEdit ? "プレビューに戻る" : "編集"}</button>
                <button onClick={exportReportMd } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>.md 出力</button>
                <button onClick={() => setReportEdit(false)} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:6px 11px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>PDF（Phase 2）</button>
              </div>
              {(reportEdit ) ? (<textarea value={reportText} onChange={(e) => setReportText(e.target.value)} style={css("flex:1;padding:20px 24px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;line-height:2;color:#1A2433;border:none;outline:none;resize:none;white-space:pre-wrap;overflow:auto")}></textarea>) : (<div style={css("flex:1;padding:20px 24px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;line-height:2;color:#1A2433;white-space:pre-wrap;overflow:auto")}><span data-stream="reportText">{reportText}</span>{(reportBusy ) && (<><span style={css("display:inline-block;width:7px;height:14px;background:#E08A2B;vertical-align:-2px;margin-left:2px;animation:icrps-blink 1s steps(1) infinite")}></span></>)}</div>)}
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== AI アシスタント ===================== */}
      {(isChat ) && (<>
        <div data-screen-label="08 AIアシスタント" style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;align-items:start")}>
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;min-height:560px;max-height:calc(100vh - 124px);overflow:hidden")}>
            <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <div style={css("flex:1")}><div style={css("font-size:14px;font-weight:600")}>リサーチアシスタント</div><div style={css("font-size:11.5px;color:#8A97A8")}>対象：保存文献 {chatDocCount} 件</div></div>
              <span style={css("font-size:11px;font-weight:600;color:#1F8255;background:#E4F3EC;padding:3px 9px;border-radius:6px")}>出典付き回答</span>
            </div>

            <div style={css("flex:1;min-height:240px;overflow:auto;padding:20px 22px;display:flex;flex-direction:column;gap:18px")}>
              {(chat ).map((m: any) => (<>
                <div style={css(m.wrapStyle )}>
                  <div style={css(m.bubbleStyle )}>{m.text}</div>
                  {(m.hasCites ) && (<>
                    <div style={css("display:flex;flex-direction:column;gap:6px;margin-top:10px;max-width:760px")}>
                      <div style={css("font-size:11px;font-weight:700;color:#8A97A8")}>出典</div>
                      {(m.cites ).map((c: any) => (<>
                        <a href={c.url} target="_blank" rel="noreferrer" style={css("display:flex;gap:9px;align-items:center;padding:9px 11px;border:1px solid #E3E8EF;border-radius:8px;text-decoration:none")}>
                          <span style={css("font-family:'IBM Plex Mono',monospace;font-size:11px;color:#B5701A;background:#FDEFE0;padding:1px 6px;border-radius:5px;flex-shrink:0")}>{c.n}</span>
                          <span style={css("flex:1;min-width:0;font-size:12px;color:#1A2433;line-height:1.55")}>{c.title}</span>
                          <span style={css("font-size:11px;color:#8A97A8;flex-shrink:0")}>↗</span>
                        </a>
                      </>))}
                    </div>
                  </>)}
                </div>
              </>))}
              {(chatBusy ) && (<>
                <div style={css("display:flex;gap:6px;align-items:center;color:#8A97A8;font-size:12px")}><span style={css("width:6px;height:6px;border-radius:50%;background:#E08A2B;animation:icrps-pulse 1.1s infinite")}></span>{chatBusyText}</div>
              </>)}
            </div>

            <div style={css("border-top:1px solid #EEF1F5;padding:13px 18px;display:flex;flex-direction:column;gap:9px")}>
              <div style={css("display:flex;gap:7px;flex-wrap:wrap")}>
                {(chatSuggests ).map((s: any) => (<>
                  <button onClick={s.go } style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:6px 11px;border-radius:8px;font:inherit;font-size:11.5px")}>{s.label}</button>
                </>))}
              </div>
              <div style={css("display:flex;gap:9px;align-items:flex-end")}>
                <textarea value={chatInput} onChange={setChatInput} rows={1} placeholder="保存文献に対して質問してください（例：室内試験と実構造物試験の結果が食い違う点は？）" style={css("font:inherit;font-size:13px;padding:10px 12px;border:1px solid #E3E8EF;border-radius:8px;width:100%;outline:none;resize:none;line-height:1.6")}></textarea>
                <button onClick={sendChat } style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:10px 17px;border-radius:8px;font:inherit;font-size:13px;font-weight:600;flex-shrink:0")}>送信</button>
              </div>
              <div style={css("font-size:10.5px;color:#8A97A8;line-height:1.6")}>回答は保存文献の範囲内で生成され、出典のない主張は表示しません。重要な判断には原典確認を行ってください。</div>
            </div>
          </div>

          <div style={css("display:flex;flex-direction:column;gap:16px")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>参照範囲</div>
              <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:10px")}>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#8A97A8")}>論文</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatPaperCount}</span></div>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#8A97A8")}>特許</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatPatentCount}</span></div>
                <div style={css("display:flex;justify-content:space-between;font-size:12.5px")}><span style={css("color:#8A97A8")}>技術書・示方書</span><span style={css("font-family:'IBM Plex Mono',monospace;font-weight:600")}>{chatBookCount}</span></div>
                <div style={css("padding-top:10px;border-top:1px solid #EEF1F5;font-size:11px;color:#8A97A8;line-height:1.7")}>参照範囲外の一般知識で答えた場合は、その旨を明示します。</div>
              </div>
            </div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>この会話から</div>
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
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><span style={css("flex:1;font-size:14px;font-weight:600")}>ウォッチしているテーマ</span><button onClick={() => setShowWatchForm(!showWatchForm)} style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:6px 12px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>＋ 追加</button></div>
              {(showWatchForm ) && (<>
                <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;flex-direction:column;gap:10px;background:#FAFBFC")}>
                  <div style={css("font-size:12px;font-weight:700;color:#5A6678")}>新しいウォッチテーマ</div>
                  <input value={watchName} onChange={setWatchName} placeholder="テーマ名（例: 低炭素コンクリート（海洋環境））" style={css("font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;outline:none")} />
                  <input value={watchTerms} onChange={setWatchTerms} placeholder="キーワード（例: 低炭素コンクリート / low-carbon / GGBS / splash zone）" style={css("font:inherit;font-size:12.5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;outline:none")} />
                  <div style={css("display:flex;gap:8px;align-items:center;flex-wrap:wrap")}>
                    <select value={watchFreq} onChange={setWatchFreq} style={css("font:inherit;font-size:12.5px;padding:6px 10px;border:1px solid #E3E8EF;border-radius:8px;outline:none")}><option value="daily">毎日</option><option value="weekly">毎週</option><option value="monthly">毎月</option></select>
                    <button onClick={createWatchTopic } style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>登録</button>
                    <button onClick={() => setShowWatchForm(false)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>キャンセル</button>
                  </div>
                  {(watchMsg.text ) && (<div style={css(watchMsgStyle )}>{watchMsg.text}</div>)}
                </div>
              </>)}
              {(topics ).map((t: any) => (<>
                <div style={css("padding:14px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:14px")}>
                  <div style={css("flex:1;min-width:0")}>
                    <div style={css("display:flex;align-items:center;gap:8px;flex-wrap:wrap")}><span style={css("font-size:13px;font-weight:600")}>{t.name}</span>{(t.isNew ) && (<><span style={css("font-size:10.5px;font-weight:700;color:#C5392F;background:#FCE9E7;padding:1px 7px;border-radius:5px")}>新着 {t.newCount}</span></>)}</div>
                    <div style={css("font-size:11.5px;color:#8A97A8;margin-top:4px;line-height:1.6")}>{t.terms}</div>
                    <div style={css("font-size:11px;color:#8A97A8;margin-top:5px;font-family:'IBM Plex Mono',monospace")}>{t.meta}</div>
                  </div>
                  <div style={css("display:flex;flex-direction:column;gap:5px;align-items:flex-end")}>
                    <button onClick={t.toggle } style={css(t.style )}>{t.label}</button>
                    <span style={css("font-size:10.5px;color:#8A97A8")}>{t.freq} · <a onClick={t.remove } style={css("cursor:pointer;color:#C5392F")}>削除</a></span>
                  </div>
                </div>
              </>))}
              <div style={css("padding:15px 18px;background:#FAFBFC")}>
                <div style={css("font-size:11px;font-weight:700;color:#B5701A;margin-bottom:7px")}>AI 選別ルール</div>
                <div style={css("font-size:12.5px;line-height:1.9;color:#5A6678")}>新着のうち「実構造物データを含む」「示方書・基準に関係する」「自社出願と請求項が重なる」いずれかに該当するものだけを通知します。新着監視ジョブは <b style={css("color:#1A2433")}>Phase 2</b> で有効化予定です（テーマ登録は即時反映されます）。</div>
              </div>
            </div>

            <div style={css("display:flex;flex-direction:column;gap:16px")}>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>ダイジェスト配信</div>
                <div style={css("padding:14px 17px;display:flex;flex-direction:column;gap:12px")}>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>配信頻度</span><select value={digestFreq} onChange={setDigestFreq} style={css("font:inherit;font-size:12.5px;padding:6px 10px;border:1px solid #E3E8EF;border-radius:8px;width:auto;outline:none")}><option>毎朝 6:00</option><option>週 1（月曜）</option><option>即時</option></select></div>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>宛先</span><span style={css("font-size:12px;font-family:'IBM Plex Mono',monospace;color:#5A6678")}>{userOrg}</span></div>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>要約の粒度</span><span style={css("font-size:12px;color:#5A6678")}>短文（3 行）</span></div>
                  <div style={css("display:flex;align-items:center;gap:10px")}><span style={css("flex:1;font-size:12.5px;color:#5A6678")}>上限件数</span><span style={css("font-size:12px;font-family:'IBM Plex Mono',monospace;color:#5A6678")}>5 件/回</span></div>
                </div>
              </div>
              <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
                <div style={css("padding:14px 17px;border-bottom:1px solid #EEF1F5;font-size:13.5px;font-weight:600")}>直近の通知</div>
                <div style={css("padding:13px 17px;font-size:12px;line-height:1.8;color:#8A97A8")}>{watchNotices}</div>
              </div>
            </div>
          </div>
        </div>
      </>)}

      {/* ===================== プロジェクト ===================== */}
      {(isProjects ) && (<>
        <div data-screen-label="10 プロジェクト">
          <div style={css("display:flex;gap:9px;align-items:center;margin-bottom:14px;flex-wrap:wrap")}>
            <button onClick={() => setShowNewProject(!showNewProject)} style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>＋ 新規プロジェクト</button>
            <button onClick={() => setProjectFilter("すべて")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "すべて" ? "#E08A2B" : "#E3E8EF") + ";background:" + (projectFilter === "すべて" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "すべて" ? "#B5701A" : "#5A6678") + ";cursor:pointer")}>すべて</button>
            <button onClick={() => setProjectFilter("進行中")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "進行中" ? "#E08A2B" : "#E3E8EF") + ";background:" + (projectFilter === "進行中" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "進行中" ? "#B5701A" : "#5A6678") + ";cursor:pointer")}>進行中 {projectStatusCounts["進行中"]}</button>
            <button onClick={() => setProjectFilter("報告済")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "報告済" ? "#E08A2B" : "#E3E8EF") + ";background:" + (projectFilter === "報告済" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "報告済" ? "#B5701A" : "#5A6678") + ";cursor:pointer")}>報告済 {projectStatusCounts["報告済"]}</button>
            <button onClick={() => setProjectFilter("アーカイブ")} style={css("font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:8px;border:1px solid " + (projectFilter === "アーカイブ" ? "#E08A2B" : "#E3E8EF") + ";background:" + (projectFilter === "アーカイブ" ? "#FDEFE0" : "#fff") + ";color:" + (projectFilter === "アーカイブ" ? "#B5701A" : "#5A6678") + ";cursor:pointer")}>アーカイブ {projectStatusCounts["アーカイブ"]}</button>
          </div>
          {(showNewProject ) && (<>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:14px;display:flex;gap:9px;align-items:center;flex-wrap:wrap")}>
              <input value={newProjectTitle} onChange={setNewProjectTitle} placeholder="新しい調査テーマの名前" style={css("flex:1;min-width:220px;font:inherit;font-size:13px;padding:9px 12px;border:1px solid #E3E8EF;border-radius:8px;outline:none")} />
              <button onClick={createProject } style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>作成</button>
              <button onClick={() => setShowNewProject(false)} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:8px 14px;border-radius:8px;font:inherit;font-size:12.5px;font-weight:600")}>キャンセル</button>
              {(projectMsg ) && (<span style={css("font-size:12px;font-weight:600;color:" + (projectMsg.type === "ok" ? "#1F8255" : "#C5392F") + ")")}>{projectMsg.text}</span>)}
            </div>
          </>)}
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
            <table style={css("border-collapse:collapse;width:100%;font-size:12.5px")}>
              <thead><tr>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC")}>プロジェクト</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:190px")}>タグ</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:96px")}>文献</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:150px")}>AI 進捗</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:88px")}>状態</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:96px")}>更新</th>
              </tr></thead>
              <tbody>
                {(projects ).map((p: any) => (<>
                  <tr onClick={p.go } style={css("cursor:pointer")}>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><div style={css("font-weight:500;color:#1A2433;line-height:1.5")}>{p.title}</div><div style={css("font-size:11px;color:#8A97A8;margin-top:3px")}>{p.owner}</div></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><span style={css("font-family:'IBM Plex Mono',monospace;background:#F2F4F8;color:#5A6678;border-radius:5px;padding:2px 7px;font-size:11px")}>{p.tag1}</span> <span style={css("font-family:'IBM Plex Mono',monospace;background:#F2F4F8;color:#5A6678;border-radius:5px;padding:2px 7px;font-size:11px")}>{p.tag2}</span></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5;font-family:'IBM Plex Mono',monospace")}>{p.docs}</td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><span style={css("display:block;height:6px;background:#EEF1F5;border-radius:3px;overflow:hidden")}><span style={css(p.barStyle )}></span></span><span style={css("font-size:10.5px;color:#8A97A8;display:block;margin-top:4px")}>{p.progressLabel}</span></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5")}><span style={css(p.statusStyle )}>{p.status}</span></td>
                    <td style={css("padding:13px 16px;border-bottom:1px solid #EEF1F5;color:#8A97A8")}>{p.updated}</td>
                  </tr>
                </>))}
              </tbody>
            </table>
          </div>
        </div>
      </>)}

      {/* ===================== 管理・監査ログ ===================== */}
      {(adminAccessDenied ) && (<>
        <div data-screen-label="11b 管理・監査ログ（権限なし）" style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:28px 22px;text-align:center")}>
          <div style={css("font-size:13px;font-weight:600;color:#1A2433;margin-bottom:6px")}>管理・監査ログは管理者権限が必要です</div>
          <div style={css("font-size:12px;color:#8A97A8")}>管理者アカウントでログインすると、ユーザー管理・監査ログ・システム設定を利用できます。</div>
        </div>
      </>)}
      {(isAdmin ) && (<>
        <div data-screen-label="11 管理・監査ログ">
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-bottom:16px")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>利用ユーザー</span><span style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums")}>{adminTotalUsers}</span><span style={css("font-size:11px;color:#5A6678")}>admin {adminAdmins} · user {Math.max(0, adminTotalUsers - adminAdmins)}</span></div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>LLM コスト</span><span style={css("font-size:18px;font-weight:600;line-height:1.2;font-variant-numeric:tabular-nums;color:#5A6678")}>{adminCostLabel}</span><span style={css("font-size:11px;color:#5A6678")}>コスト連携は Phase 2</span></div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>AI プロバイダ</span><span style={css("font-size:18px;font-weight:600;line-height:1.2;font-variant-numeric:tabular-nums;color:#5A6678")}>{adminConnectorLabel}</span><span style={css("font-size:11px;color:#B5701A")}>システム設定から変更可能</span></div>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;padding:16px 17px;box-shadow:0 1px 2px rgba(16,24,40,.04);display:flex;flex-direction:column;gap:7px")}><span style={css("font-size:11.5px;color:#8A97A8;font-weight:500")}>AI 出力の却下率</span><span style={css("font-size:28px;font-weight:600;line-height:1;font-variant-numeric:tabular-nums;color:#8A97A8")}>—</span><span style={css("font-size:11px;color:#5A6678")}>{adminRejectLabel}</span></div>
          </div>

          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center")}><span style={css("flex:1;font-size:14px;font-weight:600")}>監査ログ</span><span style={css("font-size:11.5px;color:#8A97A8")}>AI 操作は入力・モデル・信頼度まで記録</span></div>
            <table style={css("border-collapse:collapse;width:100%;font-size:12.5px")}>
              <thead><tr>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:150px")}>日時</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:130px")}>ユーザー</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC;width:150px")}>操作</th>
                <th style={css("text-align:left;padding:11px 16px;border-bottom:1px solid #EEF1F5;font-size:11px;color:#8A97A8;font-weight:600;background:#FAFBFC")}>対象・詳細</th>
              </tr></thead>
              <tbody>
                {(audit ).map((a: any) => (<>
                  <tr>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5;font-family:'IBM Plex Mono',monospace;color:#8A97A8")}>{a.at}</td>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5")}>{a.user}</td>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5")}><span style={css(a.actStyle )}>{a.act}</span></td>
                    <td style={css("padding:12px 16px;border-bottom:1px solid #EEF1F5;color:#5A6678;line-height:1.6")}>{a.detail}</td>
                  </tr>
                </>))}
              </tbody>
            </table>
          </div>
        </div>
      </>)}

      {(showDisclaimer ) && (<>
        <div style={css("margin-top:22px;padding:12px 15px;border-left:3px solid #E08A2B;background:#fff;border-radius:0 8px 8px 0;font-size:11.5px;line-height:1.8;color:#5A6678")}>
          本システムの AI 要約・比較・判定結果は、公開情報に基づく<b>調査支援情報</b>です。特許の権利判断、設計判断、施工可否、安全性判断を保証するものではありません。重要な判断には、原典確認および専門家確認を行ってください。
        </div>
      </>)}

      {/* ===================== システム設定 ===================== */}
      {(isSettings ) && (<>
        <div data-screen-label="12 システム設定">
          <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:15px 18px;margin-bottom:16px;display:flex;align-items:center;gap:10px")}>
            <span style={css("width:22px;height:22px;border-radius:6px;background:#FDEFE0;color:#B5701A;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>⚙</span>
            <div style={css("flex:1")}>
              <div style={css("font-size:14px;font-weight:600")}>AI プロバイダ設定</div>
              <div style={css("font-size:11.5px;color:#8A97A8")}>
                アクティブ: {settingsActiveProvider ?? "未設定（ルール応答）"} · DeepSeek {settingsDeepSeekConfigured ? "設定済み" : "未設定"} · Anthropic {settingsAnthropicConfigured ? "設定済み" : "未設定"}
              </div>
            </div>
          </div>

          {(settingsAccessDenied ) ? (<div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);padding:28px 22px;text-align:center")}>
            <div style={css("font-size:13px;font-weight:600;color:#1A2433;margin-bottom:6px")}>システム設定は管理者権限が必要です</div>
            <div style={css("font-size:12px;color:#8A97A8")}>管理者アカウントでログインすると、DeepSeek / Anthropic の API キー設定・テスト・保存が利用できます。</div>
          </div>) : (<>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:16px;align-items:start")}>
            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                <span style={css("width:30px;height:30px;border-radius:8px;background:#141C29;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>DS</span>
                <div style={css("flex:1")}>
                  <div style={css("font-size:14px;font-weight:600")}>DeepSeek（OpenAI 互換）</div>
                  <div style={css("font-size:11.5px;color:#8A97A8")}>ステータス: {settingsDeepSeekConfigured ? "設定済み" : "未設定"} · モデル {dsModel}</div>
                </div>
              </div>
              <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:11px")}>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  API キー
                  <input type="password" value={dsKey} onChange={setDsKey} placeholder="sk-…（保存済みキーは表示されません）" autoComplete="off" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433;outline:none")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  モデル名
                  <input value={dsModel} onChange={setDsModel} placeholder="deepseek-chat" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433;outline:none")} />
                </label>
                <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                  <button onClick={testDeepSeek} disabled={dsBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{dsBusy ? "テスト中…" : "設定テスト"}</button>
                  <button onClick={saveDeepSeek} disabled={dsBusy} style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定保存</button>
                  <button onClick={clearDsInput} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>入力クリア</button>
                  <button onClick={clearDeepSeek} style={css("cursor:pointer;border:1px solid #F5B3AD;background:#FCE9E7;color:#C5392F;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定クリア</button>
                </div>
                {(dsMsg.text ) && (<div style={css(dsMsgStyle )}>{dsMsg.text}</div>)}
              </div>
            </div>

            <div style={css("background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
              <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
                <span style={css("width:30px;height:30px;border-radius:8px;background:#B5701A;color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700")}>AN</span>
                <div style={css("flex:1")}>
                  <div style={css("font-size:14px;font-weight:600")}>Anthropic（Claude）</div>
                  <div style={css("font-size:11.5px;color:#8A97A8")}>ステータス: {settingsAnthropicConfigured ? "設定済み" : "未設定"} · モデル {anModel}</div>
                </div>
              </div>
              <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:11px")}>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  API キー
                  <input type="password" value={anKey} onChange={setAnKey} placeholder="sk-ant-…（保存済みキーは表示されません）" autoComplete="off" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433;outline:none")} />
                </label>
                <label style={css("font-size:11.5px;font-weight:600;color:#5A6678;display:block")}>
                  モデル名
                  <input value={anModel} onChange={setAnModel} placeholder="claude-sonnet-4-5" style={css("display:block;width:100%;margin-top:5px;padding:8px 11px;border:1px solid #E3E8EF;border-radius:8px;font:inherit;font-size:12.5px;color:#1A2433;outline:none")} />
                </label>
                <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
                  <button onClick={testAnthropic} disabled={anBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{anBusy ? "テスト中…" : "設定テスト"}</button>
                  <button onClick={saveAnthropic} disabled={anBusy} style={css("cursor:pointer;border:1px solid #E08A2B;background:#E08A2B;color:#fff;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定保存</button>
                  <button onClick={clearAnInput} style={css("cursor:pointer;border:1px solid #E3E8EF;background:#fff;color:#5A6678;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>入力クリア</button>
                  <button onClick={clearAnthropic} style={css("cursor:pointer;border:1px solid #F5B3AD;background:#FCE9E7;color:#C5392F;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>設定クリア</button>
                </div>
                {(anMsg.text ) && (<div style={css(anMsgStyle )}>{anMsg.text}</div>)}
              </div>
            </div>
          </div>

          <div style={css("margin-top:16px;background:#fff;border:1px solid #E3E8EF;border-radius:10px;box-shadow:0 1px 2px rgba(16,24,40,.04);overflow:hidden")}>
            <div style={css("padding:15px 18px;border-bottom:1px solid #EEF1F5;display:flex;align-items:center;gap:10px")}>
              <span style={css("width:30px;height:30px;border-radius:8px;background:#2E5AAC;color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700")}>📚</span>
              <div style={css("flex:1")}>
                <div style={css("font-size:14px;font-weight:600")}>文献データ連携（土木建設技術）</div>
                <div style={css("font-size:11.5px;color:#8A97A8")}>J-STAGE / 土木研究所 / ITC Digital Library / 国交省 / 関東地整 ・ 2時間ごとに自動取得（cron 相当）</div>
              </div>
              <button onClick={runIngestNow} disabled={ingestBusy} style={css("cursor:pointer;border:1px solid #C9D7EC;background:#fff;color:#2E5AAC;padding:7px 13px;border-radius:8px;font:inherit;font-size:12px;font-weight:600")}>{ingestBusy ? "収集中…" : "今すぐ取得"}</button>
            </div>
            <div style={css("padding:15px 18px;display:flex;flex-direction:column;gap:8px")}>
              {(ingestRuns ?? []).length === 0 && (<div style={css("font-size:12px;color:#8A97A8")}>実行履歴はまだありません。「今すぐ取得」または2時間ごとの自動実行で記録されます。</div>)}
              {(ingestRuns ?? []).slice(0, 10).map((run: { id: string; createdAt: string; detail: Record<string, unknown> | null }) => {
                const d = (run.detail ?? {}) as Record<string, unknown>;
                const t = new Date(run.createdAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={run.id} style={css("display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #EEF1F5;border-radius:8px;background:#FAFBFC")}>
                    <span style={css("width:8px;height:8px;border-radius:50%;flex:none;background:" + (d.status === "error" ? "#C5392F" : "#1F8255"))} />
                    <span style={css("flex:1;font-size:12px;font-weight:600;color:#1A2433")}>{String(d.source ?? "")}</span>
                    <span style={css("font-size:11px;color:#5A6678")}>取得 {String(d.fetched ?? 0)} ・ 新規 {String(d.inserted ?? 0)} ・ 重複 {String(d.skipped ?? 0)}</span>
                    <span style={css("font-size:11px;color:#8A97A8")}>{t}</span>
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

          <div style={css("margin-top:16px;padding:12px 15px;border-left:3px solid #E08A2B;background:#fff;border-radius:0 8px 8px 0;font-size:11.5px;line-height:1.8;color:#5A6678")}>
            <b>セキュリティ：</b>API キーは AES-256-GCM で暗号化して保存され、画面・ログ・監査ログに出力されません。「設定テスト」は接続確認のみで保存は行いません。「入力クリア」は入力欄のみ、「設定クリア」は保存済みキーを削除します。
          </div>
          </>)}
        </div>
      </>)}
    </div>
  </div>
</div>


    </>
  );
}
