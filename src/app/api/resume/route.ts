import { NextResponse } from "next/server";
import { allowRequest } from "../../../lib/rateLimit";
import { extractResume, isPdf } from "../../../lib/resume/extract";
import { storeResume } from "../../../lib/resume/store";
import { readSession } from "../../../lib/server/session";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Vercel caps request bodies at 4.5 MB; 4 MB leaves room for the form encoding. */
const MAX_RESUME_BYTES = 4 * 1024 * 1024;

function clientId(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return fail(503, "Resume reading is not available right now. Please fill in the form by hand.");
  if (!allowRequest(`resume:${clientId(req)}`)) return fail(429, "Too many requests. Please try again in a minute.");

  let file: FormDataEntryValue | null;
  try {
    file = (await req.formData()).get("resume");
  } catch {
    return fail(400, "Upload a PDF file.");
  }
  if (!(file instanceof File) || file.size === 0) return fail(400, "Upload a PDF file.");
  if (file.size > MAX_RESUME_BYTES) return fail(413, "The file is larger than 4 MB. Upload a smaller PDF.");

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!isPdf(bytes)) return fail(415, "This file is not a PDF. Save your resume as a PDF and try again.");

  // Storage runs alongside extraction; a storage failure never blocks the form from filling.
  const owner = readSession(req)?.id ?? "anon";
  const stored = storeResume(bytes, owner).catch((err: unknown) => {
    console.warn("[resume] storage failed:", err instanceof Error ? err.message : err);
    return null;
  });
  try {
    const fields = await extractResume(bytes, { apiKey });
    const resumeId = await stored;
    return NextResponse.json({ fields, stored: resumeId !== null, resumeId });
  } catch (err) {
    console.warn("[resume] extraction failed:", err instanceof Error ? err.message : err);
    await stored;
    return fail(502, "We could not read this resume. Please fill in the form by hand.");
  }
}
