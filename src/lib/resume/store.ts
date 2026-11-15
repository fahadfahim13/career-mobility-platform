import { resumeKeyFor } from "../server/applications";
import { getStore } from "../server/store";

/**
 * Saves the uploaded resume privately under the uploader's account id ("anon" before sign-up) and
 * returns its key. The key is later attached to applications; only employers of the role's
 * organisation can download it.
 */
export async function storeResume(pdf: Uint8Array, owner: string): Promise<string> {
  const key = resumeKeyFor(owner);
  await getStore().putBytes(key, pdf, "application/pdf");
  return key;
}
