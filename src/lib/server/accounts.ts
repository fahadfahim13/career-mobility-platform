import { createHash, randomUUID } from "node:crypto";
import { DEMO_ACCOUNTS, signUpSchema, type Role, type SignUpInput } from "../accounts";
import { hashPassword, verifyPassword } from "./password";
import type { Session } from "./session";
import { getStore } from "./store";

interface StoredAccount extends Session {
  passwordHash: string;
  createdAt: string;
}

const emailKey = (email: string) =>
  `accounts/by-email/${createHash("sha256").update(email.trim().toLowerCase()).digest("hex")}.json`;

const toSession = ({ id, name, email, role, organisation }: StoredAccount): Session => ({ id, name, email, role, organisation });

export type CreateResult = { ok: true; session: Session } | { ok: false; error: "email-taken" | "invalid" };

export async function createAccount(input: SignUpInput): Promise<CreateResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const v = parsed.data;
  const store = getStore();
  const key = emailKey(v.email);
  if (await store.getJson(key)) return { ok: false, error: "email-taken" };
  const account: StoredAccount = {
    id: randomUUID(),
    name: v.name,
    email: v.email,
    role: v.role,
    organisation: v.role === "employer" ? (v.organisation ?? null) : null,
    passwordHash: await hashPassword(v.password),
    createdAt: new Date().toISOString(),
  };
  await store.putJson(key, account);
  return { ok: true, session: toSession(account) };
}

export async function verifyCredentials(email: string, password: string): Promise<Session | null> {
  const account = await getStore().getJson<StoredAccount>(emailKey(email));
  // Hash anyway when the account is missing, so response time does not reveal which emails exist.
  if (!account) {
    await verifyPassword(password, "scrypt$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    return null;
  }
  return (await verifyPassword(password, account.passwordHash)) ? toSession(account) : null;
}

/** Demo accounts have no usable password: they are reached only through the one-click demo route. */
export async function ensureDemoAccount(role: Role): Promise<Session> {
  const demo = DEMO_ACCOUNTS[role];
  const store = getStore();
  const key = emailKey(demo.email);
  const existing = await store.getJson<StoredAccount>(key);
  if (existing) return toSession(existing);
  const account: StoredAccount = {
    id: `demo-${role}`,
    name: demo.name,
    email: demo.email,
    role,
    organisation: demo.organisation,
    passwordHash: "disabled",
    createdAt: new Date().toISOString(),
  };
  await store.putJson(key, account);
  return toSession(account);
}
