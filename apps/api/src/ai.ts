import type { ComparisonRow, SourceDocument, SummaryType } from "@icrps/contracts";
import { createDb } from "./db.js";
import type { WorkerEnv } from "./env.js";
import type { ActiveAiProvider } from "./settings.js";
import { extractLlmUsage, recordLlmUsage } from "./usage.js";

type JsonObject = Record<string, unknown>;

export async function callLlmJson(
  input: { system: string; user: string; meta?: { action?: string } },
  env: WorkerEnv,
  jsonSchema: Record<string, unknown>,
  provider: ActiveAiProvider | null = null
): Promise<JsonObject | null> {
  const active = provider ?? (env.OPENAI_API_KEY
    ? { provider: "openai" as const, apiKey: env.OPENAI_API_KEY, model: env.AI_MODEL, baseUrl: env.OPENAI_BASE_URL }
    : null);
  if (!active) return null;

  let content: string;
  if (active.provider === "anthropic") {
    const base = active.baseUrl.replace(/\/+$/, "");
    const response = await fetch(`${base}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": active.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: active.model,
        max_tokens: 2000,
        temperature: 0.2,
        system: input.system,
        messages: [{ role: "user", content: input.user }]
      }),
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) throw new Error(`LLM API error ${response.status}`);
    const data = (await response.json()) as {
      content?: Array<{ type?: string; text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    content = data.content?.map((c) => c.text ?? "").join("") ?? "";
    const usage = extractLlmUsage(data, "anthropic");
    if (usage.inputTokens > 0 || usage.outputTokens > 0) {
      await recordLlmUsage(createDb(env), {
        action: input.meta?.action ?? "llm.call",
        provider: "anthropic",
        model: active.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens
      });
    }
  } else {
    const base = active.baseUrl.replace(/\/+$/, "");
    const url = active.provider === "deepseek"
      ? `${base.replace(/\/v1$/, "")}/chat/completions`
      : `${base}/chat/completions`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${active.apiKey}`
      },
      body: JSON.stringify({
        model: active.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: input.system },
          { role: "user", content: input.user }
        ],
        response_format: { type: "json_object" },
        max_tokens: 2000
      }),
      signal: AbortSignal.timeout(25000)
    });
    if (!response.ok) throw new Error(`LLM API error ${response.status}`);
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    content = data.choices?.[0]?.message?.content ?? "";
    const usage = extractLlmUsage(data, active.provider);
    if (usage.inputTokens > 0 || usage.outputTokens > 0) {
      await recordLlmUsage(createDb(env), {
        action: input.meta?.action ?? "llm.call",
        provider: active.provider,
        model: active.model,
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens
      });
    }
  }
  if (!content) throw new Error("LLM returned empty content");
  const parsed = JSON.parse(content) as JsonObject;
  // JSON Schema の required を軽量検証
  const required = (jsonSchema.required ?? []) as string[];
  for (const key of required) {
    if (!(key in parsed)) throw new Error(`LLM output missing required key: ${key}`);
  }
  return parsed;
}

export interface SummaryOutput {
  summaryText: string;
  keyPoints: string[];
  merits: string[];
  demerits: string[];
  applicationConditions: string[];
  risks: string[];
  citations: Array<{ claim: string; sourceUrl: string; quote: string }>;
  uncertainties: string[];
  modelName: string;
  promptVersion: string;
}

const SUMMARY_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    technicalCategory: { type: "string" },
    keyPoints: { type: "array", items: { type: "string" } },
    merits: { type: "array", items: { type: "string" } },
    demerits: { type: "array", items: { type: "string" } },
    applicationConditions: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    evidence: {
      type: "array",
      items: {
        type: "object",
        properties: {
          claim: { type: "string" },
          sourceUrl: { type: "string" },
          quote: { type: "string" }
        },
        required: ["claim", "sourceUrl", "quote"]
      }
    },
    uncertainties: { type: "array", items: { type: "string" } }
  },
  required: ["summary"],
  additionalProperties: true
} as const;

