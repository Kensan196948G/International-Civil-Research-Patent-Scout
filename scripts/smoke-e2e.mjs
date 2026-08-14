#!/usr/bin/env node
// ICRPS 主要業務フローの E2E スモークテスト
// 使用法: BASE_URL=http://127.0.0.1:8787 node scripts/smoke-e2e.mjs
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8787";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let token = "";
const user = {
  name: `smoke-${Date.now().toString(36)}`,
  email: `smoke-${Date.now().toString(36)}@example.local`,
  password: "smoke-test-password-2026"
};

async function call(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* text のまま */ }
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status}: ${text.slice(0, 200)}`);
  return json ?? text;
}

function ok(name, value) {
  console.log(`  ✓ ${name}: ${value}`);
}

async function main() {
  console.log(`E2E smoke against ${BASE}`);

  const health = await call("/api/health", { auth: false });
  if (!health.ok || health.db !== "ok") throw new Error(`health NG: ${JSON.stringify(health)}`);
  ok("health", `${health.env} / db=${health.db}`);

  const reg = await call("/api/auth/register", { method: "POST", body: user, auth: false });
  token = reg.accessToken;
  ok("register/login", reg.user.email);

  const project = await call("/api/projects", {
    method: "POST",
    body: { title: "低炭素コンクリートの技術調査", description: "E2E smoke", tags: ["concrete", "low-carbon"] }
  });
  ok("project create", project.project.id);

  const search = await call("/api/search", {
    method: "POST",
    body: {
      projectId: project.project.id,
      query: "low carbon concrete civil engineering",
      languageMode: "bilingual",
      sourceTypes: ["paper"],
      maxResults: 5,
      includeTranslation: true,
      includeSynonyms: true
    }
  });
  ok("search start", search.searchQueryId);

  let result;
  for (let i = 0; i < 15; i++) {
    await sleep(2000);
    result = await call(`/api/search/${search.searchQueryId}`);
    if (result.status === "completed" || result.status === "failed") break;
  }
  if (result.status === "failed") throw new Error(`search failed: ${JSON.stringify(result.failureSources)}`);
  if (!result.results || result.results.length === 0) throw new Error("search returned no results");
  ok("search completed", `${result.results.length} results`);

  const docs = result.results.slice(0, 2);
  for (const doc of docs) {
    const saved = await call(`/api/projects/${project.project.id}/documents`, {
      method: "POST",
      body: { documentId: doc.documentId, tags: ["E2E"], importance: 4, userNote: "smoke test" }
    });
    ok("save document", saved.projectDocument.id);
  }

  const summary = await call(`/api/documents/${docs[0].documentId}/summarize`, {
    method: "POST",
    body: { summaryType: "technical", language: "ja" }
  });
  ok("summarize", summary.summary.summaryType);

  const comparison = await call(`/api/projects/${project.project.id}/comparisons`, {
    method: "POST",
    body: { documentIds: docs.map((d) => d.documentId), axes: ["技術概要", "適用条件", "主なメリット"] }
  });
  ok("comparison", comparison.comparison.id);

  const report = await call(`/api/projects/${project.project.id}/reports`, {
    method: "POST",
    body: {
      title: "低炭素コンクリート技術調査レポート",
      reportType: "technical_comparison",
      documentIds: docs.map((d) => d.documentId),
      comparisonId: comparison.comparison.id
    }
  });
  ok("report create", report.report.id);
  if (!report.report.contentMarkdown.includes("# ")) throw new Error("report markdown invalid");

  const exported = await call(`/api/reports/${report.report.id}/export`, { method: "POST" });
  // テンプレートモードは「参考文献・出典」、AI モードは「参考資料」を出力するため両対応で検証する
  if (!exported.includes("参考文献") && !exported.includes("参考資料")) throw new Error("export content invalid");
  ok("report export", `${exported.length} chars`);

  const stats = await call("/api/dashboard/stats");
  ok("dashboard stats", JSON.stringify({ projects: stats.stats.projectCount, docs: stats.stats.savedDocumentCount, reports: stats.stats.reportCount }));

  const watch = await call("/api/watch", {
    method: "POST",
    body: { displayName: "E2E 監視テーマ", terms: "low carbon / 海洋環境", keyword: "低炭素コンクリート", frequency: "weekly" }
  });
  ok("watch create", watch.topic.id);

  const watchList = await call("/api/watch");
  if (!watchList.topics.some((t) => t.id === watch.topic.id)) throw new Error("watch list missing topic");
  ok("watch list", `${watchList.topics.length} topics`);

  const watchToggle = await call(`/api/watch/${watch.topic.id}`, { method: "PATCH", body: { enabled: false } });
  if (watchToggle.topic.enabled !== false) throw new Error("watch toggle failed");
  ok("watch toggle", "停止");

  const chat = await call("/api/chat", { method: "POST", body: { message: "低炭素コンクリートの適用条件は？" } });
  if (!chat.reply) throw new Error("chat empty reply");
  if (!Array.isArray(chat.cites)) throw new Error("chat cites missing");
  ok(`chat (${chat.mode})`, `${chat.reply.slice(0, 40)}… cites=${chat.cites.length}`);

  await call(`/api/watch/${watch.topic.id}`, { method: "DELETE" });
  ok("watch delete", watch.topic.id);

  console.log("\nE2E smoke test: ALL PASSED");
}

main().catch((err) => {
  console.error("\nE2E smoke test FAILED:", err.message);
  process.exit(1);
});
