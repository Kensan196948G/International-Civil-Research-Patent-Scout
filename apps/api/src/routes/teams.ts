// 組織（チーム）管理 API
import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireAuth } from "../auth.js";
import { resolveEnv } from "../env.js";
import { buildTeamInvitationEmail, emailEnabled, sendEmail } from "../email.js";
import {
  addTeamMember,
  createTeam,
  findUserByEmail,
  getTeamAccess,
  getTeamStats,
  listTeamMembers,
  listTeamsForUser,
  removeTeamMember,
  updateTeamMemberRole,
  updateTeamName
} from "../repositories.js";

const teamCreateSchema = z.object({
  name: z.string().min(1).max(200)
});

const teamUpdateSchema = z.object({
  name: z.string().min(1).max(200)
});

const memberCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(["viewer", "editor", "admin"]).default("viewer")
});

const memberUpdateSchema = z.object({
  role: z.enum(["viewer", "editor", "admin"])
});

export function teamRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.post("/teams", async (c) => {
    const parsed = teamCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "チーム名が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const team = await createTeam(db, parsed.data.name, c.get("userId")!);
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "team.create",
      resourceType: "team",
      resourceId: team.id
    });
    return c.json({ team }, 201);
  });

  app.get("/teams", async (c) => {
    const db = createDb(resolveEnv(c.env));
    return c.json({ teams: await listTeamsForUser(db, c.get("userId")!) });
  });

  app.patch("/teams/:teamId", async (c) => {
    const parsed = teamUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "チーム名が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const access = await getTeamAccess(db, c.req.param("teamId"), c.get("userId")!);
    if (!access) throw notFound("チームが見つかりません");
    const updated = await updateTeamName(db, access.team.id, parsed.data.name);
    await createAuditLog(db, { userId: c.get("userId"), action: "team.update", resourceType: "team", resourceId: access.team.id });
    return c.json({ team: updated });
  });

  app.get("/teams/:teamId/members", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const access = await getTeamAccess(db, c.req.param("teamId"), c.get("userId")!);
    if (!access) throw notFound("チームが見つかりません");
    return c.json({ members: await listTeamMembers(db, access.team.id) });
  });

  app.get("/teams/:teamId/stats", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const access = await getTeamAccess(db, c.req.param("teamId"), c.get("userId")!);
    if (!access) throw notFound("チームが見つかりません");
    return c.json({ stats: await getTeamStats(db, access.team.id) });
  });

  app.post("/teams/:teamId/members", async (c) => {
    const parsed = memberCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "メンバー指定が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const userId = c.get("userId")!;
    const access = await getTeamAccess(db, c.req.param("teamId"), userId);
    if (!access) throw notFound("チームが見つかりません");
    if (access.role !== "admin") throw new HttpError(403, "forbidden", "チーム管理者のみメンバーを追加できます");
    const target = await findUserByEmail(db, parsed.data.email);
    if (!target) throw notFound("このメールアドレスのユーザーが見つかりません");
    if (target.id === access.team.createdBy) {
      throw new HttpError(400, "bad_request", "チーム作成者はメンバー追加不要です");
    }
    const member = await addTeamMember(db, access.team.id, target.id, parsed.data.role);
    let emailSent = false;
    if (emailEnabled(env)) {
      emailSent = await sendEmail(
        buildTeamInvitationEmail({
          teamName: access.team.name,
          role: parsed.data.role,
          appUrl: env.APP_URL,
          invitedEmail: target.email
        }),
        env
      );
    }
    await createAuditLog(db, {
      userId,
      action: "team.member_add",
      resourceType: "team",
      resourceId: access.team.id,
      detail: { memberUserId: target.id, role: parsed.data.role, emailSent }
    });
    return c.json({ member }, 201);
  });

  app.patch("/teams/:teamId/members/:memberUserId", async (c) => {
    const parsed = memberUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "ロール指定が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const access = await getTeamAccess(db, c.req.param("teamId"), c.get("userId")!);
    if (!access) throw notFound("チームが見つかりません");
    if (access.role !== "admin") throw new HttpError(403, "forbidden", "チーム管理者のみロールを変更できます");
    const member = await updateTeamMemberRole(db, access.team.id, c.req.param("memberUserId"), parsed.data.role);
    if (!member) throw notFound("メンバーが見つかりません");
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "team.member_role_update",
      resourceType: "team",
      resourceId: access.team.id,
      detail: { memberUserId: member.userId, role: parsed.data.role }
    });
    return c.json({ member });
  });

  app.delete("/teams/:teamId/members/:memberUserId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const access = await getTeamAccess(db, c.req.param("teamId"), c.get("userId")!);
    if (!access) throw notFound("チームが見つかりません");
    if (access.role !== "admin") throw new HttpError(403, "forbidden", "チーム管理者のみメンバーを削除できます");
    const removed = await removeTeamMember(db, access.team.id, c.req.param("memberUserId"));
    if (!removed) throw notFound("メンバーが見つかりません");
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "team.member_remove",
      resourceType: "team",
      resourceId: access.team.id,
      detail: { memberUserId: c.req.param("memberUserId") }
    });
    return c.body(null, 204);
  });

  return app;
}
