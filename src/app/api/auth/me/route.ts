import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/server/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({ account: readSession(req) }, { headers: { "cache-control": "no-store" } });
}
