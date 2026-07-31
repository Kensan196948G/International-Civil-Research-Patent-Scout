import { describe, expect, it } from "vitest";
import { hashPassword, signToken, verifyPassword, verifyToken } from "../src/auth";

const SECRET = "test-secret-value";

describe("auth", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("password-123");
    expect(hash).not.toBe("password-123");
    expect(await verifyPassword("password-123", hash)).toBe(true);
    expect(await verifyPassword("wrong", hash)).toBe(false);
  });

  it("signs and verifies a JWT with subject and role", async () => {
    const token = await signToken("user-1", "admin", SECRET, "1h");
    const payload = await verifyToken(token, SECRET);
    expect(payload.sub).toBe("user-1");
    expect(payload.role).toBe("admin");
  });

  it("rejects tokens signed with a different secret", async () => {
    const token = await signToken("user-1", "user", SECRET, "1h");
    await expect(verifyToken(token, "other-secret")).rejects.toThrow();
  });
});
