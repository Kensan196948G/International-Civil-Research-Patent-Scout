import { describe, expect, it } from "vitest";
import { hashToken, randomToken } from "../src/auth";
import type { Db } from "../src/db";
import { createAuthToken, findAuthTokenByHash, markAuthTokenUsed } from "../src/repositories";

function fakeDb(store: { rows: Array<Record<string, unknown>> }): Db {
  return async (query, params = []) => {
    if (query.includes("INSERT INTO auth_tokens")) {
      const row = {
        id: "t1",
        user_id: params[0],
        kind: params[1],
        token_hash: params[2],
        expires_at: params[3],
        used_at: null,
        created_at: "2026-08-01T00:00:00Z"
      };
      store.rows.push(row);
      return [row];
    }
    if (query.includes("FROM auth_tokens")) {
      return store.rows.filter((r) => r.kind === params[0] && r.token_hash === params[1]);
    }
    if (query.includes("UPDATE auth_tokens")) {
      const row = store.rows.find((r) => r.id === params[0]);
      if (row) row.used_at = "2026-08-02T00:00:00Z";
      return [];
    }
    return [];
  };
}

describe("auth tokens", () => {
  it("generates random tokens and stable hashes", async () => {
    const token = randomToken();
    expect(token.length).toBeGreaterThanOrEqual(32);
    expect(await hashToken(token)).toBe(await hashToken(token));
    expect(await hashToken(token)).not.toBe(token);
  });

  it("creates, finds and marks tokens as used", async () => {
    const store = { rows: [] as Array<Record<string, unknown>> };
    const db = fakeDb(store);
    const tokenHash = await hashToken("secret-token");
    await createAuthToken(db, { userId: "u1", kind: "magic", tokenHash, expiresAt: "2026-08-02T00:00:00Z" });
    const found = await findAuthTokenByHash(db, "magic", tokenHash);
    expect(found?.userId).toBe("u1");
    await markAuthTokenUsed(db, found!.id);
    expect(store.rows[0]?.used_at).not.toBeNull();
  });
});
