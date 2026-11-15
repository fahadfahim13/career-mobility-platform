import { verifyCredentials } from "../../../../lib/server/accounts";
import { fail, limited, readJson, withSession } from "../../../../lib/server/http";

export async function POST(req: Request) {
  const blocked = limited(req);
  if (blocked) return blocked;
  const body = (await readJson(req)) as { email?: unknown; password?: unknown } | undefined;
  if (typeof body?.email !== "string" || typeof body.password !== "string" || body.password.length > 128) {
    return fail(400, "invalid-credentials");
  }
  const s = await verifyCredentials(body.email, body.password);
  return s ? withSession(s) : fail(401, "invalid-credentials");
}
