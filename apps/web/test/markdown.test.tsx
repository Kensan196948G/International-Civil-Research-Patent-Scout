import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownView } from "../src/components/MarkdownView";

describe("MarkdownView", () => {
  it("renders headings, list, table and blockquote", () => {
    const content = [
      "# タイトル",
      "",
      "## 見出し",
      "",
      "- 項目1",
      "- 項目2",
      "",
      "| 列A | 列B |",
      "| --- | --- |",
      "| a1 | b1 |",
      "",
      "> 引用文"
    ].join("\n");
    render(<MarkdownView content={content} />);
    expect(screen.getByText("タイトル")).toBeTruthy();
    expect(screen.getByText("見出し")).toBeTruthy();
    expect(screen.getByText("項目1")).toBeTruthy();
    expect(screen.getByText("a1")).toBeTruthy();
    expect(screen.getByText("引用文")).toBeTruthy();
  });
});
