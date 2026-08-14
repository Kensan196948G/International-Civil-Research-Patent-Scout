#!/usr/bin/env node
// ICRPS デモ用ダミーデータ投入スクリプト
//
// 用途: MVP/Prototype 確認環境に「すぐ操作できる」架空データを投入する。
// 人物名・会社名・文献・案件・金額等はすべて架空であり、実在情報は含まない。
//
// 使用法:
//   DATABASE_URL=postgresql://... node scripts/seed-demo.mjs          # 投入（冪等）
//   DATABASE_URL=postgresql://... node scripts/seed-demo.mjs --force  # デモ分のみ削除して再投入
//
// デモ用ユーザー（パスワードはデモ用・リポジトリ管理対象）:
//   demo-admin@icrps-demo.example      / DemoPass-2026!   （管理者）
//   demo-researcher@icrps-demo.example / DemoPass-2026!   （一般ユーザー）
//   demo-viewer@icrps-demo.example     / DemoPass-2026!   （閲覧者）

import { randomUUID } from "node:crypto";
import { hash } from "bcryptjs";
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");
const DEMO_DOMAIN = "icrps-demo.example";
const DEMO_PASSWORD = "DemoPass-2026!";
const DEMO_MARKER = `demo-admin@${DEMO_DOMAIN}`;
const DEMO_SOURCE = "デモ用データ";

const sql = neon(DATABASE_URL, { arrayMode: false });

const daysAgo = (n, h = 9) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const j = (v) => JSON.stringify(v);

async function existsUser(email) {
  const rows = await sql.query("SELECT id FROM users WHERE lower(email) = lower($1) LIMIT 1", [email]);
  return rows[0]?.id ?? null;
}

async function cleanupDemo() {
  // デモユーザーを先に特定してから関連行を削除（監査・使用量は SET NULL になるため明示削除）
  const users = await sql.query(
    "SELECT id FROM users WHERE lower(email) LIKE '%@' || lower($1)",
    [DEMO_DOMAIN]
  );
  const userIds = users.map((u) => u.id);
  if (userIds.length > 0) {
    await sql.query("DELETE FROM audit_logs WHERE user_id = ANY($1::uuid[])", [userIds]);
    await sql.query("DELETE FROM llm_usage WHERE user_id = ANY($1::uuid[])", [userIds]);
    await sql.query("DELETE FROM auth_tokens WHERE user_id = ANY($1::uuid[])", [userIds]);
    // 所有プロジェクト・チーム・ウォッチ・通知は users 削除の CASCADE で除去される
    await sql.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [userIds]);
  }
  // デモ文献（content_hash = demo-*）を削除（search_results / ai_summaries は CASCADE）
  await sql.query("DELETE FROM source_documents WHERE content_hash LIKE 'demo-%'");
  // デモプロジェクトの検索履歴等も念のため除去
  await sql.query(
    "DELETE FROM search_queries WHERE user_id = ANY($1::uuid[])",
    [userIds]
  );
  console.log(`[seed] デモデータを削除しました（users=${userIds.length}）`);
}

