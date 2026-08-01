import { Hono } from "hono";
import { z } from "zod";
import { resolveEnv } from "../env.js";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { conflict, HttpError, unauthorized } from "../errors.js";
import { createUser, findUserByEmail, findUserById } from "../repositories.js";
import { findUserCredentialsByEmail } from "../repositories.js";
import { hashPassword, requireAuth, signToken, verifyPassword } from "../auth.js";
import { clientIp, rateLimit } from "../rate-limit.js";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(255)
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200)
});

export function authRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  app.post("/register", async (c) => {
    const limited = rateLimit(`register:${clientIp(c)}`, 10, 60 * 60 * 1000);
    if (!limited.allowed) {
      return c.json(
        { error: { code: "rate_limited", message: "登録試行が多すぎます。しばらく待ってから再試行してください" } },
        429,
        { "Retry-After": String(limited.retryAfterSeconds) }
      );
    }
    const parsed = registerSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const existing = await findUserByEmail(db, parsed.data.email);
    if (existing) throw conflict("このメールアドレスは既に登録されています");
    const user = await createUser(db, {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password)
    });
    const token = await signToken(user.id, user.role, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    await createAuditLog(db, { userId: user.id, action: "auth.register", detail: { email: user.email } });
    return c.json({ accessToken: token, user }, 201);
  });

  app.post("/login", async (c) => {
    const body = (await c.req.json().catch(() => null)) as { email?: string } | null;
    const limited = rateLimit(`login:${clientIp(c)}:${body?.email?.trim().toLowerCase() ?? "-"}`, 10, 15 * 60 * 1000);
    if (!limited.allowed) {
      return c.json(
        { error: { code: "rate_limited", message: "ログイン試行が多すぎます。しばらく待ってから再試行してください" } },
        429,
        { "Retry-After": String(limited.retryAfterSeconds) }
      );
    }
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です");
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const credentials = await findUserCredentialsByEmail(db, parsed.data.email);
    if (!credentials || !(await verifyPassword(parsed.data.password, credentials.passwordHash))) {
      throw unauthorized("メールアドレスまたはパスワードが正しくありません");
    }
    const user = credentials.user;
    const token = await signToken(user.id, user.role, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    await createAuditLog(db, { userId: user.id, action: "auth.login" });
    return c.json({ accessToken: token, user });
  });

  app.get("/me", requireAuth, async (c) => {
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const user = await findUserById(db, c.get("userId")!);
    if (!user) throw unauthorized("ユーザーが見つかりません");
    return c.json({ user });
  });

  return app;
}
