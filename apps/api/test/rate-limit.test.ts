import { beforeEach, describe, expect, it } from "vitest";
import { clearRateLimits, clientIp, rateLimit } from "../src/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => clearRateLimits());

  it("allows requests within the limit", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("k", 3, 60000).allowed).toBe(true);
    }
  });

  it("denies requests over the limit with retry-after", () => {
    for (let i = 0; i < 3; i++) rateLimit("k", 3, 60000);
    const result = rateLimit("k", 3, 60000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets after the window expires", () => {
    const originalNow = Date.now;
    let now = 1_000_000;
    Date.now = () => now;
    try {
      for (let i = 0; i < 2; i++) rateLimit("k", 2, 1000);
      expect(rateLimit("k", 2, 1000).allowed).toBe(false);
      now += 1001;
      expect(rateLimit("k", 2, 1000).allowed).toBe(true);
    } finally {
      Date.now = originalNow;
    }
  });

  it("separates keys by client ip", () => {
    const c = { req: { header: (name: string) => (name === "cf-connecting-ip" ? "203.0.113.5" : undefined) } };
    expect(clientIp(c)).toBe("203.0.113.5");
    expect(clientIp({ req: { header: () => undefined } })).toBe("local");
  });
});
