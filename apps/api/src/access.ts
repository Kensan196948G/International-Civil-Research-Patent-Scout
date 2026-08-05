// プロジェクトアクセス制御（オーナー＝admin、メンバーは viewer/editor/admin）
import type { ProjectMemberRole } from "@icrps/contracts";
import type { Db } from "./db.js";
import { HttpError, notFound } from "./errors.js";
import { getProjectAccess } from "./repositories.js";

const ROLE_LEVEL: Record<ProjectMemberRole, number> = {
  viewer: 1,
  editor: 2,
  admin: 3
};

const ROLE_LABEL: Record<ProjectMemberRole, string> = {
  viewer: "閲覧",
  editor: "編集",
  admin: "管理"
};

export function roleAtLeast(role: ProjectMemberRole, min: ProjectMemberRole): boolean {
  return ROLE_LEVEL[role] >= ROLE_LEVEL[min];
}

export async function requireProjectAccess(
  db: Db,
  userId: string,
  projectId: string,
  minRole: ProjectMemberRole = "viewer"
): Promise<{ projectId: string; role: ProjectMemberRole; isOwner: boolean }> {
  const access = await getProjectAccess(db, userId, projectId);
  if (!access) throw notFound("プロジェクトが見つかりません");
  if (!roleAtLeast(access.role, minRole)) {
    throw new HttpError(403, "forbidden", `この操作には${ROLE_LABEL[minRole]}以上の権限が必要です`);
  }
  return { projectId: access.project.id, role: access.role, isOwner: access.isOwner };
}
