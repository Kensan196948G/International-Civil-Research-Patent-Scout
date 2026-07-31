import React, { Fragment } from "react";

function renderTableRow(line: string, key: string): React.ReactNode {
  const cells = line
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => cell.trim());
  const isHeader = key === "0";
  const tag = isHeader ? "th" : "td";
  return (
    <tr key={key}>
      {cells.map((cell, i) => (
        <Fragment key={i}>
          {React.createElement(tag, null, cell)}
        </Fragment>
      ))}
    </tr>
  );
}

export function MarkdownView({ content }: { content: string }) {
  const lines = content.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  let table: string[] = [];
  let i = 0;
  const flushList = () => {
    if (list.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`}>
          {list.map((item, idx) => (
            <li key={idx}>{item.replace(/^[-*]\s+/, "")}</li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  const flushTable = () => {
    if (table.length > 0) {
      const rows = table.filter((line) => !/^\s*\|?\s*---/.test(line));
      blocks.push(
        <div className="table-wrap" key={`t-${blocks.length}`}>
          <table>
            <tbody>{rows.map((row, idx) => renderTableRow(row, String(idx)))}</tbody>
          </table>
        </div>
      );
      table = [];
    }
  };
  while (i < lines.length) {
    const line = lines[i]!;
    const trimmed = line.trim();
    if (trimmed.startsWith("# ")) {
      flushList(); flushTable();
      blocks.push(<h1 key={blocks.length}>{trimmed.slice(2)}</h1>);
    } else if (trimmed.startsWith("## ")) {
      flushList(); flushTable();
      blocks.push(<h2 key={blocks.length}>{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      flushList(); flushTable();
      blocks.push(<h3 key={blocks.length}>{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushTable();
      list.push(trimmed);
    } else if (trimmed.startsWith("|")) {
      flushList();
      table.push(trimmed);
    } else if (trimmed.startsWith("> ")) {
      flushList(); flushTable();
      blocks.push(<blockquote key={blocks.length}>{trimmed.slice(2)}</blockquote>);
    } else if (trimmed === "---") {
      flushList(); flushTable();
      blocks.push(<hr key={blocks.length} />);
    } else if (trimmed === "") {
      flushList(); flushTable();
    } else {
      flushList(); flushTable();
      blocks.push(<p key={blocks.length}>{trimmed}</p>);
    }
    i += 1;
  }
  flushList();
  flushTable();
  return <div className="markdown">{blocks}</div>;
}
