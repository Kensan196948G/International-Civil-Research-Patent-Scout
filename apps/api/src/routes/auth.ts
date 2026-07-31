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

const registerSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(255)
});

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(200)
});

export function authRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();

  app.post("/register", async (c) => {
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
    const parsed = loginSchema.safeParse(await c.req.json().catch(() => null));
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
