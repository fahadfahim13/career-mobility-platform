import { NextResponse } from "next/server";
import { getOpportunities } from "../../../../lib/data";
import { listApplicants } from "../../../../lib/server/applications";
import { requireRole } from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

/** Applicants for the roles of the signed-in employer's organisation only. */
export async function GET(req: Request) {
  const s = requireRole(req, "employer");
  if (s instanceof NextResponse) return s;
  const roles = getOpportunities().filter((o) => o.organisation === s.organisation);
  const result = await Promise.all(roles.map(async (r) => ({ opportunityId: r.id, applicants: await listApplicants(r.id) })));
  return NextResponse.json({ organisation: s.organisation, roles: result }, { headers: { "cache-control": "no-store" } });
}
