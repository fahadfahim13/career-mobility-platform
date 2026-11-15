import { NextResponse } from "next/server";
import { z } from "zod";
import { getOpportunity } from "../../../lib/data";
import { profileFormSchema } from "../../../lib/schemas";
import { listMine, resumeKeyAllowed, submitApplication } from "../../../lib/server/applications";
import { fail, limited, readJson, requireRole } from "../../../lib/server/http";
import { getStore } from "../../../lib/server/store";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  opportunityId: z.string().max(100),
  profile: profileFormSchema,
  resume: z.object({ id: z.string().max(200), name: z.string().trim().min(1).max(120) }).nullable().optional(),
});

/** Candidate applies to a role with their current profile and, if uploaded, their resume. */
export async function POST(req: Request) {
  const blocked = limited(req, "apply");
  if (blocked) return blocked;
  const s = requireRole(req, "seeker");
  if (s instanceof NextResponse) return s;

  const parsed = bodySchema.safeParse(await readJson(req));
  if (!parsed.success) return fail(400, "Complete your profile before you apply.");
  const { opportunityId, profile, resume } = parsed.data;
  if (!getOpportunity(opportunityId)) return fail(404, "Role not found.");

  let attached: { key: string; name: string } | null = null;
  if (resume) {
    // Only a resume this candidate uploaded can be attached, and it must exist.
    if (!resumeKeyAllowed(resume.id, s.id) || !(await getStore().listKeys(resume.id)).includes(resume.id)) {
      return fail(400, "That resume could not be found. Upload it again on your profile.");
    }
    attached = { key: resume.id, name: resume.name };
  }
  const app = await submitApplication(s, opportunityId, profile, attached);
  return NextResponse.json({ opportunityId, appliedAt: app.appliedAt, resumeAttached: !!attached }, { status: 201 });
}

/** The signed-in candidate's applications. */
export async function GET(req: Request) {
  const s = requireRole(req, "seeker");
  if (s instanceof NextResponse) return s;
  return NextResponse.json({ applications: await listMine(s.id) }, { headers: { "cache-control": "no-store" } });
}
