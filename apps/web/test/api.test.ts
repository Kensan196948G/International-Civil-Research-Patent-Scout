import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, clearToken, getToken, setToken } from "../src/api";

describe("token storage", () => {
  beforeEach(() => clearToken());

  it("stores and clears token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });
});

describe("api client", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    clearToken();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("uses credentials include and parses json", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: "1", role: "user" } }), { status: 200 })
    );
    const res = await api.me();
    expect(res.user.id).toBe("1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/me",
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("sends CSRF token for state-changing requests when cookie is present", async () => {
    document.cookie = "icrps_csrf=csrf-abc; path=/";
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await api.logout();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/logout",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({ "X-CSRF-Token": "csrf-abc" })
      })
    );
    document.cookie = "icrps_csrf=; Max-Age=0";
  });

  it("throws ApiError with body message", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ error: { code: "bad_request", message: "入力内容が不正です" } }), {
        status: 400
      })
    );
    await expect(api.register({ email: "a@b.c", password: "x", name: "x" })).rejects.toMatchObject({
      status: 400,
      code: "bad_request",
      message: "入力内容が不正です"
    });
  });
});

describe("ApiError", () => {
  it("carries status and code", () => {
    const err = new ApiError(404, "not_found", "見つかりません");
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.code).toBe("not_found");
  });
});
