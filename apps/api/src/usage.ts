// LLM 使用量の記録とコスト見積り
import type { Db } from "./db.js";

const RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "deepseek-chat": { input: 0.27, output: 1.1 },
  "claude-sonnet-4-5": { input: 3, output: 15 },
  default: { input: 1, output: 3 }
};

export function estimateCost(provider: string, model: string, inputTokens: number, outputTokens: number): number {
  const rate = RATES[model] ?? RATES[provider] ?? { input: 1, output: 3 };
  return (inputTokens / 1_000_000) * rate.input + (outputTokens / 1_000_000) * rate.output;
}

export function extractLlmUsage(data: unknown, provider: string): { inputTokens: number; outputTokens: number } {
  if (provider === "anthropic") {
    const usage = (data as { usage?: { input_tokens?: number; output_tokens?: number } })?.usage;
    return {
      inputTokens: Number(usage?.input_tokens ?? 0),
      outputTokens: Number(usage?.output_tokens ?? 0)
    };
  }
  const usage = (data as { usage?: { prompt_tokens?: number; completion_tokens?: number } })?.usage;
  return {
    inputTokens: Number(usage?.prompt_tokens ?? 0),
    outputTokens: Number(usage?.completion_tokens ?? 0)
  };
}

export async function recordLlmUsage(
  db: Db,
  input: {
    userId?: string | null;
    action: string;
    provider: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    durationMs?: number;
  }
): Promise<void> {
  if (input.inputTokens <= 0 && input.outputTokens <= 0) return;
  await db(
    `INSERT INTO llm_usage (user_id, action, provider, model, input_tokens, output_tokens, cost_estimate, duration_ms)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [
      input.userId ?? null,
      input.action,
      input.provider,
      input.model,
      input.inputTokens,
      input.outputTokens,
      estimateCost(input.provider, input.model, input.inputTokens, input.outputTokens),
      input.durationMs ?? 0
    ]
  );
}
