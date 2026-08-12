import { Hono } from "hono";
import { z } from "zod";
import { isEmailDomainAllowed, resolveEnv } from "../env.js";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { conflict, forbidden, HttpError, unauthorized } from "../errors.js";
import {
  adminUserCount,
  createUser,
  createAuthToken,
  findAuthTokenByHash,
  findUserByEmail,
  findUserById,
  findUserCredentialsByEmail,
  markAuthTokenUsed,
  updateUserRole,
  updateUserPassword
} from "../repositories.js";
import { hashPassword, hashToken, randomToken, requireAuth, signToken, verifyPassword } from "../auth.js";
import { clientIp, rateLimit } from "../rate-limit.js";
import {
  buildMagicLinkEmail,
  buildPasswordResetEmail,
  emailEnabled,
  sendEmail
} from "../email.js";

const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(200),
  name: z.string().min(1).max(255)
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(200)
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200)
});

const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255)
});

const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  newPassword: z.string().min(8).max(200)
});

const magicVerifySchema = z.object({
  token: z.string().min(20).max(200)
});

async function resolveBootstrapRole(
  db: ReturnType<typeof createDb>,
  env: ReturnType<typeof resolveEnv>,
  email: string
): Promise<"admin" | "user"> {
  if (env.BOOTSTRAP_ADMIN_EMAIL && env.BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase() === email.toLowerCase()) {
    const admins = await adminUserCount(db);
    if (admins === 0) return "admin";
  }
  return "user";
}

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
    if (!isEmailDomainAllowed(parsed.data.email, env)) {
      throw forbidden("このメールドメインは登録できません（管理者へ連絡してください）");
    }
    const role = await resolveBootstrapRole(db, env, parsed.data.email);
    const user = await createUser(db, {
      email: parsed.data.email,
      name: parsed.data.name,
      passwordHash: await hashPassword(parsed.data.password),
      role
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
    let user = credentials.user;
    const role = await resolveBootstrapRole(db, env, user.email);
    if (role === "admin" && user.role !== "admin") {
      user = (await updateUserRole(db, user.id, "admin")) ?? user;
    }
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

  app.post("/change-password", requireAuth, async (c) => {
    const parsed = changePasswordSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const userId = c.get("userId")!;
    const user = await findUserById(db, userId);
    if (!user) throw unauthorized("ユーザーが見つかりません");
    const credentials = await findUserCredentialsByEmail(db, user.email);
    if (!credentials || !(await verifyPassword(parsed.data.currentPassword, credentials.passwordHash))) {
      throw new HttpError(400, "bad_request", "現在のパスワードが正しくありません");
    }
    await updateUserPassword(db, userId, await hashPassword(parsed.data.newPassword));
    await createAuditLog(db, { userId, action: "auth.change_password" });
    return c.json({ ok: true });
  });

  app.post("/forgot-password", async (c) => {
    const parsed = emailSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "メールアドレスが不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const user = await findUserByEmail(db, parsed.data.email);
    if (user && emailEnabled(env)) {
      const token = randomToken();
      await createAuthToken(db, {
        userId: user.id,
        kind: "reset",
        tokenHash: await hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      await sendEmail(
        buildPasswordResetEmail({
          resetUrl: `${env.APP_URL}/reset-password?token=${token}`,
          appUrl: env.APP_URL,
          email: user.email
        }),
        env
      );
    }
    // ユーザー存在有無を漏らさないため常に成功を返す
    return c.json({ ok: true });
  });

  app.post("/reset-password", async (c) => {
    const parsed = resetPasswordSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const token = await findAuthTokenByHash(db, "reset", await hashToken(parsed.data.token));
    if (!token || token.usedAt || new Date(token.expiresAt).getTime() < Date.now()) {
      throw new HttpError(400, "bad_request", "リンクが無効または期限切れです");
    }
    await updateUserPassword(db, token.userId, await hashPassword(parsed.data.newPassword));
    await markAuthTokenUsed(db, token.id);
    await createAuditLog(db, { userId: token.userId, action: "auth.password_reset" });
    return c.json({ ok: true });
  });

  app.post("/magic-link", async (c) => {
    const parsed = emailSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "メールアドレスが不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const user = await findUserByEmail(db, parsed.data.email);
    if (user && emailEnabled(env)) {
      const token = randomToken();
      await createAuthToken(db, {
        userId: user.id,
        kind: "magic",
        tokenHash: await hashToken(token),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      });
      await sendEmail(
        buildMagicLinkEmail({
          loginUrl: `${env.APP_URL}/login?magic=${token}`,
          appUrl: env.APP_URL,
          email: user.email
        }),
        env
      );
    }
    return c.json({ ok: true });
  });

  app.post("/magic-link/verify", async (c) => {
    const parsed = magicVerifySchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "トークンが不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const token = await findAuthTokenByHash(db, "magic", await hashToken(parsed.data.token));
    if (!token || token.usedAt || new Date(token.expiresAt).getTime() < Date.now()) {
      throw new HttpError(400, "bad_request", "リンクが無効または期限切れです");
    }
    const user = await findUserById(db, token.userId);
    if (!user) throw unauthorized("ユーザーが見つかりません");
    await markAuthTokenUsed(db, token.id);
    const accessToken = await signToken(user.id, user.role, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    await createAuditLog(db, { userId: user.id, action: "auth.magic_login" });
    return c.json({ accessToken, user });
  });

  app.get("/sso", async (c) => {
    const env = resolveEnv(c.env);
    return c.json({ google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) });
  });

  app.get("/sso/google/url", async (c) => {
    const env = resolveEnv(c.env);
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new HttpError(400, "bad_request", "Google SSO が設定されていません");
    }
    const redirectUri = `${env.APP_URL}/api/auth/sso/google/callback`;
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "online"
    });
    return c.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}` });
  });

  app.get("/sso/google/callback", async (c) => {
    const env = resolveEnv(c.env);
    const code = c.req.query("code");
    if (!code || !env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      throw new HttpError(400, "bad_request", "SSO コールバックが不正です");
    }
    const redirectUri = `${env.APP_URL}/api/auth/sso/google/callback`;
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!tokenResponse.ok) throw new HttpError(400, "bad_request", "Google の認証に失敗しました");
    const tokenData = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenData.access_token) throw new HttpError(400, "bad_request", "Google の認証に失敗しました");
    const infoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      signal: AbortSignal.timeout(15000)
    });
    if (!infoResponse.ok) throw new HttpError(400, "bad_request", "Google のユーザー情報を取得できませんでした");
    const info = (await infoResponse.json()) as { email?: string; name?: string };
    if (!info.email) throw new HttpError(400, "bad_request", "メールアドレスが取得できませんでした");
    if (!isEmailDomainAllowed(info.email, env)) {
      throw forbidden("このメールドメインは利用できません（管理者へ連絡してください）");
    }
    const db = createDb(env);
    let user = await findUserByEmail(db, info.email);
    if (!user) {
      const role = await resolveBootstrapRole(db, env, info.email);
      user = await createUser(db, {
        email: info.email,
        name: info.name ?? info.email.split("@")[0] ?? "SSO User",
        passwordHash: await hashPassword(randomToken()),
        role
      });
    } else {
      const role = await resolveBootstrapRole(db, env, user.email);
      if (role === "admin" && user.role !== "admin") {
        user = (await updateUserRole(db, user.id, "admin")) ?? user;
      }
    }
    const accessToken = await signToken(user.id, user.role, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    await createAuditLog(db, { userId: user.id, action: "auth.sso_google" });
    return c.redirect(`${env.APP_URL}/login?token=${encodeURIComponent(accessToken)}`);
  });

  return app;
}
