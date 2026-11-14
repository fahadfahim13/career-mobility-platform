import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpportunity } from "../../../lib/data";
import { aiSummary } from "../../../lib/summary/ai";

const status = z.enum(["met", "partial", "unmet", "unknown"]);
const text = z.string().max(400);

// The client sends the rule-engine result, not the profile, so no personal free text reaches the server.
const bodySchema = z.object({
  opportunityId: z.string().max(100),
  result: z.object({
    opportunityId: z.string().max(100),
    score: z.number().int().min(0).max(100),
    band: z.enum(["Strong", "Partial", "Weak", "Critical gap"]),
    criteria: z
      .array(
        z.object({
          key: z.enum(["skills", "experience", "education", "location", "language", "interests"]),
          label: text,
          weight: z.number(),
          score: z.number().min(0).max(1).nullable(),
          points: z.number(),
          status,
          detail: text,
        }),
      )
      .max(10),
    strengths: z.array(text).max(10),
    gaps: z.array(text).max(10),
    flags: z.array(z.object({ kind: z.enum(["critical", "verify", "missing"]), message: text })).max(20),
  }),
});

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || parsed.data.result.opportunityId !== parsed.data.opportunityId) {
    return NextResponse.json({ error: "Invalid summary request." }, { status: 400 });
  }
  const opp = getOpportunity(parsed.data.opportunityId);
  if (!opp) return NextResponse.json({ error: "Opportunity not found." }, { status: 404 });

  return NextResponse.json(await aiSummary(opp, parsed.data.result));
}