function excerpt(text: string | null, max = 500): string {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function fallbackSummary(
  document: SourceDocument,
  summaryType: SummaryType,
  language: string
): SummaryOutput {
  const abstract = document.abstract ?? document.bodyText ?? "";
  const detail = summaryType === "detailed" || summaryType === "technical";
  const summaryText = [
    `【${language === "ja" ? "要約" : "Summary"}】${document.title}`,
    abstract ? `\n${excerpt(abstract, detail ? 800 : 300)}` : "\n（要旨が取得できていないため、メタデータのみの要約です）",
    `\n出典: ${document.url ?? document.sourceName ?? "不明"}`
  ].join("");
  const citations = document.url
    ? [{ claim: "文書の存在と要旨", sourceUrl: document.url, quote: excerpt(abstract, 120) || document.title }]
    : [];
  return {
    summaryText,
    keyPoints: abstract ? [excerpt(abstract, 200)] : [],
    merits: [],
    demerits: [],
    applicationConditions: [],
    risks: ["AI要約ではなく公開メタデータに基づく概略です。原典を確認してください。"],
    citations,
    uncertainties: abstract ? [] : ["本文・要旨が未取得のため内容の確度は低いです。"],
    modelName: "rule-based-fallback",
    promptVersion: "v1-fallback"
  };
}

export async function summarizeDocument(
  document: SourceDocument,
  summaryType: SummaryType,
  language: string,
  env: WorkerEnv,
  provider: ActiveAiProvider | null = null
): Promise<SummaryOutput> {
  if (!env.OPENAI_API_KEY && !provider) return fallbackSummary(document, summaryType, language);
  const prompt =
    summaryType === "patent"
      ? `特許情報を調査支援用に要約してください。特許の法的有効性・侵害判断は行わない旨を明記してください。出力JSON: {summary, patentOverview, problemToSolve, solution, mainClaimsSummary, applicants, inventors, publicationNumber, filingDate, publicationDate, technologyKeywords, possibleRelevance, caution}`
      : `公開情報に基づき調査支援用の技術要約を生成してください。出典にない断定を避け、推測は「推測」と明記してください。出力JSON: {summary, technicalCategory, keyPoints[], merits[], demerits[], applicationConditions[], risks[], evidence[{claim,sourceUrl,quote}], uncertainties[]}`;
  try {
    const result = await callLlmJson(
      {
        system: `あなたは土木技術調査の専門アシスタントです。回答は${language === "ja" ? "日本語" : "英語"}で、JSON のみを出力してください。`,
        user: `${prompt}\n\n文書:\n${JSON.stringify({
          title: document.title,
          abstract: document.abstract,
          url: document.url,
          doi: document.doi,
          patentNumber: document.patentNumber,
          publicationDate: document.publicationDate
        })}`,
        meta: { action: "summary.generate" }
      },
      env,
      SUMMARY_SCHEMA,
      provider
    );
    if (!result) return fallbackSummary(document, summaryType, language);
    const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);
    const evidence = Array.isArray(result.evidence)
      ? result.evidence.map((e) => {
          const ev = e as JsonObject;
          return {
            claim: String(ev.claim ?? ""),
            sourceUrl: String(ev.sourceUrl ?? document.url ?? ""),
            quote: String(ev.quote ?? "")
          };
        })
      : [];
    return {
      summaryText: String(result.summary ?? ""),
      keyPoints: arr(result.keyPoints),
      merits: arr(result.merits),
      demerits: arr(result.demerits),
      applicationConditions: arr(result.applicationConditions),
      risks: arr(result.risks),
      citations: evidence.length > 0 ? evidence : [],
      uncertainties: arr(result.uncertainties),
      modelName: provider?.model ?? env.AI_MODEL,
      promptVersion: "v1"
    };
  } catch {
    return fallbackSummary(document, summaryType, language);
  }
}

