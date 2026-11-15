import { signedOut } from "../../../../lib/server/http";

export async function POST() {
  return signedOut();
}
