import { ROLES, type Role } from "../../../../lib/accounts";
import { ensureDemoAccount } from "../../../../lib/server/accounts";
import { fail, limited, readJson, withSession } from "../../../../lib/server/http";

export async function POST(req: Request) {
  const blocked = limited(req);
  if (blocked) return blocked;
  const body = (await readJson(req)) as { role?: unknown } | undefined;
  if (!ROLES.includes(body?.role as Role)) return fail(400, "invalid");
  return withSession(await ensureDemoAccount(body!.role as Role));
}
