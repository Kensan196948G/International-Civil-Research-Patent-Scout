// 適用可否チェック（ルールベース・AI 未使用）
// 保存文献のタイトル・要旨・出願人/発明者と、入力された設計・施工条件をキーワード照合して
// 候補技術ごとの根拠文書を返す。判定は調査支援であり、設計・施工・安全性を保証しない。
import type { Db } from "./db.js";
import { listUserDocuments } from "./repositories.js";

export interface FitRequest {
  workType: string;
  environment: string;
  designStrength: string;
  cover: string;
  serviceLife: string;
  co2Target: string;
  candidates: string;
}

export interface FitDoc {
  id: string;
  title: string;
  abstract: string | null;
  url: string | null;
  sourceName: string | null;
  score: number;
  matchedTerms: string[];
}

export interface FitItem {
  candidate: string;
  verdict: "有力" | "条件付き可" | "要確認";
  confidence: number;
  docs: FitDoc[];
}

export interface FitResult {
  mode: "rule";
  note: string;
  items: FitItem[];
}

const CONDITION_WORDS: Record<string, string[]> = {
  environment: ["海洋", "飛沫", "塩害", "塩分", "凍結", "融雪", "一般外気", "splash", "marine", "salt", "chloride"],
  strength: ["強度", "N/mm", "MPa", "高強度", "40N", "50N"],
  cover: ["かぶり", "cover", "ひび割れ", "crack"],
  serviceLife: ["100年", "耐久", "寿命", "長期", "life", "durability", "100-year"],
  co2: ["CO2", "CO₂", "低炭素", "脱炭素", "LC3", "ジオポリマー", "高炉", "low carbon", "carbon"]
};

function tokenize(text: string): string[] {
  return text.split(/[\s、,，/／]+/).map((t) => t.trim()).filter((t) => t.length >= 2);
}

function matches(docText: string, terms: string[]): { score: number; matched: string[] } {
  const lower = docText.toLowerCase();
  const matched = terms.filter((t) => lower.includes(t.toLowerCase()));
  return { score: matched.length * 10, matched };
}

function conditionScore(docText: string, req: FitRequest): { score: number; matched: string[] } {
  const terms: string[] = [];
  if (req.environment.trim()) terms.push(...(CONDITION_WORDS.environment ?? []), req.environment.trim());
  if (req.designStrength.trim()) terms.push(...(CONDITION_WORDS.strength ?? []), req.designStrength.trim());
  if (req.cover.trim()) terms.push(...(CONDITION_WORDS.cover ?? []), req.cover.trim());
  if (req.serviceLife.trim()) terms.push(...(CONDITION_WORDS.serviceLife ?? []), req.serviceLife.trim());
  if (req.co2Target.trim()) terms.push(...(CONDITION_WORDS.co2 ?? []), req.co2Target.trim());
  const unique = [...new Set(terms.map((t) => t.toLowerCase()))];
  const { score, matched } = matches(docText, unique);
  return { score, matched };
}

export async function runFitCheck(db: Db, userId: string, req: FitRequest): Promise<FitResult> {
  const docs = await listUserDocuments(db, userId, 500);
  const candidates = tokenize(req.candidates).slice(0, 8);
  const items: FitItem[] = candidates.map((candidate) => {
    const candidateTerms = tokenize(candidate);
    const hits: FitDoc[] = [];
    for (const doc of docs) {
      const text = `${doc.title} ${doc.originalTitle ?? ""} ${doc.abstract ?? ""} ${(doc.applicants ?? []).join(" ")} ${(doc.inventors ?? []).join(" ")}`;
      const c = matches(text, candidateTerms);
      const cond = conditionScore(text, req);
      const score = c.score + cond.score;
      if (score <= 0) continue;
      hits.push({
        id: doc.id,
        title: doc.title,
        abstract: doc.abstract,
        url: doc.url,
        sourceName: doc.sourceName,
        score,
        matchedTerms: [...new Set([...c.matched, ...cond.matched])].slice(0, 10)
      });
    }
    hits.sort((a, b) => b.score - a.score);
    const top = hits.slice(0, 5);
    const confidence = top.length === 0 ? 0 : Math.min(0.95, 0.5 + top[0]!.score / 100);
    const verdict = top.length >= 3 ? "有力" : top.length >= 1 ? "条件付き可" : "要確認";
    return { candidate, verdict, confidence, docs: top };
  });
  return {
    mode: "rule",
    note: "本チェックは保存文献のタイトル・要旨・出願人/発明者と入力条件のキーワード照合によるルールベース判定です（AI 生成ではありません）。設計・施工可否・安全性は保証しないため、原典・示方書・専門家確認が必要です。",
    items
  };
}
