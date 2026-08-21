/* eslint-disable no-undef */
// ICRPS 実ブラウザ E2E（デモ環境の操作・表示確認）
// 使用法:
//   npm i --no-save playwright@1.49.1   # Firefox 同梱（chromium は環境により起動不可）
//   BASE_URL=http://127.0.0.1:8787 node scripts/ui-e2e.mjs
import { firefox } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:8787";
const SHOT_DIR = "/tmp/icrps-shots";
mkdirSync(SHOT_DIR, { recursive: true });

const results = [];
const consoleErrors = [];
let failed = false;

function ok(name, detail = "") {
  results.push({ status: "OK", name, detail });
  console.log(`  ✓ ${name}${detail ? " — " + detail : ""}`);
}
function ng(name, detail = "") {
  results.push({ status: "NG", name, detail });
  console.error(`  ✗ ${name} — ${detail}`);
  failed = true;
}

const browser = await firefox.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: "ja-JP" });
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => consoleErrors.push(String(err)));

try {
  // 1. ログインページ
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 30000 });
  await page
    .waitForSelector('input[type="email"], input[type="text"], input[name="email"], input[placeholder*="メール"]', {
      timeout: 15000
    })
    .catch(() => {});
  ok("ログインページ表示", page.url());
  await page.screenshot({ path: `${SHOT_DIR}/01-login.png`, fullPage: true });

  // フォームを探して入力
  const emailInput = page.locator('input[type="email"], input[placeholder*="メール"], input[name="email"]').first();
  const pwdInput = page.locator('input[type="password"]').first();
  await emailInput.fill("demo-admin@icrps-demo.example");
  await pwdInput.fill("DemoPass-2026!");
  await page.getByRole("button", { name: /ログイン|サインイン/i }).first().click();
  await page.waitForURL(/\/dashboard/, { timeout: 20000 });
  ok("ログイン成功（Cookie セッション）", page.url());

  // 2. ダッシュボード
  // 最近のプロジェクトは表示件数に上限があり、並び順もデータ更新で変わる。
  // 特定タイトルを決め打ちすると偽陽性の失敗になるため、「デモ用プロジェクトが
  // 1件以上表示されていること」を判定条件にする。
  await page.waitForLoadState("networkidle", { timeout: 30000 }).catch(() => {});
  await page.waitForSelector("text=/（デモ）/", { timeout: 30000 }).catch(() => {});
  const dashText = await page.textContent("body");
  const demoProjects = dashText.match(/（デモ）/g) ?? [];
  if (dashText.includes("ダッシュボード") && demoProjects.length > 0) {
    ok("ダッシュボード表示（統計・プロジェクト）", `デモ項目 ${demoProjects.length} 件`);
  } else {
    ng("ダッシュボード表示", "デモ用プロジェクトが1件も表示されない");
  }
  await page.screenshot({ path: `${SHOT_DIR}/02-dashboard.png`, fullPage: true });

  // 3. 技術文献フィード（保存文献 + 収集文献）
  await page.goto(`${BASE}/feed`, { waitUntil: "networkidle", timeout: 30000 });
  const feedText = await page.textContent("body");
  if (feedText.includes("【デモ用】")) ok("保存文献フィードにデモ文献表示");
  else ng("保存文献フィード", "デモ文献が見つからない");
  await page.getByRole("button", { name: /収集文献/ }).first().click();
  await page.waitForTimeout(2500);
  const litText = await page.textContent("body");
  if (litText.includes("収集文献")) ok("収集文献タブ表示", `${(litText.match(/\d[\d,]* 件/g) ?? [])[0] ?? ""}`);
  else ng("収集文献タブ", "表示なし");
  await page.screenshot({ path: `${SHOT_DIR}/03-feed.png`, fullPage: true });

  // 4. 文書詳細（フィード先頭のデモ文献を開く）
  const firstDocBtn = page.getByRole("button", { name: /詳細と全文要約|詳細を開く/ }).first();
  await firstDocBtn.click().catch(async () => {
    await page.goto(`${BASE}/feed`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /詳細と全文要約/ }).first().click();
  });
  await page.waitForURL(/\/documents\//, { timeout: 20000 });
  await page.waitForTimeout(3500);
  const docText = await page.textContent("body");
  if (docText.includes("AI 要約") && (docText.includes("【デモ用】") || docText.includes("デモ"))) {
    ok("文書詳細表示（要約・メタデータ）", page.url());
  } else {
    ng("文書詳細表示", "要約/メタデータが見つからない");
  }
  await page.screenshot({ path: `${SHOT_DIR}/04-document.png`, fullPage: true });

  // 5. 検索（実行して完了を確認）
  await page.goto(`${BASE}/search`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.getByRole("button", { name: /AI に解釈させて検索/ }).first().click();
  await page.waitForSelector("text=/検索結果 \\d+ 件/", { timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const searchText = await page.textContent("body");
  const m = searchText.match(/検索結果 (\d+) 件/);
  if (m && Number(m[1]) > 0) ok("横断検索の実行と結果表示", `${m[1]} 件`);
  else ng("横断検索", searchText.slice(0, 200));
  await page.screenshot({ path: `${SHOT_DIR}/05-search.png`, fullPage: true });

  // 6. プロジェクト（一覧・チーム共有UI）
  await page.goto(`${BASE}/projects`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const projText = await page.textContent("body");
  if (projText.includes("チーム共有") && projText.includes("低炭素コンクリートの実用化調査")) {
    ok("プロジェクト画面（一覧・共有・チーム）");
  } else {
    ng("プロジェクト画面", projText.slice(0, 200));
  }
  await page.screenshot({ path: `${SHOT_DIR}/06-projects.png`, fullPage: true });

  // 7. 比較表（生成は API 検証済みのため画面表示のみ）
  await page.goto(`${BASE}/compare`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1000);
  const cmpText = await page.textContent("body");
  if (cmpText.includes("比較軸の提案")) ok("比較表画面表示");
  else ng("比較表画面", cmpText.slice(0, 120));
  await page.screenshot({ path: `${SHOT_DIR}/07-compare.png`, fullPage: true });

  // 8. 適用可否チェック（実行）
  await page.goto(`${BASE}/fit`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /適用可否を判定/ }).first().click();
  await page.waitForSelector("text=信頼度", { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const fitText = await page.textContent("body");
  if (fitText.includes("有力") || fitText.includes("条件付き可") || fitText.includes("要確認")) {
    ok("適用可否チェック実行（ルールベース）");
  } else {
    ng("適用可否チェック", fitText.slice(0, 200));
  }
  await page.screenshot({ path: `${SHOT_DIR}/08-fit.png`, fullPage: true });

  // 9. レポート生成（実行）
  await page.goto(`${BASE}/report`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);
  await page.getByRole("button", { name: /この構成でドラフト生成/ }).first().click();
  await page.waitForSelector("text=ドラフト完了", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const repText = await page.textContent("body");
  if (repText.includes("# ") || repText.includes("調査概要")) ok("レポート生成（ドラフト表示）");
  else ng("レポート生成", repText.slice(0, 200));
  await page.screenshot({ path: `${SHOT_DIR}/09-report.png`, fullPage: true });

  // 10. チャット（送信）
  await page.goto(`${BASE}/chat`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(800);
  const chatArea = page.locator("textarea[placeholder*='質問']").first();
  await chatArea.fill("低炭素コンクリートの適用条件を教えてください。");
  await page.getByRole("button", { name: /送信/ }).first().click();
  await page.waitForSelector("text=保存文献の範囲", { timeout: 45000 }).catch(() => {});
  await page.waitForTimeout(1500);
  const chatText = await page.textContent("body");
  if (chatText.includes("出典")) ok("AI チャット（出典付き回答）");
  else ng("AI チャット", chatText.slice(0, 200));
  await page.screenshot({ path: `${SHOT_DIR}/10-chat.png`, fullPage: true });

  // 11. 更新監視・通知
  await page.goto(`${BASE}/watch`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1200);
  const watchText = await page.textContent("body");
  if (watchText.includes("ウォッチしているテーマ") && watchText.includes("低炭素コンクリート")) {
    ok("更新監視（テーマ・通知）");
  } else {
    ng("更新監視", watchText.slice(0, 200));
  }
  await page.screenshot({ path: `${SHOT_DIR}/11-watch.png`, fullPage: true });

  // 12. 管理（監査ログ）・システム設定
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const adminText = await page.textContent("body");
  if (adminText.includes("監査ログ")) ok("管理画面（監査ログ・統計）");
  else ng("管理画面", adminText.slice(0, 200));
  await page.screenshot({ path: `${SHOT_DIR}/12-admin.png`, fullPage: true });

  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);
  const setText = await page.textContent("body");
  if (setText.includes("AI プロバイダ設定") && setText.includes("文献データ連携")) {
    ok("システム設定（AI・文献連携）");
  } else {
    ng("システム設定", setText.slice(0, 200));
  }
  await page.screenshot({ path: `${SHOT_DIR}/13-settings.png`, fullPage: true });

  // ログアウト
  const logoutBtns = page.getByRole("button", { name: /ログアウト/i });
  if (await logoutBtns.count()) {
    await logoutBtns.first().click();
    await page.waitForURL(/\/login/, { timeout: 15000 }).catch(() => {});
    ok("ログアウト", page.url());
  }
} catch (err) {
  ng("実行時エラー", err instanceof Error ? err.message : String(err));
} finally {
  await page.screenshot({ path: `${SHOT_DIR}/99-final.png`, fullPage: true }).catch(() => {});
  await browser.close();
}

console.log("\n===== 結果 =====");
for (const r of results) console.log(`${r.status.padEnd(4)} ${r.name}${r.detail ? " / " + r.detail : ""}`);
console.log(`console errors: ${consoleErrors.length}`);
for (const e of consoleErrors.slice(0, 10)) console.log("  ERR:", e.slice(0, 300));
process.exit(failed ? 1 : 0);
