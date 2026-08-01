import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError } from "../errors.js";
import { requireAdmin, requireAuth } from "../auth.js";
import { resolveEnv } from "../env.js";
import {
  clearAiProvider,
  getActiveAiProvider,
  getAiSettings,
  saveAiSettings,
  testAiConnection,
  type AiProviderName
} from "../settings.js";

const aiSaveSchema = z.object({
  deepseek: z
    .object({
      apiKey: z.string().min(1).max(500).optional(),
      model: z.string().min(1).max(100).optional(),
      baseUrl: z.string().url().max(300).optional()
    })
    .optional(),
  anthropic: z
    .object({
      apiKey: z.string().min(1).max(500).optional(),
      model: z.string().min(1).max(100).optional(),
      baseUrl: z.string().url().max(300).optional()
    })
    .optional()
});

const aiTestSchema = z.object({
  provider: z.enum(["deepseek", "anthropic"]),
  apiKey: z.string().min(1).max(500).optional(),
  model: z.string().min(1).max(100).optional(),
  baseUrl: z.string().url().max(300).optional()
});

function toPublic(settings: Awaited<ReturnType<typeof getAiSettings>>) {
  return {
    deepseek: {
      configured: !!settings.deepseek.apiKey,
      model: settings.deepseek.model
    },
    anthropic: {
      configured: !!settings.anthropic.apiKey,
      model: settings.anthropic.model
    }
  };
}

export function settingsRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth, requireAdmin);

  app.get("/settings", async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const settings = await getAiSettings(db, env);
    const active = await getActiveAiProvider(db, env);
    return c.json({
      ai: {
        ...toPublic(settings),
        activeProvider: active?.provider ?? null
      }
    });
  });

  app.put("/settings/ai", async (c) => {
    const parsed = aiSaveSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "AI 設定の入力内容が不正です", parsed.error.flatten());
    if (!parsed.data.deepseek && !parsed.data.anthropic) {
      throw new HttpError(400, "bad_request", "設定するプロバイダを指定してください");
    }
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const settings = await saveAiSettings(db, env, parsed.data);
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "admin.settings.ai_save",
      detail: {
        providers: Object.keys(parsed.data).filter((k) => k === "deepseek" || k === "anthropic"),
        note: "API キー値は保存しない"
      }
    });
    return c.json({ ai: { ...toPublic(settings), activeProvider: (await getActiveAiProvider(db, env))?.provider ?? null } });
  });

  app.delete("/settings/ai/:provider", async (c) => {
    const provider = c.req.param("provider") as AiProviderName;
    if (provider !== "deepseek" && provider !== "anthropic") {
      throw new HttpError(400, "bad_request", "プロバイダ指定が不正です");
    }
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const settings = await clearAiProvider(db, env, provider);
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "admin.settings.ai_clear",
      detail: { provider }
    });
    return c.json({ ai: { ...toPublic(settings), activeProvider: (await getActiveAiProvider(db, env))?.provider ?? null } });
  });

  app.post("/settings/ai/test", async (c) => {
    const parsed = aiTestSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "テスト条件が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    let apiKey = parsed.data.apiKey;
    if (!apiKey) {
      const settings = await getAiSettings(db, env);
      apiKey = settings[parsed.data.provider].apiKey ?? undefined;
      if (!apiKey) throw new HttpError(400, "bad_request", `${parsed.data.provider} の API キーが未設定です。キーを入力してからテストしてください`);
    }
    const result = await testAiConnection(parsed.data.provider, { ...parsed.data, apiKey });
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "admin.settings.ai_test",
      detail: { provider: parsed.data.provider, ok: result.ok }
    });
    return c.json(result);
  });

  return app;
}
