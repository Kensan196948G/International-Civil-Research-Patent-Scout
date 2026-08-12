import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { resolveEnv } from "../env.js";
import { requireAuth } from "../auth.js";
import { HttpError } from "../errors.js";
import { runFitCheck, type FitRequest } from "../fit.js";

const fitSchema = z.object({
  workType: z.string().max(200).default(""),
  environment: z.string().max(200).default(""),
  designStrength: z.string().max(200).default(""),
  cover: z.string().max(200).default(""),
  serviceLife: z.string().max(200).default(""),
  co2Target: z.string().max(200).default(""),
  candidates: z.string().min(1).max(1000)
});

export function fitRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/fit", async (c) => {
    const parsed = fitSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "適用可否チェックの入力が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const req: FitRequest = {
      workType: parsed.data.workType,
      environment: parsed.data.environment,
      designStrength: parsed.data.designStrength,
      cover: parsed.data.cover,
      serviceLife: parsed.data.serviceLife,
      co2Target: parsed.data.co2Target,
      candidates: parsed.data.candidates
    };
    const result = await runFitCheck(db, c.get("userId")!, req);
    return c.json(result);
  });

  return app;
}
