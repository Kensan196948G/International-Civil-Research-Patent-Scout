import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/App";
import { clearToken } from "../src/api";

describe("App", () => {
  beforeEach(() => {
    clearToken();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: { code: "unauthorized", message: "認証が必要です" } }), { status: 401 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("redirects unauthenticated users to login", async () => {
    render(<App />);
    expect(await screen.findByRole("heading", { name: "ログイン" })).toBeTruthy();
  });
});
