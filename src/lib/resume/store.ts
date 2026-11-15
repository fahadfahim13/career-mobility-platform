import { put } from "@vercel/blob";

/**
 * Saves the uploaded resume to the private Vercel Blob store under a random name. The file is never
 * public: reading it back needs the store token. Returns false when no store is configured
 * (local development), so the upload still fills the form.
 */
export async function storeResume(pdf: Uint8Array): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  const date = new Date().toISOString().slice(0, 10);
  await put(`resumes/${date}/${crypto.randomUUID()}.pdf`, Buffer.from(pdf), {
    access: "private",
    contentType: "application/pdf",
    addRandomSuffix: false,
  });
  return true;
}
