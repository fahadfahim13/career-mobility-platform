import { NextResponse } from "next/server";
import { getOpportunity } from "../../../../lib/data";
import { getApplication } from "../../../../lib/server/applications";
import { fail, requireRole } from "../../../../lib/server/http";
import { getStore } from "../../../../lib/server/store";

export const dynamic = "force-dynamic";

/** Streams an applicant's resume to an employer of the organisation that owns the role. */
export async function GET(req: Request) {
  const s = requireRole(req, "employer");
  if (s instanceof NextResponse) return s;
  const url = new URL(req.url);
  const opportunityId = url.searchParams.get("opportunityId") ?? "";
  const candidateId = url.searchParams.get("candidateId") ?? "";
  const opp = getOpportunity(opportunityId);
  if (!opp) return fail(404, "Role not found.");
  if (opp.organisation !== s.organisation) return fail(403, "This role belongs to another organisation.");

  const app = await getApplication(opportunityId, candidateId);
  if (!app?.resume) return fail(404, "No resume attached.");
  const bytes = await getStore().getBytes(app.resume.key);
  if (!bytes) return fail(404, "No resume attached.");

  const filename = app.resume.name.replace(/[^A-Za-z0-9._ -]/g, "_").replace(/\.pdf$/i, "") + ".pdf";
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
