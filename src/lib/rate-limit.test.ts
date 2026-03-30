import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, resetRateLimit, resetAllRateLimits } from "./rate-limit";

describe("checkRateLimit", () => {
  beforeEach(() => {
    resetAllRateLimits();
  });

  it("allows requests under the limit", () => {
    const result = checkRateLimit("user:1", 3, 60_000);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfterMs).toBeNull();
  });

  it("blocks requests over the limit", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user:2", 3, 60_000);
    }
    const result = checkRateLimit("user:2", 3, 60_000);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it("tracks users independently", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user:a", 3, 60_000);
    }
    const resultA = checkRateLimit("user:a", 3, 60_000);
    const resultB = checkRateLimit("user:b", 3, 60_000);

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it("decrements remaining correctly", () => {
    const r1 = checkRateLimit("user:3", 5, 60_000);
    const r2 = checkRateLimit("user:3", 5, 60_000);
    const r3 = checkRateLimit("user:3", 5, 60_000);

    expect(r1.remaining).toBe(4);
    expect(r2.remaining).toBe(3);
    expect(r3.remaining).toBe(2);
  });

  it("resets via resetRateLimit", () => {
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user:4", 3, 60_000);
    }
    expect(checkRateLimit("user:4", 3, 60_000).allowed).toBe(false);

    resetRateLimit("user:4");
    expect(checkRateLimit("user:4", 3, 60_000).allowed).toBe(true);
  });

  it("allows requests after window expires", () => {
    // Use a tiny window so entries expire immediately
    for (let i = 0; i < 3; i++) {
      checkRateLimit("user:5", 3, 1);
    }
    // Wait just 2ms for the window to pass
    const start = Date.now();
    while (Date.now() - start < 2) {
      /* spin */
    }
    const result = checkRateLimit("user:5", 3, 1);
    expect(result.allowed).toBe(true);
  });
});
