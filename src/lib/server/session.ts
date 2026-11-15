import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export const SESSION_COOKIE = "pathway_session";
const MAX_AGE_S = 7 * 24 * 3600;

const sessionSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.enum(["seeker", "employer"]),
  organisation: z.string().nullable(),
});
export type Session = z.infer<typeof sessionSchema>;

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ characters)");
  return "local-development-secret-not-for-production";
}

const sign = (body: string, key: string) => createHmac("sha256", key).update(body).digest("base64url");

/** "<base64url payload>.<HMAC-SHA256>". The payload is readable but cannot be changed without the secret. */
export function signSession(s: Session, key = secret(), now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ ...s, exp: now + MAX_AGE_S * 1000 })).toString("base64url");
  return `${body}.${sign(body, key)}`;
}

export function verifySession(token: string, key = secret(), now = Date.now()): Session | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = Buffer.from(sign(body, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const raw = JSON.parse(Buffer.from(body, "base64url").toString()) as { exp?: unknown };
    if (typeof raw.exp !== "number" || raw.exp < now) return null;
    const parsed = sessionSchema.safeParse(raw);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function readSession(req: Request): Session | null {
  const cookie = req.headers.get("cookie") ?? "";
  const token = cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  return token ? verifySession(decodeURIComponent(token)) : null;
}

export function sessionCookie(s: Session) {
  return {
    name: SESSION_COOKIE,
    value: signSession(s),
    options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: MAX_AGE_S },
  };
}

export const clearedCookie = {
  name: SESSION_COOKIE,
  value: "",
  options: { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 0 },
};