async function main() {
  const markerId = await existsUser(DEMO_MARKER);
  if (markerId && !FORCE) {
    console.log("[seed] デモデータは投入済みです（--force で再投入できます）");
    console.log("[seed] デモユーザー: demo-admin / demo-researcher / demo-viewer（パスワード: DemoPass-2026!）");
    return;
  }
  if (markerId && FORCE) await cleanupDemo();

  const demoPasswordHash = await hash(DEMO_PASSWORD, 10);

  // ---------- ユーザー ----------
  const adminId = randomUUID();
  const researcherId = randomUUID();
  const viewerId = randomUUID();
  await sql.query(
    `INSERT INTO users (id, email, name, password_hash, role) VALUES
     ($1, $2, $3, $4, 'admin'),
     ($5, $6, $7, $8, 'user'),
     ($9, $10, $11, $12, 'viewer')`,
    [
      adminId, `demo-admin@${DEMO_DOMAIN}`, "デモ管理者", demoPasswordHash,
      researcherId, `demo-researcher@${DEMO_DOMAIN}`, "デモ研究者", demoPasswordHash,
      viewerId, `demo-viewer@${DEMO_DOMAIN}`, "デモ閲覧者", demoPasswordHash
    ]
  );

  // ---------- チーム ----------
  const materialsTeamId = randomUUID();
  const structureTeamId = randomUUID();
  await sql.query(
    `INSERT INTO teams (id, name, created_by) VALUES ($1, $2, $3), ($4, $5, $6)`,
    [materialsTeamId, "材料技術グループ（デモ）", adminId, structureTeamId, "構造技術グループ（デモ）", researcherId]
  );
  await sql.query(
    `INSERT INTO team_members (id, team_id, user_id, role) VALUES
     ($1, $2, $3, 'admin'),
     ($4, $5, $6, 'editor'),
     ($7, $8, $9, 'viewer'),
     ($10, $11, $12, 'admin'),
     ($13, $14, $15, 'editor')`,
    [
      randomUUID(), materialsTeamId, adminId,
      randomUUID(), materialsTeamId, researcherId,
      randomUUID(), materialsTeamId, viewerId,
      randomUUID(), structureTeamId, researcherId,
      randomUUID(), structureTeamId, adminId
    ]
  );

  // ---------- プロジェクト ----------
  const projectLowCarbon = randomUUID();
  const projectUav = randomUUID();
  const projectRepair = randomUUID();
  const projectPcDeck = randomUUID();
  await sql.query(
    `INSERT INTO research_projects (id, owner_user_id, title, description, status, tags, team_id) VALUES
     ($1, $2, $3, $4, 'active', $5::jsonb, NULL),
     ($6, $7, $8, $9, 'active', $10::jsonb, NULL),
     ($11, $12, $13, $14, 'completed', $15::jsonb, NULL),
     ($16, $17, $18, $19, 'active', $20::jsonb, $21)`,
    [
      projectLowCarbon, adminId,
      "低炭素コンクリートの実用化調査（デモ）",
      "高炉スラグ高置換・LC3・ジオポリマーの3技術を海洋環境での耐久性と施工性の観点から比較し、次期現場適用の候補を絞り込む。",
      j(["低炭素", "コンクリート", "サステナビリティ"]),
      projectUav, adminId,
      "UAV点検と画像診断の適用性評価（デモ）",
      "橋梁点検におけるUAV外観撮影とAIひび割れ解析の精度・コストを評価する。",
      j(["UAV", "点検", "AI"]),
      projectRepair, adminId,
      "塩害環境向け補修材料の比較調査（デモ）",
      "飛沫帯を対象に、断面修復材・含浸材・電気防食の適用条件を整理し、維持管理計画へ反映する。",
      j(["塩害", "補修", "維持管理"]),
      projectPcDeck, researcherId,
      "プレキャストPC床版の耐久性検討（デモ）",
      "既設PC床版のひび割れ実態と補修優先度の判定フローを検討する。",
      j(["PC", "床版", "耐久性"]),
      materialsTeamId
    ]
  );
  await sql.query(
    `INSERT INTO project_members (id, project_id, user_id, role) VALUES
     ($1, $2, $3, 'editor'),
     ($4, $5, $6, 'editor'),
     ($7, $8, $9, 'viewer')`,
    [
      randomUUID(), projectLowCarbon, researcherId,
      randomUUID(), projectUav, researcherId,
      randomUUID(), projectRepair, viewerId
    ]
  );

  // ---------- デモ文献 ----------
  const docs = [
    {
      n: 1,
      sourceType: "paper",
      title: "【デモ用】高炉スラグ高置換コンクリートの海洋飛沫帯暴露試験（10年）",
      originalTitle: "Ten-Year Marine Splash Zone Exposure of High-Volume GGBS Concrete (Demo)",
      abstract:
        "本稿は架空の10年暴露試験の報告であり、高炉スラグ高置換（置換率70%）コンクリートの塩化物イオン浸透抵抗性と表面ひび割れ性状を、普通コンクリートと比較したものである。設計強度40N/mm²・水結合材比0.35の配合で、飛沫帯における見かけの塩化物拡散係数を普通コンクリート比で約60%低減した。表面ひび割れ幅は平均0.08mm以下に抑制され、含浸材併用時の補修サイクル延長効果が示唆された。",
      url: "https://example.jp/demo/ggbs-marine-exposure",
      doi: "10.5555/icrps-demo-0001",
      authors: ["架空 太郎", "架空 花子"],
      country: "JP",
      publicationDate: "2025-03-15",
      sourceName: "デモ用 土木技術論文誌",
      classifications: ["C04B28/02", "G01N17/00"],
      status: null
    },
    {
      n: 2,
      sourceType: "paper",
      title: "【デモ用】LC3（石灰石焼成クレーセメント）の水和特性と強度発現",
      originalTitle: "Hydration and Strength Development of LC3 Cement (Demo)",
      abstract:
        "LC3-50（クリンカー置換率50%）のモルタル供試体について、圧縮強度・空隙率・水和生成物を評価した架空の実験結果である。材齢28日で普通セメントの約85%の強度を発現し、材齢91日で同等に達した。炭酸塩岩の微粒化と焼成クレーのアルミナ供給によるエトリンガイト安定化が寄与するものと考察した。",
      url: "https://example.jp/demo/lc3-hydration",
      doi: "10.5555/icrps-demo-0002",
      authors: ["架空 次郎", "架空 三郎"],
      country: "FR",
      publicationDate: "2024-11-02",
      sourceName: "デモ用 国際セメント研究",
      classifications: ["C04B7/00", "C04B28/04"],
      status: null
    },
    {
      n: 3,
      sourceType: "paper",
      title: "【デモ用】ジオポリマーコンクリートの耐酸性と施工性評価",
      originalTitle: "Acid Resistance and Workability of Geopolymer Concrete (Demo)",
      abstract:
        "フライアッシュ系ジオポリマーコンクリートの耐酸性（pH2硫酸浸漬）とポンプ圧送性を検討した架空研究。質量減少率は普通コンクリート比で約70%低減した一方、凝結時間の管理と養生温度（60℃）の確保が施工上の課題として示された。",
      url: "https://example.jp/demo/geopolymer-acid",
      doi: "10.5555/icrps-demo-0003",
      authors: ["架空 四郎", "架空 五郎"],
      country: "AU",
      publicationDate: "2024-07-19",
      sourceName: "デモ用 材料工学レビュー",
      classifications: ["C04B28/26"],
      status: null
    },
    {
      n: 4,
      sourceType: "paper",
      title: "【デモ用】UAV画像によるコンクリートひび割れ深さ推定の精度検証",
      originalTitle: "Crack Depth Estimation from UAV Imagery: Accuracy Study (Demo)",
      abstract:
        "橋梁床版の模擬ひび割れを対象に、UAV撮影画像と深層学習セグメンテーションを用いたひび割れ深さ推定の精度を検証した架空実験。地上解像度1mm/pixelの画像で幅0.2mm以上のひび割れ検出率は92%、深さ推定の平均誤差は±15%であった。日照条件と影の影響が最大の誤差要因とされた。",
      url: "https://example.jp/demo/uav-crack-depth",
      doi: "10.5555/icrps-demo-0004",
      authors: ["架空 六郎", "架空 七子"],
      country: "JP",
      publicationDate: "2025-01-27",
      sourceName: "デモ用 構造物診断学会誌",
      classifications: ["G06T7/00", "E01D22/00"],
      status: null
    },
    {
      n: 5,
      sourceType: "paper",
      title: "【デモ用】炭素繊維シート接着補強の疲労耐久性に関する解析的検討",
      originalTitle: "Fatigue Durability of CFRP-Strengthened RC Members (Demo)",
      abstract:
        "既設RC部材への炭素繊維シート接着補強について、疲労荷重下の解析的検討を行った架空研究。補強後のひび割れ開口変位は非補強比で約55%低減し、シート端部の剥離応力集中が疲労寿命を支配することを示した。",
      url: "https://example.jp/demo/cfrp-fatigue",
      doi: "10.5555/icrps-demo-0005",
      authors: ["架空 八郎"],
      country: "JP",
      publicationDate: "2023-12-08",
      sourceName: "デモ用 複合構造シンポジウム",
      classifications: ["E04G23/02", "B32B5/00"],
      status: null
    },
    {
      n: 6,
      sourceType: "patent",
      title: "【デモ用】高炉スラグ高置換コンクリート用混和材およびその製造方法",
      originalTitle: "Admixture for High-Volume GGBS Concrete and Manufacturing Method (Demo)",
      abstract:
        "高炉スラグ高置換コンクリートの初期強度を向上させる混和材に関する架空特許。特定のアルカリ刺激剤と硫酸塩の組み合わせにより、材齢3日強度を従来比で1.4倍にできるとされる。",
      url: "https://example.jp/demo/patent-ggbs-admixture",
      patentNumber: "JP2026-000001A",
      publicationNumber: "JP2026-000001A",
      inventors: ["架空 一郎", "架空 二郎"],
      applicants: ["架空建設工業（株）"],
      country: "JP",
      publicationDate: "2026-02-10",
      sourceName: "デモ用 特許公報",
      classifications: ["C04B22/00", "C04B24/00"],
      patentStatus: "公開"
    },
    {
      n: 7,
      sourceType: "patent",
      title: "【デモ用】コンクリート構造物のひび割れ自動検出システム",
      originalTitle: "Automated Crack Detection System for Concrete Structures (Demo)",
      abstract:
        "UAV撮影画像からひび割れを自動検出・分類するシステムに関する架空特許。セグメンテーションモデルと3次元計測を組み合わせ、ひび割れ幅・長さ・方向を可視化する。",
      url: "https://example.jp/demo/patent-uav-crack",
      patentNumber: "US2026/000001A1",
      publicationNumber: "US2026/000001A1",
      inventors: ["Fictional Inventor A", "Fictional Inventor B"],
      applicants: ["Demo Bridge Tech Inc."],
      country: "US",
      publicationDate: "2025-09-30",
      sourceName: "デモ用 US Patent Publication",
      classifications: ["G06T7/00", "G01B11/00"],
      patentStatus: "審査中"
    },
    {
      n: 8,
      sourceType: "patent",
      title: "【デモ用】海洋環境用コンクリート表層含浸材組成物",
      originalTitle: "Surface Impregnation Composition for Marine Concrete (Demo)",
      abstract:
        "シラン系・フルオロアルキル系の複合含浸材に関する架空特許。塩化物イオン浸透を抑制しつつ、表面の撥水性を3年間維持する。",
      url: "https://example.jp/demo/patent-impregnation",
      patentNumber: "JP2025-012345A",
      publicationNumber: "JP2025-012345A",
      inventors: ["架空 花子", "架空 四郎"],
      applicants: ["架空マテリアル（株）"],
      country: "JP",
      publicationDate: "2025-04-22",
      sourceName: "デモ用 特許公報",
      classifications: ["C09K3/18", "C04B41/45"],
      patentStatus: "登録"
    },
    {
      n: 9,
      sourceType: "patent",
      title: "【デモ用】既設橋梁の炭素繊維シート補強工法",
      originalTitle: "CFRP Sheet Strengthening Method for Existing Bridges (Demo)",
      abstract:
        "既設橋梁の下面に炭素繊維シートを格子状に接着する工法に関する架空特許。定着端部の応力集中を低減するアンカー構造を特徴とする。",
      url: "https://example.jp/demo/patent-cfrp-bridge",
      patentNumber: "EP4000001A1",
      publicationNumber: "EP4000001A1",
      inventors: ["Fictional Inventor C"],
      applicants: ["Demo Construction EU GmbH"],
      country: "EP",
      publicationDate: "2024-06-14",
      sourceName: "デモ用 European Patent Bulletin",
      classifications: ["E01D22/00", "E04G23/02"],
      patentStatus: "公開"
    },
    {
      n: 10,
      sourceType: "web",
      title: "【デモ用】国土交通省：公共工事における脱炭素化の取組事例集",
      originalTitle: null,
      abstract:
        "公共工事でのCO2排出量可視化と低炭素材料採用の架空事例集。試行工事における高炉スラグ高置換コンクリートの採用実績と、発注者向けの評価指標案が紹介されている。",
      url: "https://example.jp/demo/mlit-decarbonization",
      authors: [],
      country: "JP",
      publicationDate: "2026-01-15",
      sourceName: "デモ用 国土交通省技術調査",
      classifications: [],
      status: null
    },
    {
      n: 11,
      sourceType: "web",
      title: "【デモ用】土木研究所：海洋コンクリート構造物の維持管理マニュアル",
      originalTitle: null,
      abstract:
        "飛沫帯・干満帯のコンクリート構造物を対象とした架空の維持管理マニュアル。点検区分、塩化物イオン濃度測定、補修・電気防食の選定フローを収録する。",
      url: "https://example.jp/demo/pwri-marine-manual",
      authors: [],
      country: "JP",
      publicationDate: "2025-05-30",
      sourceName: "デモ用 土木研究所刊行物",
      classifications: [],
      status: null
    },
    {
      n: 12,
      sourceType: "web",
      title: "【デモ用】UAV橋梁点検の撮影計画と安全管理の手引き",
      originalTitle: null,
      abstract:
        "橋梁点検へのUAV適用における飛行計画、地上分解能の設定、第三者安全管理、記録様式を解説した架空の手引き。",
      url: "https://example.jp/demo/uav-guide",
      authors: [],
      country: "JP",
      publicationDate: "2025-08-05",
      sourceName: "デモ用 関東地整技術情報",
      classifications: [],
      status: null
    },
    {
      n: 13,
      sourceType: "web",
      title: "【デモ用】EUにおける低炭素セメント規格案の概要",
      originalTitle: "Overview of Draft EU Low-Carbon Cement Standard (Demo)",
      abstract:
        "EUで検討中の低炭素セメント規格案について、性能区分と検証方法をまとめた架空の解説記事。LC3や高炉スラグ高置換材の適合性が議論されている。",
      url: "https://example.jp/demo/eu-lowcarbon-standard",
      authors: [],
      country: "DE",
      publicationDate: "2025-11-12",
      sourceName: "デモ用 海外技術情報",
      classifications: [],
      status: null
    },
    {
      n: 14,
      sourceType: "pdf",
      title: "【デモ用】コンクリート標準示方書（設計編）抜粋デモ資料",
      originalTitle: null,
      abstract:
        "耐久性照査と材料選定に関する架空の抜粋資料。塩害環境におけるかぶりと配合の関係を表形式で整理している。",
      url: "https://example.jp/demo/std-spec-excerpt",
      authors: [],
      country: "JP",
      publicationDate: "2024-04-01",
      sourceName: "デモ用 標準示方書データ",
      classifications: ["E01D101/00"],
      status: null
    },
    {
      n: 15,
      sourceType: "pdf",
      title: "【デモ用】橋梁点検要領（デモ版）付録：UAV点検の記録様式",
      originalTitle: null,
      abstract:
        "UAV点検の記録様式（撮影条件・ひび割れマップ・判定区分）の架空サンプル。点検調書の入力項目と写真管理方法を説明する。",
      url: "https://example.jp/demo/inspection-form",
      authors: [],
      country: "JP",
      publicationDate: "2023-10-10",
      sourceName: "デモ用 点検要領資料",
      classifications: [],
      status: null
    },
    {
      n: 16,
      sourceType: "patent",
      title: "【デモ用】高炉スラグ高置換コンクリートの養生促進方法",
      originalTitle: "Curing Acceleration Method for High-Volume GGBS Concrete (Demo)",
      abstract:
        "高炉スラグ高置換コンクリートの初期強度を高める養生方法に関する架空特許。蒸気養生と混和材の組合せにより、寒中施工でも材齢3日強度を確保できるとされる。",
      url: "https://example.jp/demo/patent-ggbs-curing",
      patentNumber: "JP2026-000100A",
      publicationNumber: "JP2026-000100A",
      inventors: ["架空 一郎", "架空 三郎"],
      applicants: ["架空建設工業（株）"],
      country: "JP",
      publicationDate: "2026-03-05",
      sourceName: "デモ用 特許公報",
      classifications: ["C04B22/00", "C04B24/00", "C04B40/00"],
      patentStatus: "公開"
    }
  ];

  const docIds = {};
  for (const d of docs) {
    const id = randomUUID();
    docIds[d.n] = id;
    await sql.query(
      `INSERT INTO source_documents
       (id, source_type, title, original_title, abstract, body_text, url, doi, patent_number,
        publication_number, authors, inventors, applicants, country, publication_date, source_name,
        license_note, content_hash, classifications, patent_status)
       VALUES ($1,$2,$3,$4,$5,NULL,$6,$7,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15,
               $16,$17,$18::jsonb,$19)`,
      [
        id, d.sourceType, d.title, d.originalTitle ?? null, d.abstract ?? null,
        d.url ?? null, d.doi ?? null, d.patentNumber ?? null, d.publicationNumber ?? null,
        j(d.authors ?? []), j(d.inventors ?? []), j(d.applicants ?? []),
        d.country ?? null, d.publicationDate ?? null, d.sourceName ?? DEMO_SOURCE,
        "デモ用ダミーデータ（架空・実在情報なし）", `demo-${String(d.n).padStart(3, "0")}`,
        j(d.classifications ?? []), d.patentStatus ?? null
      ]
    );
  }

  // ---------- 検索履歴（完了済み）と検索結果 ----------
  const searches = [
    {
      n: 1,
      user: adminId,
      project: projectLowCarbon,
      query: "低炭素コンクリート 海洋環境 塩害 実証データ",
      sources: ["paper", "patent", "web"],
      filters: { languageMode: "bilingual", countries: ["JP", "US", "EP"], yearFrom: 2020, yearTo: 2026, includeSynonyms: true, includeTranslation: true },
      expansion: {
        originalQuery: "低炭素コンクリート 海洋環境 塩害 実証データ",
        translatedQueries: ["low carbon concrete marine environment chloride"],
        synonymsJa: ["低炭素セメント", "高炉スラグ高置換コンクリート"],
        synonymsEn: ["low-carbon concrete", "GGBS concrete", "marine exposure"],
        recommendedSearchQueries: ["LC3 海洋 耐久性", "geopolymer marine concrete"]
      },
      docs: [1, 6, 10, 13, 2, 16],
      bookmarked: true,
      daysAgo: 3
    },
    {
      n: 2,
      user: adminId,
      project: projectUav,
      query: "UAV 点検 ひび割れ 深さ推定",
      sources: ["paper", "patent", "web"],
      filters: { languageMode: "bilingual", countries: ["JP", "US"], yearFrom: 2022, yearTo: 2026, includeSynonyms: true, includeTranslation: true },
      expansion: {
        originalQuery: "UAV 点検 ひび割れ 深さ推定",
        translatedQueries: ["UAV bridge inspection crack depth estimation"],
        synonymsJa: ["ドローン", "橋梁点検"],
        synonymsEn: ["drone inspection", "crack segmentation"],
        recommendedSearchQueries: ["UAV 床版 ひび割れ AI"]
      },
      docs: [4, 7, 12, 15],
      bookmarked: false,
      daysAgo: 1
    },
    {
      n: 3,
      user: researcherId,
      project: projectLowCarbon,
      query: "ジオポリマー 施工性 コスト",
      sources: ["paper", "web"],
      filters: { languageMode: "ja", countries: [], yearFrom: 2021, yearTo: 2026, includeSynonyms: false, includeTranslation: false },
      expansion: {
        originalQuery: "ジオポリマー 施工性 コスト",
        translatedQueries: [],
        synonymsJa: ["ジオポリマーコンクリート"],
        synonymsEn: ["geopolymer workability cost"],
        recommendedSearchQueries: []
      },
      docs: [3, 13, 6],
      bookmarked: false,
      daysAgo: 5
    }
  ];

  const searchIds = {};
  for (const s of searches) {
    const id = randomUUID();
    searchIds[s.n] = id;
    await sql.query(
      `INSERT INTO search_queries
       (id, user_id, project_id, query_text, expanded_queries, source_types, filters, status, failure_sources, executed_at, is_bookmarked)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7::jsonb,'completed',$8::jsonb,$9,$10)`,
      [
        id, s.user, s.project, s.query, j(s.expansion), j(s.sources), j(s.filters),
        j([]), daysAgo(s.daysAgo, 10), s.bookmarked
      ]
    );
    await Promise.all(
      s.docs.map(async (docN, idx) => {
        await sql.query(
          `INSERT INTO search_results (id, search_query_id, source_document_id, rank, relevance_score, matched_keywords)
           VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
          [
            randomUUID(), id, docIds[docN], idx + 1,
            Math.round((96 - idx * 5 + Math.random() * 2) * 100) / 100,
            j([s.query.split(" ")[0]])
          ]
        );
      })
    );
  }

  // ---------- プロジェクト保存文献 ----------
  const projectDocs = [
    { project: projectLowCarbon, doc: 1, tags: ["低炭素", "実証"], importance: 5, status: "reviewed", note: "10年暴露データは次期提案の根拠として採用。" },
    { project: projectLowCarbon, doc: 2, tags: ["LC3", "材料"], importance: 4, status: "saved", note: "強度発現の課題を現場配合で確認する。" },
    { project: projectLowCarbon, doc: 3, tags: ["ジオポリマー", "施工"], importance: 3, status: "saved", note: "養生温度の実現性が論点。" },
    { project: projectLowCarbon, doc: 6, tags: ["特許", "混和材"], importance: 4, status: "saved", note: "権利範囲の確認が必要。" },
    { project: projectLowCarbon, doc: 16, tags: ["特許", "養生"], importance: 3, status: "saved", note: "同族候補として管理。" },
    { project: projectLowCarbon, doc: 10, tags: ["事例"], importance: 3, status: "saved", note: "発注者動向の参考。" },
    { project: projectLowCarbon, doc: 13, tags: ["規格"], importance: 2, status: "excluded", note: "EU規格は国内適用外として保留。" },
    { project: projectLowCarbon, doc: 14, tags: ["示方書"], importance: 4, status: "reviewed", note: "耐久性照査の前提として確認済み。" },
    { project: projectUav, doc: 4, tags: ["UAV", "AI"], importance: 5, status: "reviewed", note: "精度検証結果を採用。" },
    { project: projectUav, doc: 7, tags: ["特許", "システム"], importance: 4, status: "saved", note: "類似システムの特許調査対象。" },
    { project: projectUav, doc: 12, tags: ["手引き"], importance: 3, status: "saved", note: "現場試験の計画に使用。" },
    { project: projectUav, doc: 15, tags: ["様式"], importance: 2, status: "saved", note: "記録様式の雛形。" },
    { project: projectRepair, doc: 8, tags: ["含浸材", "特許"], importance: 4, status: "saved", note: "飛沫帯の候補材料。" },
    { project: projectRepair, doc: 11, tags: ["マニュアル"], importance: 5, status: "reviewed", note: "維持管理フローの基本文献。" },
    { project: projectRepair, doc: 1, tags: ["暴露", "塩害"], importance: 4, status: "saved", note: "補修効果の定量根拠として参照。" },
    { project: projectPcDeck, doc: 5, tags: ["CFRP", "補強"], importance: 3, status: "saved", note: "疲労設計の参考。" },
    { project: projectPcDeck, doc: 9, tags: ["特許", "補強工法"], importance: 3, status: "saved", note: "工法特許の確認対象。" }
  ];
  for (const p of projectDocs) {
    await sql.query(
      `INSERT INTO project_documents (id, project_id, source_document_id, user_note, tags, importance, status)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7)`,
      [randomUUID(), p.project, docIds[p.doc], p.note, j(p.tags), p.importance, p.status]
    );
  }

  // ---------- AI 要約（レビュー状態を含む） ----------
  const summaryDefs = [
    {
      doc: 1, type: "detailed", lang: "ja", status: "approved", reviewedBy: adminId,
      text: "高炉スラグ高置換コンクリート（置換率70%）を海洋飛沫帯に10年間暴露した架空の試験結果に基づく要約です。塩化物イオン浸透抵抗性は普通コンクリート比で約60%向上し、表面ひび割れ幅も平均0.08mm以下に抑制されました。実構造物での適用には、初期強度の確保と養生管理が重要です。",
      points: ["拡散係数 約60%低減", "ひび割れ幅 0.08mm以下", "含浸材併用で補修サイクル延長"],
      merits: ["耐久性向上", "CO2排出削減"],
      demerits: ["初期強度が低い", "養生期間の延伸"],
      conditions: ["設計強度40N/mm²以上", "水結合材比0.35以下", "飛沫帯・干満帯に適用可"],
      risks: ["養生不足で表層品質低下", "低温時の強度発現遅延"]
    },
    {
      doc: 1, type: "technical", lang: "ja", status: "edited", reviewedBy: researcherId,
      text: "技術者向けに要点を整理した要約です（デモ編集済み）。置換率70%の高炉スラグコンクリートは拡散係数を約60%低減し、飛沫帯の塩害対策として有望です。配合・養生条件を実現場の要求性能に合わせて調整してください。",
      points: ["配合設計の要点", "養生条件の管理値"],
      merits: [], demerits: [], conditions: [], risks: []
    },
    { doc: 2, type: "detailed", lang: "ja", status: "pending", reviewedBy: null,
      text: "LC3-50は材齢28日で普通セメントの約85%の強度を発現し、91日で同等となる架空の結果です。クリンカー使用量削減によるCO2排出低減効果が期待されますが、原料の入手性と粉砕エネルギーが課題です。",
      points: ["28日強度 約85%", "91日で同等", "エトリンガイト安定化"],
      merits: ["CO2排出量の大幅削減", "石灰石・クレーの入手性"],
      demerits: ["粉砕コスト", "品質管理項目の増加"],
      conditions: ["クリンカー置換率50%", "焼成クレーの品質管理"],
      risks: ["原料変動による品質ばらつき"] },
    { doc: 3, type: "detailed", lang: "ja", status: "pending", reviewedBy: null,
      text: "フライアッシュ系ジオポリマーコンクリートは耐酸性に優れる一方、60℃の養生が必要でポンプ圧送距離に制約がある架空の評価です。施工計画では凝結時間と養生方法の事前検証が不可欠です。",
      points: ["質量減少率 約70%低減", "養生温度60℃", "凝結時間の管理が課題"],
      merits: ["高い耐酸性", "CO2排出削減"],
      demerits: ["養生設備が必要", "圧送性が劣る"],
      conditions: ["養生温度60℃", "pH2以下の環境"],
      risks: ["養生不足で強度低下"] },
    { doc: 4, type: "technical", lang: "ja", status: "approved", reviewedBy: adminId,
      text: "UAV画像によるひび割れ検出率92%、深さ推定誤差±15%という架空の精度検証結果です。0.2mm以上のひび割れを対象とし、日照・影の影響を考慮した撮影計画が精度確保の要点です。",
      points: ["検出率92%", "平均誤差±15%", "解像度1mm/pixel"],
      merits: ["足場不要", "広範囲を短時間で計測"],
      demerits: ["影の影響", "深部評価は不可"],
      conditions: ["地上解像度1mm/pixel", "日中順光"],
      risks: ["樹木・車両による死角"] },
    { doc: 5, type: "short", lang: "ja", status: "pending", reviewedBy: null,
      text: "CFRPシート接着補強は疲労荷重下のひび割れ開口を約55%低減する架空の解析結果です。定着端部の剥離対策が寿命の支配要因です。", points: [], merits: [], demerits: [], conditions: [], risks: [] },
    { doc: 6, type: "patent", lang: "ja", status: "pending", reviewedBy: null,
      text: "高炉スラグ高置換コンクリートの初期強度を高める混和材に関する架空特許です。アルカリ刺激剤と硫酸塩の組合せで材齢3日強度を1.4倍にします。請求項は成分比率と製造工程に及びます。",
      points: ["3日強度1.4倍", "アルカリ刺激剤+硫酸塩"],
      merits: ["初期強度の確保", "スラグ置換率の拡大"],
      demerits: ["アルカリ量の管理"],
      conditions: ["置換率50〜80%"],
      risks: ["アルカリ骨材反応の確認"] },
    { doc: 7, type: "patent", lang: "ja", status: "approved", reviewedBy: adminId,
      text: "UAV画像からひび割れを自動検出するシステムの架空特許です。セグメンテーションと3次元計測の組合せが特徴で、幅・長さ・方向を自動で記録します。",
      points: ["自動検出・分類", "3次元計測連携"],
      merits: ["点検記録の自動化"],
      demerits: ["精度は撮影条件に依存"],
      conditions: ["解像度1mm/pixel以上"],
      risks: ["特許抵触調査が必要"] },
    { doc: 8, type: "patent", lang: "ja", status: "pending", reviewedBy: null,
      text: "シラン系・フルオロアルキル系の複合含浸材に関する架空特許です。塩化物イオン浸透の抑制と撥水性の3年維持を特徴とします。",
      points: ["3年撥水性維持", "塩分浸透抑制"],
      merits: ["施工が簡易", "外観変化が小さい"],
      demerits: ["効果の持続性検証が必要"],
      conditions: ["飛沫帯・干満帯"],
      risks: ["下地含水率の管理"] },
    { doc: 10, type: "short", lang: "ja", status: "pending", reviewedBy: null,
      text: "公共工事の脱炭素化を扱う架空の事例集です。高炉スラグ高置換コンクリートの試行実績と発注者向け評価指標が紹介されています。", points: [], merits: [], demerits: [], conditions: [], risks: [] },
    { doc: 11, type: "detailed", lang: "ja", status: "pending", reviewedBy: null,
      text: "海洋コンクリート構造物の維持管理を体系的に整理した架空マニュアルです。点検区分と塩化物イオン濃度に基づく補修・電気防食の選定フローが収録されています。",
      points: ["選定フロー収録", "点検区分の定義"],
      merits: ["現場適用性が高い"],
      demerits: ["最新知見の反映が必要"],
      conditions: ["飛沫帯・干満帯"],
      risks: [] },
    { doc: 12, type: "short", lang: "ja", status: "pending", reviewedBy: null,
      text: "UAV橋梁点検の撮影計画と安全管理を解説する架空の手引きです。飛行計画・分解能設定・記録様式を収録します。", points: [], merits: [], demerits: [], conditions: [], risks: [] },
    { doc: 14, type: "short", lang: "ja", status: "pending", reviewedBy: null,
      text: "耐久性照査と材料選定を整理した架空の抜粋資料です。塩害環境のかぶりと配合の関係を表形式で示します。", points: [], merits: [], demerits: [], conditions: [], risks: [] },
    { doc: 15, type: "short", lang: "ja", status: "pending", reviewedBy: null,
      text: "UAV点検の記録様式を解説する架空サンプルです。撮影条件・ひび割れマップ・判定区分の記入例を収録します。", points: [], merits: [], demerits: [], conditions: [], risks: [] },
    { doc: 16, type: "patent", lang: "ja", status: "pending", reviewedBy: null,
      text: "高炉スラグ高置換コンクリートの養生促進方法に関する架空特許です。蒸気養生と混和材の組合せで寒中施工時の初期強度を確保します。",
      points: ["寒中施工対応", "3日強度確保"],
      merits: ["施工時期の拡大"],
      demerits: ["養生設備が必要"],
      conditions: ["置換率50〜80%"],
      risks: ["熱養生によるひび割れリスク"] }
  ];

  for (const s of summaryDefs) {
    const id = randomUUID();
    await sql.query(
      `INSERT INTO ai_summaries
       (id, source_document_id, summary_type, language, summary_text, key_points, merits, demerits,
        application_conditions, risks, citations, model_name, prompt_version, status, reviewed_by, reviewed_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9::jsonb,$10::jsonb,$11::jsonb,$12,$13,$14,$15,$16)`,
      [
        id, docIds[s.doc], s.type, s.lang, s.text,
        j(s.points), j(s.merits), j(s.demerits), j(s.conditions), j(s.risks),
        j([
          { claim: "本要約はデモ用の架空データに基づく", sourceUrl: "https://example.jp/demo/", quote: s.text.slice(0, 40) }
        ]),
        "rule-based-fallback", "v1-template", s.status, s.reviewedBy,
        s.reviewedBy ? daysAgo(1, 14) : null
      ]
    );
  }

  // ---------- 比較表 ----------
  const comparisonLowCarbon = randomUUID();
  const comparisonUav = randomUUID();
  await sql.query(
    `INSERT INTO comparisons (id, project_id, title, comparison_axes, rows, notes) VALUES
     ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb),
     ($7, $8, $9, $10::jsonb, $11::jsonb, $12::jsonb)`,
    [
      comparisonLowCarbon, projectLowCarbon,
      "低炭素コンクリート3技術の比較（デモ）",
      j(["技術概要", "適用条件", "主なメリット", "主なデメリット", "施工性・コスト傾向", "関連特許・実績"]),
      j([
        {
          technologyName: "高炉スラグ高置換コンクリート",
          values: {
            "技術概要": "セメントを高炉スラグで50〜70%置換",
            "適用条件": "海洋飛沫帯・一般構造物",
            "主なメリット": "CO2削減・塩分浸透抵抗性向上",
            "主なデメリット": "初期強度・養生管理",
            "施工性・コスト傾向": "既存プラントで対応可・材料費やや増",
            "関連特許・実績": "デモ特許JP2026-000001A・暴露実績あり"
          },
          sourceDocumentIds: [docIds[1], docIds[6], docIds[10]]
        },
        {
          technologyName: "LC3",
          values: {
            "技術概要": "石灰石と焼成クレーでクリンカーを置換",
            "適用条件": "一般構造物・プレキャスト",
            "主なメリット": "CO2排出量を約40%削減",
            "主なデメリット": "原料粉砕と品質管理",
            "施工性・コスト傾向": "粉砕設備が必要・初期投資大",
            "関連特許・実績": "デモ論文・海外実績中心"
          },
          sourceDocumentIds: [docIds[2], docIds[13]]
        },
        {
          technologyName: "ジオポリマーコンクリート",
          values: {
            "技術概要": "アルカリ活性化によるセメントレス材料",
            "適用条件": "耐酸性・高温養生が可能な現場",
            "主なメリット": "高い耐酸性・CO2削減",
            "主なデメリット": "60℃養生・圧送性",
            "施工性・コスト傾向": "養生設備が必要・躯体コスト高",
            "関連特許・実績": "デモ論文・実績少"
          },
          sourceDocumentIds: [docIds[3]]
        }
      ]),
      j(["デモ用の架空比較です。最終判断には原典確認が必要です。"]),
      comparisonUav, projectUav,
      "UAV点検手法の比較（デモ）",
      j(["技術概要", "適用条件", "主なメリット", "主なデメリット", "施工性・コスト傾向", "関連特許・実績"]),
      j([
        {
          technologyName: "UAV外観撮影＋AIひび割れ解析",
          values: {
            "技術概要": "UAV画像をセグメンテーションで解析",
            "適用条件": "橋梁・高所構造物",
            "主なメリット": "足場不要・短時間で広範囲計測",
            "主なデメリット": "影・天候の影響",
            "施工性・コスト傾向": "導入費中・運用費低",
            "関連特許・実績": "デモ特許US2026/000001A1"
          },
          sourceDocumentIds: [docIds[4], docIds[7], docIds[12]]
        },
        {
          technologyName: "従来の目視点検",
          values: {
            "技術概要": "近接目視によるひび割れ調査",
            "適用条件": "全構造物",
            "主なメリット": "制度実績・判断基準が確立",
            "主なデメリット": "足場・交通規制が必要",
            "施工性・コスト傾向": "足場費が支配的",
            "関連特許・実績": "実績多数"
          },
          sourceDocumentIds: [docIds[15], docIds[11]]
        }
      ]),
      j(["デモ用の架空比較です。"])
    ]
  );

  // ---------- レポート ----------
  const reportMd1 = `# 低炭素コンクリートの実用化調査（デモレポート）

> 生成日時: ${daysAgo(2, 9)}

## 1. 調査概要
- 調査テーマ: 低炭素コンクリートの実用化調査（デモ）
- 調査目的: 高炉スラグ高置換・LC3・ジオポリマーの3技術を海洋環境での耐久性と施工性から比較する
- 想定読者: 技術研究所内（専門家）

## 2. 検索条件
- 検索語: 低炭素コンクリート 海洋環境 塩害 実証データ
- 対象ソース: paper, patent, web

## 3. 比較表
| 比較項目 | 高炉スラグ高置換コンクリート | LC3 | ジオポリマーコンクリート |
| --- | --- | --- | --- |
| 技術概要 | セメントを高炉スラグで50〜70%置換 | 石灰石と焼成クレーでクリンカーを置換 | アルカリ活性化によるセメントレス材料 |
| 適用条件 | 海洋飛沫帯・一般構造物 | 一般構造物・プレキャスト | 耐酸性・高温養生が可能な現場 |
| 主なメリット | CO2削減・塩分浸透抵抗性向上 | CO2排出量を約40%削減 | 高い耐酸性・CO2削減 |
| 主なデメリット | 初期強度・養生管理 | 原料粉砕と品質管理 | 60℃養生・圧送性 |

## 4. 各技術の詳細
- 【デモ用】高炉スラグ高置換コンクリートの海洋飛沫帯暴露試験（10年）
- 【デモ用】LC3（石灰石焼成クレーセメント）の水和特性と強度発現
- 【デモ用】ジオポリマーコンクリートの耐酸性と施工性評価

## 5. 注意点・未確認事項
- 本レポートはデモ用の架空データに基づきます。
- 特許・設計・施工・安全性の最終判断には原典確認と専門家確認が必要です。

## 6. 参考文献・出典
- 【デモ用】高炉スラグ高置換コンクリートの海洋飛沫帯暴露試験（10年）
- 【デモ用】LC3（石灰石焼成クレーセメント）の水和特性と強度発現
- 【デモ用】ジオポリマーコンクリートの耐酸性と施工性評価

---

> 本システムのAI要約・比較結果は、公開情報に基づく調査支援情報です。特許の権利判断、設計判断、施工可否、安全性判断を保証するものではありません。重要な判断には、原典確認および専門家確認を行ってください。
> テンプレート: 技術比較レポート（デモ）`;

  const reportMd2 = `# 塩害環境向け補修材料の特許調査（デモレポート）

## 1. 調査概要
- 調査テーマ: 塩害環境向け補修材料の比較調査（デモ）
- 調査目的: 飛沫帯を対象に断面修復材・含浸材・電気防食の適用条件を整理する

## 2. 主要特許一覧
- 【デモ用】海洋環境用コンクリート表層含浸材組成物

## 3. 関連する論文・資料
- 【デモ用】土木研究所：海洋コンクリート構造物の維持管理マニュアル

## 4. 注意点・未確認事項
- 本レポートはデモ用の架空データに基づきます。

## 5. 参考文献・出典
- 【デモ用】海洋環境用コンクリート表層含浸材組成物
- 【デモ用】土木研究所：海洋コンクリート構造物の維持管理マニュアル

> デモ用レポートです。`;

  const reportMd3 = `# UAV点検と画像診断の適用性評価（デモレポート）

## 1. 調査概要
- 調査テーマ: UAV点検と画像診断の適用性評価（デモ）

## 2. 関連論文
- 【デモ用】UAV画像によるコンクリートひび割れ深さ推定の精度検証
- 【デモ用】橋梁点検要領（デモ版）付録：UAV点検の記録様式

## 3. 注意点・未確認事項
- 精度は撮影条件に依存するため、現場での検証が必要です。

## 4. 参考文献・出典
- 【デモ用】UAV画像によるコンクリートひび割れ深さ推定の精度検証

> デモ用レポートです。`;

  await sql.query(
    `INSERT INTO reports (id, project_id, title, report_type, content_markdown, export_file_url, created_by) VALUES
     ($1,$2,$3,'technical_comparison',$4,NULL,$5),
     ($6,$7,$8,'patent_survey',$9,NULL,$10),
     ($11,$12,$13,'paper_review',$14,NULL,$15)`,
    [
      randomUUID(), projectLowCarbon, "低炭素コンクリートの実用化調査（デモ）", reportMd1, adminId,
      randomUUID(), projectRepair, "塩害環境向け補修材料の特許調査（デモ）", reportMd2, adminId,
      randomUUID(), projectUav, "UAV点検と画像診断の適用性評価（デモ）", reportMd3, researcherId
    ]
  );

  // ---------- ウォッチテーマ ----------
  const watch1 = randomUUID();
  const watch2 = randomUUID();
  const watch3 = randomUUID();
  const watch4 = randomUUID();
  await sql.query(
    `INSERT INTO watch_topics
     (id, user_id, project_id, keyword, frequency, display_name, terms, enabled, last_checked_at, last_new_count)
     VALUES
     ($1,$2,$3,$4,'weekly',$5,$6,true,$7,3),
     ($8,$9,$10,$11,'weekly',$12,$13,true,$14,1),
     ($15,$16,$17,$18,'monthly',$19,$20,true,$21,0),
     ($22,$23,$24,$25,'weekly',$26,$27,false,$28,0)`,
    [
      watch1, adminId, projectLowCarbon, "低炭素コンクリート",
      "低炭素コンクリート", "低炭素, CO2削減, 高炉スラグ, LC3", daysAgo(1, 6), 
      watch2, adminId, projectUav, "UAV橋梁点検",
      "UAV橋梁点検", "UAV, ドローン, ひび割れ, 橋梁点検", daysAgo(1, 6),
      watch3, researcherId, projectLowCarbon, "ジオポリマー",
      "ジオポリマー", "geopolymer, ジオポリマー, 施工性", daysAgo(2, 6),
      watch4, adminId, projectRepair, "塩害補修",
      "塩害補修", "塩害, 断面修復, 含浸材", daysAgo(4, 6)
    ]
  );

  // ---------- 通知 ----------
  await sql.query(
    `INSERT INTO notifications
     (id, user_id, watch_topic_id, source_document_id, kind, title, body, url, read_at, created_at)
     VALUES
     ($1,$2,$3,$4,'watch',$5,$6,$7,$8,$9),
     ($10,$11,$12,$13,'watch',$14,$15,$16,$17,$18),
     ($19,$20,$21,$22,'system',$23,$24,$25,$26,$27),
     ($28,$29,$30,$31,'baseline',$32,$33,$34,$35,$36),
     ($37,$38,$39,$40,'watch',$41,$42,$43,$44,$45),
     ($46,$47,$48,$49,'system',$50,$51,$52,$53,$54)`,
    [
      randomUUID(), adminId, watch1, docIds[1],
      "【新着】海洋飛沫帯暴露試験の新規文献（デモ）",
      "ウォッチテーマ「低炭素コンクリート」に新着候補が3件あります。", docIds[1] ? "https://example.jp/demo/ggbs-marine-exposure" : null, null, daysAgo(1, 7),
      randomUUID(), adminId, watch1, docIds[10],
      "【新着】脱炭素化の取組事例集（デモ）",
      "公共工事の脱炭素化に関する新着情報です。", "https://example.jp/demo/mlit-decarbonization", null, daysAgo(1, 8),
      randomUUID(), adminId, null, null,
      "【デモ環境】ダミーデータ投入のご案内",
      "この環境には架空のデモデータが投入されています。操作・評価は自由に行えます。", null, null, daysAgo(0, 9),
      randomUUID(), adminId, null, null,
      "【ベースライン】デモデータ初期化完了",
      "デモ用のプロジェクト・文献・レポート・通知を初期化しました。", null, daysAgo(0, 8), daysAgo(1, 9),
      randomUUID(), researcherId, watch3, docIds[3],
      "【新着】ジオポリマーの耐酸性評価（デモ）",
      "ウォッチテーマ「ジオポリマー」に新着候補が1件あります。", "https://example.jp/demo/geopolymer-acid", null, daysAgo(2, 7),
      randomUUID(), researcherId, null, null,
      "【システム】チーム招待の確認（デモ）",
      "材料技術グループ（デモ）への参加状態を確認してください。", null, null, daysAgo(3, 9)
    ]
  );

  // ---------- 監査ログ（デモ操作分） ----------
  const auditDefs = [
    { user: adminId, action: "auth.login", days: 0, detail: { method: "cookie" } },
    { user: adminId, action: "project.create", days: 6, resourceType: "project", detail: { title: "低炭素コンクリートの実用化調査（デモ）" } },
    { user: adminId, action: "search.execute", days: 5, resourceType: "search_query", detail: { query: "低炭素コンクリート 海洋環境 塩害 実証データ", resultCount: 5 } },
    { user: adminId, action: "document.save", days: 5, resourceType: "project_document", detail: { projectId: projectLowCarbon, documentId: docIds[1] } },
    { user: adminId, action: "summary.review", days: 4, resourceType: "ai_summary", detail: { status: "approved" } },
    { user: adminId, action: "comparison.create", days: 3, resourceType: "comparison", detail: { projectId: projectLowCarbon, documentCount: 3 } },
    { user: adminId, action: "report.create", days: 2, resourceType: "report", detail: { reportType: "technical_comparison", mode: "template" } },
    { user: adminId, action: "report.export", days: 2, resourceType: "report", detail: { format: "markdown" } },
    { user: adminId, action: "watch.create", days: 4, resourceType: "watch_topic", detail: { displayName: "低炭素コンクリート" } },
    { user: adminId, action: "watch.run_manual", days: 1, resourceType: "watch_topic", detail: { topicCount: 2 } },
    { user: adminId, action: "admin.ingest_manual", days: 1, resourceType: "system", detail: { results: [{ source: "jstage", status: "ok", inserted: 0, skipped: 10 }] } },
    { user: adminId, action: "admin.user_role_update", days: 7, resourceType: "user", detail: { role: "viewer" } },
    { user: researcherId, action: "auth.login", days: 1, detail: { method: "cookie" } },
    { user: researcherId, action: "chat.answer", days: 1, detail: { mode: "rule" } },
    { user: researcherId, action: "document.import", days: 3, resourceType: "source_document", detail: { created: true, sourceType: "pdf" } },
    { user: viewerId, action: "auth.login", days: 2, detail: { method: "cookie" } },
    { user: viewerId, action: "project.view", days: 2, resourceType: "project", detail: { role: "viewer" } }
  ];
  for (const a of auditDefs) {
    await sql.query(
      `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, detail, created_at)
       VALUES ($1,$2,$3,$4,NULL,$5::jsonb,$6)`,
      [randomUUID(), a.user, a.action, a.resourceType ?? null, j(a.detail ?? {}), daysAgo(a.days, 9 + (a.days % 8))]
    );
  }

  // ---------- LLM 使用量（デモ分） ----------
  const usageDefs = [
    { user: adminId, action: "keyword.expand", provider: "deepseek", model: "deepseek-chat", input: 1200, output: 180, cost: 0.00052, days: 5 },
    { user: adminId, action: "summary.generate", provider: "deepseek", model: "deepseek-chat", input: 2400, output: 620, cost: 0.00133, days: 4 },
    { user: adminId, action: "comparison.generate", provider: "deepseek", model: "deepseek-chat", input: 3100, output: 900, cost: 0.00183, days: 3 },
    { user: adminId, action: "report.generate", provider: "deepseek", model: "deepseek-chat", input: 4200, output: 1500, cost: 0.00278, days: 2 },
    { user: adminId, action: "chat.answer", provider: "deepseek", model: "deepseek-chat", input: 800, output: 240, cost: 0.00048, days: 1 },
    { user: researcherId, action: "keyword.expand", provider: "deepseek", model: "deepseek-chat", input: 900, output: 140, cost: 0.00040, days: 3 },
    { user: researcherId, action: "summary.generate", provider: "deepseek", model: "deepseek-chat", input: 1800, output: 450, cost: 0.00098, days: 2 }
  ];
  for (const u of usageDefs) {
    await sql.query(
      `INSERT INTO llm_usage (id, user_id, action, provider, model, input_tokens, output_tokens, cost_estimate, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [randomUUID(), u.user, u.action, u.provider, u.model, u.input, u.output, u.cost, daysAgo(u.days, 11)]
    );
  }

  // ---------- 結果サマリー ----------
  const counts = {};
  for (const t of [
    "users", "research_projects", "project_members", "teams", "team_members",
    "source_documents", "search_queries", "search_results", "project_documents",
    "ai_summaries", "comparisons", "reports", "watch_topics", "notifications",
    "audit_logs", "llm_usage"
  ]) {
    const r = await sql.query(`SELECT count(*) AS n FROM ${t}`);
    counts[t] = Number(r[0].n);
  }
  console.log("[seed] デモデータ投入完了（冪等・--force で再投入可）");
  console.log("[seed] デモユーザー: demo-admin / demo-researcher / demo-viewer（パスワード: DemoPass-2026!）");
  console.log("[seed] テーブル件数:", JSON.stringify(counts));
}

main().catch((err) => {
  console.error("[seed] 失敗:", err instanceof Error ? err.message : err);
  process.exit(1);
});
