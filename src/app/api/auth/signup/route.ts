import { createAccount } from "../../../../lib/server/accounts";
import { fail, limited, readJson, withSession } from "../../../../lib/server/http";

export async function POST(req: Request) {
  const blocked = limited(req);
  if (blocked) return blocked;
  const body = (await readJson(req)) as Parameters<typeof createAccount>[0] | undefined;
  if (!body || typeof body !== "object") return fail(400, "invalid");
  const r = await createAccount(body);
  if (!r.ok) return fail(r.error === "email-taken" ? 409 : 400, r.error);
  return withSession(r.session, 201);
}
