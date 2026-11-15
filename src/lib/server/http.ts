import { NextResponse } from "next/server";
import { allowRequest } from "../rateLimit";
import { clearedCookie, readSession, sessionCookie, type Session } from "./session";

export const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export function clientId(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Each route family has its own bucket, so heavy use of one feature does not block another. */
export function limited(req: Request, bucket = "auth"): NextResponse | null {
  return allowRequest(`${bucket}:${clientId(req)}`) ? null : fail(429, "Too many requests. Please try again in a minute.");
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return undefined;
  }
}

/** Responds with the public account and sets the signed session cookie. */
export function withSession(s: Session, status = 200): NextResponse {
  const res = NextResponse.json({ account: s }, { status });
  const c = sessionCookie(s);
  res.cookies.set(c.name, c.value, c.options);
  return res;
}

export function signedOut(): NextResponse {
  const res = NextResponse.json({ account: null });
  res.cookies.set(clearedCookie.name, clearedCookie.value, clearedCookie.options);
  return res;
}

export function requireRole(req: Request, role: Session["role"]): Session | NextResponse {
  const s = readSession(req);
  if (!s) return fail(401, "Sign in first.");
  if (s.role !== role) return fail(403, role === "employer" ? "Only employer accounts can do this." : "Only candidate accounts can do this.");
  return s;
}
