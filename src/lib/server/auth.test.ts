import { beforeEach, describe, expect, it } from "vitest";
import { createAccount, ensureDemoAccount, verifyCredentials } from "./accounts";
import { hashPassword, verifyPassword } from "./password";
import { SESSION_COOKIE, readSession, sessionCookie, signSession, verifySession, type Session } from "./session";
import { memoryStore, setStore } from "./store";

const SECRET = "test-secret-at-least-32-characters-long";
const S: Session = { id: "a1", name: "Lena", email: "lena@example.com", role: "employer", organisation: "Harbourline Logistics" };

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("correct horse");
    expect(stored).not.toContain("correct horse");
    expect(await verifyPassword("correct horse", stored)).toBe(true);
    expect(await verifyPassword("wrong", stored)).toBe(false);
    expect(await verifyPassword("x", "garbage")).toBe(false);
  });

  it("uses a new salt each time", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });
});

describe("session token", () => {
  it("round-trips a signed session", () => {
    const token = signSession(S, SECRET, 1_000);
    expect(verifySession(token, SECRET, 2_000)).toEqual(S);
  });

  it("rejects a tampered, foreign or expired token", () => {
    const token = signSession(S, SECRET, 1_000);
    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...S, role: "employer", organisation: "Other Org", exp: 9e12 })).toString("base64url");
    expect(verifySession(`${forged}.${sig}`, SECRET, 2_000)).toBeNull();
    expect(verifySession(`${body}.${sig}x`, SECRET, 2_000)).toBeNull();
    expect(verifySession(token, "another-secret-of-at-least-32-chars", 2_000)).toBeNull();
    expect(verifySession(token, SECRET, 1_000 + 8 * 24 * 3600 * 1000)).toBeNull();
    expect(verifySession("nonsense", SECRET, 2_000)).toBeNull();
  });

  it("reads the session from the request cookie header", () => {
    process.env.SESSION_SECRET = SECRET;
    const token = signSession(S, SECRET);
    const req = new Request("http://x", { headers: { cookie: `a=1; ${SESSION_COOKIE}=${token}; b=2` } });
    expect(readSession(req)).toEqual(S);
    expect(readSession(new Request("http://x"))).toBeNull();
  });

  it("sets an HttpOnly, SameSite=Lax cookie", () => {
    process.env.SESSION_SECRET = SECRET;
    const c = sessionCookie(S);
    expect(c.name).toBe(SESSION_COOKIE);
    expect(c.options.httpOnly).toBe(true);
    expect(c.options.sameSite).toBe("lax");
  });
});

describe("server accounts", () => {
  beforeEach(() => setStore(memoryStore()));

  it("creates an account, refuses a duplicate email and signs in", async () => {
    const r = await createAccount({ name: "Priya", email: "Priya@Example.com ", password: "long-enough", role: "seeker" });
    expect(r.ok).toBe(true);
    const dup = await createAccount({ name: "P2", email: "priya@example.com", password: "long-enough", role: "seeker" });
    expect(dup).toEqual({ ok: false, error: "email-taken" });
    const s = await verifyCredentials("PRIYA@example.com", "long-enough");
    expect(s?.email).toBe("priya@example.com");
    expect(s?.organisation).toBeNull();
    expect(await verifyCredentials("priya@example.com", "wrong-password")).toBeNull();
  });

  it("requires employers to pick one of the listed organisations", async () => {
    const bad = await createAccount({ name: "E", email: "e@x.com", password: "long-enough", role: "employer", organisation: "Made Up Ltd" });
    expect(bad).toEqual({ ok: false, error: "invalid" });
    const ok = await createAccount({ name: "E", email: "e@x.com", password: "long-enough", role: "employer", organisation: "Harbourline Logistics" });
    expect(ok.ok && ok.session.organisation).toBe("Harbourline Logistics");
  });

  it("demo accounts are created once and reused", async () => {
    const a = await ensureDemoAccount("employer");
    const b = await ensureDemoAccount("employer");
    expect(a.id).toBe(b.id);
    expect(a.organisation).toBe("Harbourline Logistics");
    expect((await ensureDemoAccount("seeker")).role).toBe("seeker");
  });
});
