// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  ACCOUNTS_KEY,
  createAccount,
  currentAccount,
  DEMO_ACCOUNTS,
  signIn,
  signInDemo,
  signOut,
  signUpSchema,
} from "./accounts";

const seeker = { name: "Amira Haddad", email: "Amira@Example.com", password: "correct-horse", role: "seeker" as const };
const employer = {
  name: "Lena Vogel",
  email: "lena@northwind.example",
  password: "hiring-2026",
  role: "employer" as const,
  organisation: "Northwind Logistics",
};

describe("accounts (browser-only demo auth)", () => {
  beforeEach(() => window.localStorage.clear());

  it("creates an account, signs it in, and never stores the password in plain text", async () => {
    const r = await createAccount(seeker);
    expect(r.ok).toBe(true);
    expect(currentAccount()).toMatchObject({ name: "Amira Haddad", email: "amira@example.com", role: "seeker" });
    const raw = window.localStorage.getItem(ACCOUNTS_KEY) ?? "";
    expect(raw).not.toContain("correct-horse");
  });

  it("rejects a second account with the same email, case-insensitive", async () => {
    await createAccount(seeker);
    const r = await createAccount({ ...seeker, email: "amira@example.com" });
    expect(r).toEqual({ ok: false, error: "email-taken" });
  });

  it("signs in with the right password only", async () => {
    await createAccount(employer);
    signOut();
    expect(currentAccount()).toBeNull();
    expect(await signIn("lena@northwind.example", "wrong-password")).toEqual({ ok: false, error: "invalid-credentials" });
    expect(await signIn("nobody@example.com", "hiring-2026")).toEqual({ ok: false, error: "invalid-credentials" });
    const ok = await signIn("LENA@northwind.example", "hiring-2026");
    expect(ok.ok).toBe(true);
    expect(currentAccount()).toMatchObject({ role: "employer", organisation: "Northwind Logistics" });
  });

  it("requires an organisation for employers and an 8-character password", () => {
    expect(signUpSchema.safeParse({ ...employer, organisation: "" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...seeker, password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse(seeker).success).toBe(true);
  });

  it("demo sign-in creates the demo account once and reuses it", async () => {
    const a = await signInDemo("employer");
    signOut();
    const b = await signInDemo("employer");
    expect(a.id).toBe(b.id);
    expect(b.email).toBe(DEMO_ACCOUNTS.employer.email);
    expect(currentAccount()?.role).toBe("employer");
  });

  it("survives corrupt account storage without throwing", async () => {
    window.localStorage.setItem(ACCOUNTS_KEY, "{not json");
    expect(currentAccount()).toBeNull();
    const r = await createAccount(seeker);
    expect(r.ok).toBe(true);
  });
});
