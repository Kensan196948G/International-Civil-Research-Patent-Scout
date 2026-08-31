// PDF 本文抽出（ブラウザ側・pdfjs-dist legacy build）
// 方針: サイズ 20MB / 先頭 30 ページ / 30 万文字に制限し、ライセンス確認は呼び出し側で行う
export const PDF_MAX_BYTES = 20 * 1024 * 1024;
export const PDF_MAX_PAGES = 30;
export const PDF_MAX_CHARS = 300_000;

export interface PdfExtractResult {
  text: string;
  pages: number;
  truncated: boolean;
  error?: string;
}

async function isPdfFile(file: File): Promise<boolean> {
  if (file.type === "application/pdf") return true;
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer());
  return head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46 && head[4] === 0x2d; // %PDF-
}

export async function extractPdfText(file: File): Promise<PdfExtractResult> {
  if (file.size > PDF_MAX_BYTES) {
    return { text: "", pages: 0, truncated: false, error: `PDF は ${PDF_MAX_BYTES / 1024 / 1024}MB 以内にしてください（現在 ${(file.size / 1024 / 1024).toFixed(1)}MB）` };
  }
  if (!(await isPdfFile(file))) {
    return { text: "", pages: 0, truncated: false, error: "PDF ファイルではありません（%PDF- マジックバイト確認）" };
  }
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/legacy/build/pdf.worker.min.mjs", import.meta.url).toString();
    const loadingTask = pdfjs.getDocument({ data: await file.arrayBuffer() });
    const doc = await loadingTask.promise;
    const pageCount = Math.min(doc.numPages, PDF_MAX_PAGES);
    const parts: string[] = [];
    let total = 0;
    let truncated = false;
    for (let i = 1; i <= pageCount; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (total + text.length + 1 > PDF_MAX_CHARS) {
        parts.push(text.slice(0, PDF_MAX_CHARS - total));
        truncated = true;
        break;
      }
      parts.push(text);
      total += text.length + 1;
      page.cleanup();
    }
    await loadingTask.destroy();
    return { text: parts.join("\n").trim(), pages: pageCount, truncated };
  } catch (err) {
    return {
      text: "",
      pages: 0,
      truncated: false,
      error: `PDF の本文を抽出できませんでした: ${err instanceof Error ? err.message : String(err)}`
    };
  }
}
