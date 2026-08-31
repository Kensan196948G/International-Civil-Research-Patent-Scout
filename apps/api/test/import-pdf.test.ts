import { describe, expect, it } from "vitest";
import type { Db } from "../src/db";
import { importSchema } from "../src/routes/documents";
import { insertDocument } from "../src/repositories";

const base = {
  sourceType: "pdf" as const,
  title: "技術資料",
  url: "https://example.test/doc.pdf"
};

describe("importSchema (PDF 本文とライセンス)", () => {
  it("accepts a PDF with body text when license is confirmed", () => {
    const parsed = importSchema.safeParse({ ...base, bodyText: "本文…", licenseConfirmed: true });
    expect(parsed.success).toBe(true);
  });

  it("rejects body text without license confirmation", () => {
    const parsed = importSchema.safeParse({ ...base, bodyText: "本文…" });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.path).toContain("licenseConfirmed");
    }
  });

  it("rejects body text with explicit false license", () => {
    const parsed = importSchema.safeParse({ ...base, bodyText: "本文…", licenseConfirmed: false });
    expect(parsed.success).toBe(false);
  });

  it("accepts metadata-only PDF without license confirmation", () => {
    const parsed = importSchema.safeParse(base);
    expect(parsed.success).toBe(true);
  });

  it("applies the license rule to non-PDF sources too (fail closed)", () => {
    const parsed = importSchema.safeParse({ ...base, sourceType: "paper", bodyText: "本文…" });
    expect(parsed.success).toBe(false);
  });
});

describe("insertDocument (body_text 保存)", () => {
  it("persists body text and license note when provided", async () => {
    let query = "";
    let params: unknown[] = [];
    const db: Db = async (q, p = []) => {
      query = q;
      params = p;
      return [
        {
          id: "d1",
          source_type: "pdf",
          title: "技術資料",
          original_title: null,
          abstract: "要旨",
          body_text: "抽出した本文",
          url: "https://example.test/doc.pdf",
          doi: null,
          patent_number: null,
          publication_number: null,
          patent_status: null,
          classifications: null,
          authors: null,
          inventors: null,
          applicants: null,
          country: null,
          publication_date: null,
          source_name: "手動登録",
          license_note: "利用許諾確認済み（ユーザー申告・本文保存）",
          content_hash: "hash123",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
    };
    const result = {
      sourceType: "pdf" as const,
      title: "技術資料",
      abstract: "要旨",
      url: "https://example.test/doc.pdf",
      sourceName: "手動登録"
    };
    await insertDocument(
      db,
      result,
      "hash123",
      { bodyText: "抽出した本文", licenseNote: "利用許諾確認済み（ユーザー申告・本文保存）" }
    );
    expect(query).toContain("body_text");
    expect(query).toContain("license_note");
    expect(params).toContain("抽出した本文");
    expect(params).toContain("利用許諾確認済み（ユーザー申告・本文保存）");
  });
});
