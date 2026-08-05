// レポートの簡易エクスポート変換（Markdown → Word互換HTML / Excel互換HTML / 印刷用HTML）

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const out: string[] = [];
  let inTable = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^\s*\|.*\|\s*$/.test(line)) {
      const cells = line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => escapeHtml(c.trim()));
      if (/^[-:]+$/.test(cells[0] ?? "")) {
        continue;
      }
      if (!inTable) {
        out.push("<table><thead><tr>");
        for (const cell of cells) out.push(`<th>${cell}</th>`);
        out.push("</tr></thead><tbody>");
        inTable = true;
      } else {
        out.push("<tr>");
        for (const cell of cells) out.push(`<td>${cell}</td>`);
        out.push("</tr>");
      }
      continue;
    }
    if (inTable) {
      out.push("</tbody></table>");
      inTable = false;
    }
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)?.[0].length ?? 1;
      out.push(`<h${level}>${escapeHtml(line.replace(/^#+\s*/, ""))}</h${level}>`);
    } else if (/^\s*[-*]\s+/.test(line)) {
      out.push(`<li>${escapeHtml(line.replace(/^\s*[-*]\s+/, ""))}</li>`);
    } else if (/^---+\s*$/.test(line)) {
      out.push("<hr/>");
    } else if (/^>\s?/.test(line)) {
      out.push(`<blockquote>${escapeHtml(line.replace(/^>\s?/, ""))}</blockquote>`);
    } else if (line.trim() === "") {
      out.push("<p></p>");
    } else {
      out.push(`<p>${escapeHtml(line)}</p>`);
    }
  }
  if (inTable) out.push("</tbody></table>");
  return out.join("\n");
}

export function renderWordDocument(markdown: string, title: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body>${markdownToHtml(markdown)}</body>
</html>`;
}

export function renderExcelDocument(markdown: string, title: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head>
<body>${markdownToHtml(markdown)}</body>
</html>`;
}

export function renderPrintHtml(markdown: string, title: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: sans-serif; line-height: 1.8; margin: 32px; color: #1a2433; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #ccc; padding: 6px 10px; font-size: 12px; text-align: left; }
  h1 { font-size: 20px; } h2 { font-size: 16px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
  blockquote { color: #555; border-left: 3px solid #e08a2b; padding-left: 12px; margin: 10px 0; }
  @media print { body { margin: 12mm; } }
</style></head>
<body>${markdownToHtml(markdown)}</body>
</html>`;
}
