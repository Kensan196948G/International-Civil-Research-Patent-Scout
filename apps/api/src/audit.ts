import type { Db } from "./db.js";

export async function createAuditLog(
  db: Db,
  input: {
    userId?: string | null;
    action: string;
    resourceType?: string | null;
    resourceId?: string | null;
    detail?: Record<string, unknown> | null;
  }
): Promise<void> {
  await db(
    `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, detail)
     VALUES ($1, $2, $3, $4, $5)`,
    [
      input.userId ?? null,
      input.action,
      input.resourceType ?? null,
      input.resourceId ?? null,
      input.detail ? JSON.stringify(input.detail) : null
    ]
  );
}
