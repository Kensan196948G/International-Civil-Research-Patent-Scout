import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError } from "../errors.js";
import { requireAuth } from "../auth.js";
import { resolveEnv } from "../env.js";
import { getActiveAiProvider } from "../settings.js";
import { answerChat } from "../chat.js";

const chatSchema = z.object({
  message: z.string().min(1).max(2000)
});

export function chatRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/chat", async (c) => {
    const parsed = chatSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "メッセージが不正です");
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const provider = await getActiveAiProvider(db, env);
    const result = await answerChat(db, env, provider, c.get("userId")!, parsed.data.message);
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "chat.ask",
      detail: { mode: result.mode, citeCount: result.cites.length }
    });
    return c.json(result);
  });

  return app;
}
