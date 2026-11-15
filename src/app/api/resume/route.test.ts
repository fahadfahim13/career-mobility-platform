import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetRateLimit } from "../../../lib/rateLimit";

const extractMock = vi.fn();
const storeMock = vi.fn();
vi.mock("../../../lib/resume/extract", async (orig) => ({
  ...(await orig<typeof import("../../../lib/resume/extract")>()),
  extractResume: (...a: unknown[]) => extractMock(...a),
}));
vi.mock("../../../lib/resume/store", () => ({ storeResume: (...a: unknown[]) => storeMock(...a) }));

const { POST } = await import("./route");

const PDF_BYTES = new TextEncoder().encode("%PDF-1.7\n resume");

function post(file?: { bytes: Uint8Array<ArrayBuffer>; name: string; type: string }, ip = "198.51.100.9") {
  const fd = new FormData();
  if (file) fd.append("resume", new File([file.bytes], file.name, { type: file.type }));
  return POST(new Request("http://localhost/api/resume", { method: "POST", headers: { "x-forwarded-for": ip }, body: fd }));
}

describe("POST /api/resume", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
    resetRateLimit();
    extractMock.mockReset();
    storeMock.mockReset();
    storeMock.mockResolvedValue(true);
  });

  it("returns 503 when resume reading is not configured", async () => {
    delete process.env.OPENROUTER_API_KEY;
    const res = await post({ bytes: PDF_BYTES, name: "cv.pdf", type: "application/pdf" });
    expect(res.status).toBe(503);
  });

  it("rejects a missing file, a non-PDF and an oversized file", async () => {
    expect((await post()).status).toBe(400);
    const docx = new TextEncoder().encode("PK\u0003\u0004");
    expect((await post({ bytes: docx, name: "cv.pdf", type: "application/pdf" })).status).toBe(415);
    const big = new Uint8Array(4 * 1024 * 1024 + 1);
    big.set(PDF_BYTES);
    expect((await post({ bytes: big, name: "cv.pdf", type: "application/pdf" })).status).toBe(413);
    expect(extractMock).not.toHaveBeenCalled();
  });

  it("stores the PDF and returns the cleaned fields", async () => {
    extractMock.mockResolvedValue({ educationLevel: "master", skills: ["Excel"] });
    const res = await post({ bytes: PDF_BYTES, name: "cv.pdf", type: "application/pdf" });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ fields: { educationLevel: "master", skills: ["Excel"] }, stored: true });
    expect(storeMock).toHaveBeenCalledTimes(1);
  });

  it("still returns the fields when storage fails", async () => {
    extractMock.mockResolvedValue({ skills: [] });
    storeMock.mockRejectedValue(new Error("blob down"));
    const res = await post({ bytes: PDF_BYTES, name: "cv.pdf", type: "application/pdf" });
    expect(res.status).toBe(200);
    expect((await res.json()).stored).toBe(false);
  });

  it("returns 502 with a plain message when the model fails", async () => {
    extractMock.mockRejectedValue(new Error("OpenRouter returned HTTP 500"));
    const res = await post({ bytes: PDF_BYTES, name: "cv.pdf", type: "application/pdf" });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toMatch(/fill in the form/i);
  });
});
