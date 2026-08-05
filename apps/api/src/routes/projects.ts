import { Hono } from "hono";
import { z } from "zod";
import type { AppBindings } from "../types.js";
import { createDb } from "../db.js";
import { createAuditLog } from "../audit.js";
import { HttpError, notFound } from "../errors.js";
import { requireProjectAccess } from "../access.js";
import { buildInvitationEmail, emailEnabled, sendEmail } from "../email.js";
import {
  addProjectMember,
  archiveProject,
  createProject,
  findUserByEmail,
  getTeamAccess,
  getProjectById,
  listComparisonsByProject,
  listProjectMembers,
  listProjectDocuments,
  listProjectsForUser,
  listReportsByProject,
  removeProjectMember,
  setProjectTeam,
  transferProjectOwnership,
  updateProjectMemberRole,
  updateProject
} from "../repositories.js";
import { requireAuth } from "../auth.js";
import { resolveEnv } from "../env.js";

const projectCreateSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(10000).nullable().optional(),
  tags: z.array(z.string().max(100)).max(50).optional()
});

const projectUpdateSchema = projectCreateSchema
  .partial()
  .extend({ status: z.enum(["active", "archived", "completed"]).optional() });

const memberCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  role: z.enum(["viewer", "editor", "admin"]).default("viewer")
});

const memberUpdateSchema = z.object({
  role: z.enum(["viewer", "editor", "admin"])
});

const transferSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255)
});

const teamAssignSchema = z.object({
  teamId: z.string().uuid().nullable()
});

export function projectRoutes(): Hono<AppBindings> {
  const app = new Hono<AppBindings>();
  app.use("*", requireAuth);

  app.get("/", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const projects = await listProjectsForUser(db, c.get("userId")!);
    return c.json({ projects });
  });

  app.post("/", async (c) => {
    const parsed = projectCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const project = await createProject(db, {
      ownerUserId: c.get("userId")!,
      title: parsed.data.title,
      description: parsed.data.description,
      tags: parsed.data.tags
    });
    await createAuditLog(db, { userId: c.get("userId"), action: "project.create", resourceType: "project", resourceId: project.id });
    return c.json({ project }, 201);
  });

  app.get("/:projectId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "viewer");
    const project = await getProjectById(db, projectId);
    if (!project) throw notFound("プロジェクトが見つかりません");
    const [documents, comparisons, reports, members] = await Promise.all([
      listProjectDocuments(db, project.id),
      listComparisonsByProject(db, project.id),
      listReportsByProject(db, project.id),
      listProjectMembers(db, project.id)
    ]);
    return c.json({ project, documents, comparisons, reports, members });
  });

  app.patch("/:projectId", async (c) => {
    const parsed = projectUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "入力内容が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "editor");
    const project = await updateProject(db, projectId, parsed.data);
    await createAuditLog(db, { userId: c.get("userId"), action: "project.update", resourceType: "project", resourceId: project!.id });
    return c.json({ project });
  });

  app.delete("/:projectId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "admin");
    const project = await archiveProject(db, projectId);
    await createAuditLog(db, { userId: c.get("userId"), action: "project.archive", resourceType: "project", resourceId: projectId });
    return c.json({ project });
  });

  app.get("/:projectId/members", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "viewer");
    return c.json({ members: await listProjectMembers(db, projectId) });
  });

  app.post("/:projectId/members", async (c) => {
    const parsed = memberCreateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "メンバー指定が不正です", parsed.error.flatten());
    const env = resolveEnv(c.env);
    const db = createDb(env);
    const userId = c.get("userId")!;
    const { projectId } = await requireProjectAccess(db, userId, c.req.param("projectId"), "admin");
    const target = await findUserByEmail(db, parsed.data.email);
    if (!target) throw notFound("このメールアドレスのユーザーが見つかりません");
    if (target.id === userId) throw new HttpError(400, "bad_request", "オーナー自身をメンバーに追加する必要はありません");
    const member = await addProjectMember(db, projectId, target.id, parsed.data.role);
    let emailSent = false;
    if (emailEnabled(env)) {
      const project = await getProjectById(db, projectId);
      if (project) {
        emailSent = await sendEmail(
          buildInvitationEmail({
            projectTitle: project.title,
            role: parsed.data.role,
            appUrl: env.APP_URL,
            invitedEmail: target.email
          }),
          env
        );
      }
    }
    await createAuditLog(db, {
      userId,
      action: "project.member_add",
      resourceType: "project",
      resourceId: projectId,
      detail: { memberUserId: target.id, role: parsed.data.role, emailSent }
    });
    return c.json({ member }, 201);
  });

  app.patch("/:projectId/members/:memberUserId", async (c) => {
    const parsed = memberUpdateSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "ロール指定が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "admin");
    const member = await updateProjectMemberRole(db, projectId, c.req.param("memberUserId"), parsed.data.role);
    if (!member) throw notFound("メンバーが見つかりません");
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "project.member_role_update",
      resourceType: "project",
      resourceId: projectId,
      detail: { memberUserId: member.userId, role: parsed.data.role }
    });
    return c.json({ member });
  });

  app.delete("/:projectId/members/:memberUserId", async (c) => {
    const db = createDb(resolveEnv(c.env));
    const { projectId } = await requireProjectAccess(db, c.get("userId")!, c.req.param("projectId"), "admin");
    const removed = await removeProjectMember(db, projectId, c.req.param("memberUserId"));
    if (!removed) throw notFound("メンバーが見つかりません");
    await createAuditLog(db, {
      userId: c.get("userId"),
      action: "project.member_remove",
      resourceType: "project",
      resourceId: projectId,
      detail: { memberUserId: c.req.param("memberUserId") }
    });
    return c.body(null, 204);
  });

  app.post("/:projectId/transfer", async (c) => {
    const parsed = transferSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "移譲先のメールアドレスが不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const userId = c.get("userId")!;
    const { projectId, isOwner } = await requireProjectAccess(db, userId, c.req.param("projectId"), "admin");
    if (!isOwner) throw new HttpError(403, "forbidden", "オーナーのみがプロジェクトを移譲できます");
    const target = await findUserByEmail(db, parsed.data.email);
    if (!target) throw notFound("このメールアドレスのユーザーが見つかりません");
    if (target.id === userId) throw new HttpError(400, "bad_request", "自分自身への移譲は不要です");
    const project = await transferProjectOwnership(db, projectId, userId, target.id);
    await createAuditLog(db, {
      userId,
      action: "project.transfer",
      resourceType: "project",
      resourceId: projectId,
      detail: { newOwnerUserId: target.id }
    });
    return c.json({ project });
  });

  app.post("/:projectId/team", async (c) => {
    const parsed = teamAssignSchema.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "bad_request", "チーム指定が不正です", parsed.error.flatten());
    const db = createDb(resolveEnv(c.env));
    const userId = c.get("userId")!;
    const { projectId } = await requireProjectAccess(db, userId, c.req.param("projectId"), "admin");
    if (parsed.data.teamId) {
      const teamAccess = await getTeamAccess(db, parsed.data.teamId, userId);
      if (!teamAccess) throw notFound("チームが見つかりません");
    }
    const project = await setProjectTeam(db, projectId, parsed.data.teamId);
    await createAuditLog(db, {
      userId,
      action: "project.team_assign",
      resourceType: "project",
      resourceId: projectId,
      detail: { teamId: parsed.data.teamId }
    });
    return c.json({ project });
  });

  return app;
}
