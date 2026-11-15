import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_RESUME_MODEL, extractResume, isPdf } from "./extract";

const PDF = new TextEncoder().encode("%PDF-1.7\n fake body");

function okResponse(content: unknown) {
  return new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(content) } }] }), { status: 200 });
}

describe("isPdf", () => {
  it("checks the %PDF- magic bytes, not the file name", () => {
    expect(isPdf(PDF)).toBe(true);
    expect(isPdf(new TextEncoder().encode("PK\u0003\u0004 docx"))).toBe(false);
    expect(isPdf(new Uint8Array())).toBe(false);
  });
});

describe("extractResume", () => {
  afterEach(() => {
    delete process.env.OPENROUTER_RESUME_MODEL;
  });

  it("sends the PDF as a base64 file part to the low-cost model with a strict JSON schema", async () => {
    const fetchFn = vi.fn(async () => okResponse({ educationLevel: "bachelor", skills: ["Excel"], languages: [] }));
    const fields = await extractResume(PDF, { apiKey: "test-key", fetchFn });

    expect(fields.educationLevel).toBe("bachelor");
    expect(fields.skills).toEqual(["Excel"]);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://openrouter.ai/api/v1/chat/completions");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer test-key");
    const body = JSON.parse(init.body as string);
    expect(body.model).toBe(DEFAULT_RESUME_MODEL);
    expect(body.response_format.type).toBe("json_schema");
    const filePart = body.messages[1].content.find((c: { type: string }) => c.type === "file");
    expect(filePart.file.file_data).toMatch(/^data:application\/pdf;base64,JVBERi0/);
    // Work authorisation is never asked of the model.
    expect(JSON.stringify(body.response_format)).not.toMatch(/authori[sz]ation/i);
  });

  it("uses OPENROUTER_RESUME_MODEL when set", async () => {
    process.env.OPENROUTER_RESUME_MODEL = "some/other-model";
    const fetchFn = vi.fn(async () => okResponse({}));
    await extractResume(PDF, { apiKey: "k", fetchFn });
    const [, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(JSON.parse(init.body as string).model).toBe("some/other-model");
  });

  it("throws on HTTP errors and non-JSON content", async () => {
    await expect(extractResume(PDF, { apiKey: "k", fetchFn: async () => new Response("no", { status: 500 }) })).rejects.toThrow(/500/);
    const bad = async () => new Response(JSON.stringify({ choices: [{ message: { content: "not json" } }] }), { status: 200 });
    await expect(extractResume(PDF, { apiKey: "k", fetchFn: bad })).rejects.toThrow();
  });
});
