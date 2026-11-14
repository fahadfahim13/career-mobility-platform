import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpportunity } from "../../../lib/data";
import { matchOne } from "../../../lib/matching/engine";
import { allowRequest } from "../../../lib/rateLimit";
import { profileSchema } from "../../../lib/schemas";
import { aiSummary } from "../../../lib/summary/ai";

// The client sends its profile; the server recomputes the match itself, so a client cannot inject
// strengths, gaps or flags into the AI prompt. The free-text experience summary is dropped on arrival.
const bodySchema = z.object({
  opportunityId: z.string().max(100),
  profile: profileSchema,
});

function clientId(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: Request) {
  if (!allowRequest(clientId(req))) {
    return NextResponse.json({ error: "Too many requests. Please try again in a minute." }, { status: 429 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "Invalid summary request." }, { status: 400 });

  const opp = getOpportunity(parsed.data.opportunityId);
  if (!opp) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });

  const profile = { ...parsed.data.profile, experienceSummary: "" };
  return NextResponse.json(await aiSummary(opp, matchOne(profile, opp)));
}
