import type { Db } from "./db.js";
import type { WorkerEnv } from "./env.js";
import type { ActiveAiProvider } from "./settings.js";
import { callLlmJson } from "./ai.js";
import { listUserDocuments } from "./repositories.js";
import { searchDocuments } from "./search-engine.js";

export interface ChatCitation {
  n: string;
  title: string;
  url: string;
}

export interface ChatResult {
  reply: string;
  cites: ChatCitation[];
  mode: "ai" | "rule";
}

const CHAT_SCHEMA = {
  type: "object",
  properties: {
    reply: { type: "string" },
    citations: {
      type: "array",
      items: {
        type: "object",
        properties: { n: { type: "string" }, title: { type: "string" }, url: { type: "string" } },
        required: ["n", "title", "url"]
      }
    }
  },
  required: ["reply"],
  additionalProperties: true
} as const;

export async function answerChat(
  db: Db,
  env: WorkerEnv,
  provider: ActiveAiProvider | null,
  userId: string,
  message: string
): Promise<ChatResult> {
  const docs = await listUserDocuments(db, userId, 8);
  let effectiveDocs = docs;
  if (docs.length < 3) {
    const globalDocs = await searchDocuments(env, db, message, 8);
    const known = new Set(docs.map((d) => d.id));
    effectiveDocs = [...docs, ...globalDocs.filter((d) => !known.has(d.id))].slice(0, 10);
  }
  const fallback = ruleAnswer(message, effectiveDocs);
  if (!provider) return { ...fallback, mode: "rule" };
  try {
    const numbered = effectiveDocs
      .map((d, i) => `${i + 1}. ${d.title}${d.abstract ? `\n   要旨: ${d.abstract.slice(0, 500)}` : ""}${d.url ? `\n   URL: ${d.url}` : ""}`)
      .join("\n\n");
    const result = await callLlmJson(
      {
        system:
          "あなたは土木技術調査のリサーチアシスタントです。与えられた保存文献のみに基づき、日本語で回答してください。引用は [1] の形式で番号を明記し、保存文献に根拠がない場合は「保存文献の範囲では確認できません」と明記してください。推測は「推測」と断ってください。JSON で {reply, citations:[{n,title,url}]} を出力してください。",
        user: `質問: ${message}\n\n保存文献:\n${numbered || "（保存文献がありません）"}`,
        meta: { action: "chat.answer" }
      },
      env,
      CHAT_SCHEMA,
      provider
    );
    if (!result || typeof result.reply !== "string" || !result.reply.trim()) return { ...fallback, mode: "rule" };
    const cites = Array.isArray(result.citations)
      ? result.citations
          .map((c) => {
            const item = c as Record<string, unknown>;
            return {
              n: String(item.n ?? ""),
              title: String(item.title ?? ""),
              url: String(item.url ?? "#")
            };
          })
          .filter((c) => c.n && c.title)
      : fallback.cites;
    return { reply: String(result.reply), cites, mode: "ai" };
  } catch {
    return { ...fallback, mode: "rule" };
  }
}

function ruleAnswer(message: string, docs: Array<{ title: string; abstract: string | null; url: string | null }>): {
  reply: string;
  cites: ChatCitation[];
} {
  // 日本語は空白で分割できないため、6 文字の重複グラムも照合に使う
  const words = new Set<string>(message.split(/[\s、。？！?!]+/).filter((w) => w.length >= 2));
  for (let i = 0; i + 6 <= message.length; i++) words.add(message.slice(i, i + 6));
  const hits = docs
    .filter((d) => [...words].some((w) => `${d.title} ${d.abstract ?? ""}`.includes(w)))
    .slice(0, 3);
  if (hits.length === 0) {
    return {
      reply: `保存文献 ${docs.length} 件の範囲では、この質問に直接該当する記述は見つかりませんでした。検索語を変えるか、横断検索から文献を追加してください（ルール応答モード）。`,
      cites: []
    };
  }
  return {
    reply: `保存文献から関連するものを ${hits.length} 件見つけました。\n\n${hits
      .map((h, i) => `[${i + 1}] ${h.title}${h.abstract ? ` — ${h.abstract.slice(0, 120)}…` : ""}`)
      .join("\n")}\n\n詳細は各文献の要約・原典を確認してください（ルール応答モード）。`,
    cites: hits.map((h, i) => ({ n: String(i + 1), title: h.title, url: h.url ?? "#" }))
  };
}
