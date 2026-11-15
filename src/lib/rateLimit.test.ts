import { afterEach, describe, expect, it } from "vitest";
import { allowRequest, resetRateLimit } from "./rateLimit";

describe("allowRequest", () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_PER_MIN;
    resetRateLimit();
  });

  it("allows 20 requests per minute per key, then blocks until the window resets", () => {
    for (let i = 0; i < 20; i++) expect(allowRequest("auth:1.2.3.4", 1000)).toBe(true);
    expect(allowRequest("auth:1.2.3.4", 1000)).toBe(false);
    expect(allowRequest("auth:1.2.3.4", 61_001)).toBe(true);
  });

  it("keeps separate buckets per route key", () => {
    for (let i = 0; i < 20; i++) allowRequest("summary:1.2.3.4", 1000);
    expect(allowRequest("auth:1.2.3.4", 1000)).toBe(true);
  });

  it("reads an override from RATE_LIMIT_PER_MIN", () => {
    process.env.RATE_LIMIT_PER_MIN = "2";
    expect(allowRequest("k", 1000)).toBe(true);
    expect(allowRequest("k", 1000)).toBe(true);
    expect(allowRequest("k", 1000)).toBe(false);
  });
});
