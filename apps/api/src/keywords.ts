import type { ExpandedKeywords, SearchParams } from "@icrps/contracts";
import type { WorkerEnv } from "./env.js";
import { callLlmJson } from "./ai.js";
import type { ActiveAiProvider } from "./settings.js";

// 土木分野の代表語辞書（AI 未設定時のフォールバック用）
export const CIVIL_DICTIONARY: Array<{ ja: string; en: string[]; synonymsJa?: string[] }> = [
  { ja: "コンクリート", en: ["concrete"], synonymsJa: ["コンクリート構造", "生コンクリート"] },
  { ja: "低炭素", en: ["low carbon", "low-carbon", "carbon reduction"], synonymsJa: ["低CO2", "脱炭素"] },
  { ja: "自己治癒", en: ["self-healing", "self repairing"], synonymsJa: ["自己修復"] },
  { ja: "セメント", en: ["cement"] },
  { ja: "鋼", en: ["steel"], synonymsJa: ["鋼材", "鉄骨"] },
  { ja: "鉄筋", en: ["reinforcement", "rebar", "reinforcing bar"] },
  { ja: "トンネル", en: ["tunnel"] },
  { ja: "橋梁", en: ["bridge"], synonymsJa: ["橋"] },
  { ja: "道路", en: ["road", "highway"], synonymsJa: ["舗装"] },
  { ja: "舗装", en: ["pavement", "paving"] },
  { ja: "土工", en: ["earthwork", "earth works"] },
  { ja: "地盤", en: ["ground", "soil", "geotechnical"], synonymsJa: ["地盤改良"] },
  { ja: "液状化", en: ["liquefaction"] },
  { ja: "斜面", en: ["slope"] },
  { ja: "河川", en: ["river", "fluvial"] },
  { ja: "堤防", en: ["levee", "embankment", "dike"] },
  { ja: "ダム", en: ["dam"] },
  { ja: "下水道", en: ["sewer", "sewage"], synonymsJa: ["下水処理"] },
  { ja: "浄水", en: ["water treatment", "water purification"] },
  { ja: "維持管理", en: ["maintenance", "asset management"], synonymsJa: ["点検", "補修"] },
  { ja: "点検", en: ["inspection"] },
  { ja: "補修", en: ["repair", "rehabilitation"], synonymsJa: ["補強"] },
  { ja: "耐震", en: ["seismic", "earthquake resistance"], synonymsJa: ["免震", "制震"] },
  { ja: "免震", en: ["base isolation", "seismic isolation"] },
  { ja: "プレストレス", en: ["prestressed", "prestress"] },
  { ja: "合成構造", en: ["composite structure", "composite construction"] },
  { ja: "3Dプリント", en: ["3d printing", "3d printed", "additive manufacturing"], synonymsJa: ["3Dプリンティング"] },
  { ja: "BIM", en: ["bim", "building information modeling"] },
  { ja: "CIM", en: ["cim", "construction information modeling"] },
  { ja: "IoT", en: ["iot", "internet of things"] },
  { ja: "ドローン", en: ["drone", "uav", "unmanned aerial vehicle"] },
  { ja: "AI", en: ["artificial intelligence", "machine learning"], synonymsJa: ["人工知能"] },
  { ja: "ロボット", en: ["robot", "robotics"] },
  { ja: "炭素繊維", en: ["carbon fiber", "carbon fibre", "cfrp"] },
  { ja: "ジオポリマー", en: ["geopolymer"] },
  { ja: "再生骨材", en: ["recycled aggregate"] },
  { ja: "環境負荷", en: ["environmental impact", "life cycle assessment"], synonymsJa: ["LCA"] },
  { ja: "工法", en: ["construction method", "method"] },
  { ja: "特許", en: ["patent"] },
  { ja: "論文", en: ["paper", "article", "research"] }
];

function isJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text);
}

export function fallbackExpansion(query: string, languageMode: string): ExpandedKeywords {
  const normalized = query.trim();
  const matchedJa: string[] = [];
  const matchedEn: string[] = [];
  for (const entry of CIVIL_DICTIONARY) {
    if (normalized.includes(entry.ja)) {
      matchedJa.push(entry.ja);
      matchedEn.push(...entry.en);
    }
  }
  const translatedQueries = matchedEn.length > 0
    ? Array.from(new Set([normalized, ...matchedEn]))
    : [normalized];
  const synonymsJa = Array.from(new Set(matchedJa.flatMap((m) => CIVIL_DICTIONARY.find((e) => e.ja === m)?.synonymsJa ?? [])));
  const synonymsEn = matchedEn;
  const recommended = [
    `${normalized} ${isJapanese(normalized) ? "工法 特許" : "method patent"}`,
    `${normalized} ${isJapanese(normalized) ? "論文 研究" : "paper research"}`,
    `${normalized} ${isJapanese(normalized) ? "事例 実績" : "case study"}`
  ];
  return {
    originalQuery: normalized,
    translatedQueries,
    synonymsJa,
    synonymsEn,
    recommendedSearchQueries: languageMode === "ja" ? recommended : [normalized]
  };
}

const EXPANSION_SCHEMA = {
  type: "object",
  properties: {
    originalQuery: { type: "string" },
    translatedQueries: { type: "array", items: { type: "string" } },
    synonymsJa: { type: "array", items: { type: "string" } },
    synonymsEn: { type: "array", items: { type: "string" } },
    recommendedSearchQueries: { type: "array", items: { type: "string" } }
  },
  required: ["originalQuery", "translatedQueries", "synonymsJa", "synonymsEn", "recommendedSearchQueries"],
  additionalProperties: false
} as const;

export async function expandKeywords(
  params: SearchParams,
  env: WorkerEnv,
  provider: ActiveAiProvider | null = null,
  userId?: string
): Promise<ExpandedKeywords> {
  if (!env.OPENAI_API_KEY && !provider) return fallbackExpansion(params.query, params.languageMode ?? "auto");
  try {
    const result = await callLlmJson(
      {
        system:
          "あなたは土木技術分野の検索キーワード展開エンジニアです。与えられたキーワードに対し、日本語・英語の翻訳、専門用語の同義語、推奨検索クエリをJSONで出力してください。推測は含めず、実在する用語のみ出力してください。",
        user: JSON.stringify({ query: params.query, languageMode: params.languageMode ?? "auto" }),
        meta: { action: "keyword.expand", userId }
      },
      env,
      EXPANSION_SCHEMA,
      provider
    );
    if (result && typeof result.originalQuery === "string") {
      return {
        originalQuery: result.originalQuery,
        translatedQueries: Array.isArray(result.translatedQueries) ? result.translatedQueries.map(String) : [params.query],
        synonymsJa: Array.isArray(result.synonymsJa) ? result.synonymsJa.map(String) : [],
        synonymsEn: Array.isArray(result.synonymsEn) ? result.synonymsEn.map(String) : [],
        recommendedSearchQueries: Array.isArray(result.recommendedSearchQueries)
          ? result.recommendedSearchQueries.map(String)
          : []
      };
    }
  } catch {
    // AI 失敗時は辞書フォールバック
  }
  return fallbackExpansion(params.query, params.languageMode ?? "auto");
}