export function fallbackComparison(
  documents: SourceDocument[],
  axes: string[]
): { rows: ComparisonRow[]; notes: string[] } {
  const rows: ComparisonRow[] = documents.map((doc) => {
    const values: Record<string, string> = {};
    for (const axis of axes) {
      if (axis === "技術概要") values[axis] = doc.abstract ? excerpt(doc.abstract, 150) : "情報なし";
      else if (axis === "出典") values[axis] = doc.url ?? doc.sourceName ?? "不明";
      else values[axis] = doc.abstract ? excerpt(doc.abstract, 100) : "未取得";
    }
    return { technologyName: doc.title, values, sourceDocumentIds: [doc.id] };
  });
  return { rows, notes: ["比較は取得文献のメタデータ・要旨に基づく概略です。専門家確認が必要です。"] };
}

const COMPARISON_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    axes: { type: "array", items: { type: "string" } },
    rows: {
      type: "array",
      items: {
        type: "object",
        properties: {
          technologyName: { type: "string" },
          values: { type: "object" },
          sourceDocumentIds: { type: "array", items: { type: "string" } }
        },
        required: ["technologyName", "values", "sourceDocumentIds"]
      }
    },
    notes: { type: "array", items: { type: "string" } }
  },
  required: ["title", "rows"],
  additionalProperties: true
} as const;

export async function generateComparison(
  documents: SourceDocument[],
  requestedAxes: string[],
  env: WorkerEnv,
  provider: ActiveAiProvider | null = null
): Promise<{ title: string; axes: string[]; rows: ComparisonRow[]; notes: string[] }> {
  const fallback = fallbackComparison(documents, requestedAxes);
  if ((!env.OPENAI_API_KEY && !provider) || documents.length === 0) {
    return { title: "技術比較表", axes: requestedAxes, ...fallback };
  }
  try {
    const result = await callLlmJson(
      {
        system:
          "あなたは土木技術調査の専門アシスタントです。複数文献を指定された比較軸で比較し、JSON を出力してください。出典にない断定は避け、注意点に「要専門家確認」を含めてください。",
        user: JSON.stringify({
          axes: requestedAxes,
          documents: documents.map((d) => ({
            id: d.id,
            title: d.title,
            abstract: d.abstract,
            url: d.url
          }))
        }),
        meta: { action: "comparison.generate" }
      },
      env,
      COMPARISON_SCHEMA,
      provider
    );
    if (!result || !Array.isArray(result.rows)) return { title: "技術比較表", axes: requestedAxes, ...fallback };
    const rows = result.rows.map((r) => {
      const row = r as JsonObject;
      return {
        technologyName: String(row.technologyName ?? "不明"),
        values: (row.values as Record<string, unknown> | undefined) as Record<string, string> ?? {},
        sourceDocumentIds: Array.isArray(row.sourceDocumentIds) ? row.sourceDocumentIds.map(String) : []
      };
    });
    return {
      title: String(result.title ?? "技術比較表"),
      axes: Array.isArray(result.axes) ? result.axes.map(String) : requestedAxes,
      rows,
      notes: Array.isArray(result.notes) ? result.notes.map(String) : fallback.notes
    };
  } catch {
    return { title: "技術比較表", axes: requestedAxes, ...fallback };
  }
}

export interface SummaryInsert {
  summaryText: string;
  keyPoints: string[];
  merits: string[];
  demerits: string[];
  applicationConditions: string[];
  risks: string[];
  citations: Array<{ claim: string; sourceUrl: string; quote: string }>;
  modelName: string;
  promptVersion: string;
}

export function toSummaryRecord(
  _doc: SourceDocument,
  _summaryType: SummaryType,
  _language: string,
  output: SummaryOutput
): SummaryInsert {
  return {
    summaryText: output.summaryText,
    keyPoints: output.keyPoints,
    merits: output.merits,
    demerits: output.demerits,
    applicationConditions: output.applicationConditions,
    risks: output.risks,
    citations: output.citations,
    modelName: output.modelName,
    promptVersion: output.promptVersion
  };
}
