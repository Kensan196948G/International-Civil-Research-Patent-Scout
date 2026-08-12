import { describe, expect, it } from "vitest";
import type { Db } from "../src/db";
import { runFitCheck, type FitRequest } from "../src/fit";

function documentRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "doc-1",
    source_type: "paper",
    title: "海洋環境下の低炭素コンクリートの耐久性評価",
    original_title: null,
    abstract: "飛沫帯における塩害とCO2削減を検討した実構造物の暴露試験。",
    body_text: null,
    url: "https://example.test/doc",
    doi: null,
    patent_number: null,
    publication_number: null,
    patent_status: null,
    classifications: [],
    authors: ["山田 太郎"],
    inventors: null,
    applicants: null,
    country: "JP",
    publication_date: "2025-01-01",
    source_name: "土木研究所",
    license_note: null,
    content_hash: null,
    created_at: "2025-01-01T00:00:00.000Z",
    updated_at: "2025-01-01T00:00:00.000Z",
    ...overrides
  };
}

describe("runFitCheck", () => {
  it("returns rule-based matches with evidence documents", async () => {
    const db: Db = async () => [documentRow()];
    const req: FitRequest = {
      workType: "橋梁下部工（場所打ち）",
      environment: "海洋・飛沫帯",
      designStrength: "40 N/mm²",
      cover: "70 mm",
      serviceLife: "100 年",
      co2Target: "30% 以上",
      candidates: "低炭素コンクリート / ジオポリマー"
    };
    const result = await runFitCheck(db, "user-1", req);
    expect(result.mode).toBe("rule");
    const lowCarbon = result.items.find((i) => i.candidate === "低炭素コンクリート");
    expect(lowCarbon).toBeDefined();
    expect(lowCarbon!.docs.length).toBeGreaterThan(0);
    expect(lowCarbon!.docs[0]!.url).toBe("https://example.test/doc");
    expect(lowCarbon!.verdict).toBe("条件付き可");
  });

  it("returns 要確認 for candidates without evidence", async () => {
    const db: Db = async () => [documentRow()];
    const req: FitRequest = {
      workType: "",
      environment: "",
      designStrength: "",
      cover: "",
      serviceLife: "",
      co2Target: "",
      candidates: "ジオポリマー"
    };
    const result = await runFitCheck(db, "user-1", req);
    expect(result.items[0]!.verdict).toBe("要確認");
    expect(result.items[0]!.docs).toEqual([]);
  });
});
