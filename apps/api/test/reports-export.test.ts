import { describe, expect, it } from "vitest";
import { markdownToHtml, renderPrintHtml, renderWordDocument } from "../src/reports-export";

describe("markdownToHtml", () => {
  it("converts headings, lists, tables and blockquotes", () => {
    const html = markdownToHtml(
      [
        "# 調査レポート",
        "",
        "概要テキスト",
        "",
        "| 比較項目 | 技術A |",
        "| --- | --- |",
        "| 技術概要 | 概要A |",
        "",
        "- 項目1",
        "",
        "> 注意事項"
      ].join("\n")
    );
    expect(html).toContain("<h1>調査レポート</h1>");
    expect(html).toContain("<table>");
    expect(html).toContain("<th>技術A</th>");
    expect(html).toContain("<li>項目1</li>");
    expect(html).toContain("<blockquote>注意事項</blockquote>");
  });
});

describe("renderWordDocument", () => {
  it("wraps converted html in a Word-compatible document", () => {
    const html = renderWordDocument("# タイトル", "タイトル");
    expect(html).toContain("<html");
    expect(html).toContain("<h1>タイトル</h1>");
  });
});

describe("renderPrintHtml", () => {
  it("includes print styles", () => {
    const html = renderPrintHtml("# タイトル", "タイトル");
    expect(html).toContain("@media print");
    expect(html).toContain("<body>");
  });
});
