import { beforeEach, describe, expect, it } from "vitest";
import { sampleProfile } from "../../data/sampleProfile";
import { resetRateLimit } from "../../lib/rateLimit";
import { SESSION_COOKIE, signSession, type Session } from "../../lib/server/session";
import { memoryStore, setStore, type Store } from "../../lib/server/store";
import { POST as apply, GET as mine } from "./applications/route";
import { POST as signup } from "./auth/signup/route";
import { POST as signin } from "./auth/signin/route";
import { POST as demo } from "./auth/demo/route";
import { GET as me } from "./auth/me/route";
import { GET as applicants } from "./employer/applicants/route";
import { GET as resume } from "./employer/resume/route";

const ROLE = "operations-coordinator-singapore"; // Harbourline Logistics
const OTHER_ROLE = "research-assistant-remote"; // Open Policy Lab
const RESUME_KEY = "resumes/cand-1/0f8fad5b-d9cb-469f-a165-70867728950e.pdf";

const seeker: Session = { id: "cand-1", name: "Priya Raman", email: "priya@example.com", role: "seeker", organisation: null };
const hirer: Session = { id: "emp-1", name: "Lena", email: "lena@harbourline.example", role: "employer", organisation: "Harbourline Logistics" };
const otherHirer: Session = { ...hirer, id: "emp-2", organisation: "Open Policy Lab" };

function req(url: string, s?: Session, body?: unknown) {
  const headers: Record<string, string> = { "x-forwarded-for": "192.0.2.1", "content-type": "application/json" };
  if (s) headers.cookie = `${SESSION_COOKIE}=${signSession(s)}`;
  return new Request(`http://localhost${url}`, { method: body === undefined ? "GET" : "POST", headers, body: body === undefined ? undefined : JSON.stringify(body) });
}

let store: Store;
beforeEach(async () => {
  process.env.SESSION_SECRET = "route-test-secret-of-at-least-32-chars";
  store = memoryStore();
  setStore(store);
  resetRateLimit();
  await store.putBytes(RESUME_KEY, new TextEncoder().encode("%PDF-1.7 resume"), "application/pdf");
});

describe("auth routes", () => {
  it("sign-up sets an HttpOnly session cookie and /me reads it", async () => {
    const res = await signup(req("/api/auth/signup", undefined, { name: "Ana", email: "ana@example.com", password: "password-1", role: "seeker" }));
    expect(res.status).toBe(201);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(new RegExp(`^${SESSION_COOKIE}=`));
    expect(cookie).toMatch(/HttpOnly/i);
    const token = cookie.split(";")[0]!.split("=")[1]!;
    const meRes = await me(new Request("http://localhost/api/auth/me", { headers: { cookie: `${SESSION_COOKIE}=${token}` } }));
    expect((await meRes.json()).account.email).toBe("ana@example.com");
  });

  it("rejects a duplicate email, a wrong password and a made-up organisation", async () => {
    await signup(req("/api/auth/signup", undefined, { name: "Ana", email: "ana@example.com", password: "password-1", role: "seeker" }));
    expect((await signup(req("/api/auth/signup", undefined, { name: "Ana", email: "ana@example.com", password: "password-1", role: "seeker" }))).status).toBe(409);
    expect((await signin(req("/api/auth/signin", undefined, { email: "ana@example.com", password: "nope-nope" }))).status).toBe(401);
    expect((await signin(req("/api/auth/signin", undefined, { email: "ana@example.com", password: "password-1" }))).status).toBe(200);
    const fake = { name: "E", email: "e@example.com", password: "password-1", role: "employer", organisation: "Fake Corp" };
    expect((await signup(req("/api/auth/signup", undefined, fake))).status).toBe(400);
  });

  it("demo sign-in works for both roles and nothing else", async () => {
    expect((await demo(req("/api/auth/demo", undefined, { role: "employer" }))).status).toBe(200);
    expect((await demo(req("/api/auth/demo", undefined, { role: "admin" }))).status).toBe(400);
  });
});

describe("applications", () => {
  it("only a signed-in candidate with a complete profile can apply", async () => {
    expect((await apply(req("/api/applications", undefined, { opportunityId: ROLE, profile: sampleProfile }))).status).toBe(401);
    expect((await apply(req("/api/applications", hirer, { opportunityId: ROLE, profile: sampleProfile }))).status).toBe(403);
    expect((await apply(req("/api/applications", seeker, { opportunityId: ROLE, profile: { ...sampleProfile, skills: [] } }))).status).toBe(400);
    expect((await apply(req("/api/applications", seeker, { opportunityId: "nope", profile: sampleProfile }))).status).toBe(404);
  });

  it("refuses to attach a resume the candidate did not upload", async () => {
    const foreign = { id: "resumes/someone-else/0f8fad5b-d9cb-469f-a165-70867728950e.pdf", name: "x.pdf" };
    expect((await apply(req("/api/applications", seeker, { opportunityId: ROLE, profile: sampleProfile, resume: foreign }))).status).toBe(400);
    const missing = { id: "resumes/cand-1/00000000-0000-0000-0000-000000000000.pdf", name: "x.pdf" };
    expect((await apply(req("/api/applications", seeker, { opportunityId: ROLE, profile: sampleProfile, resume: missing }))).status).toBe(400);
  });

  it("records the application and lists it for the candidate", async () => {
    const res = await apply(req("/api/applications", seeker, { opportunityId: ROLE, profile: sampleProfile, resume: { id: RESUME_KEY, name: "Priya CV.pdf" } }));
    expect(res.status).toBe(201);
    expect((await res.json()).resumeAttached).toBe(true);
    const list = await (await mine(req("/api/applications", seeker))).json();
    expect(list.applications.map((a: { opportunityId: string }) => a.opportunityId)).toEqual([ROLE]);
  });
});

describe("employer access", () => {
  beforeEach(async () => {
    await apply(req("/api/applications", seeker, { opportunityId: ROLE, profile: sampleProfile, resume: { id: RESUME_KEY, name: "Priya CV.pdf" } }));
  });

  it("lists applicants with match results for the employer's own organisation only", async () => {
    expect((await applicants(req("/api/employer/applicants"))).status).toBe(401);
    expect((await applicants(req("/api/employer/applicants", seeker))).status).toBe(403);

    const own = await (await applicants(req("/api/employer/applicants", hirer))).json();
    expect(own.roles).toHaveLength(1);
    expect(own.roles[0].opportunityId).toBe(ROLE);
    const a = own.roles[0].applicants[0];
    expect(a.name).toBe("Priya Raman");
    expect(a.resumeName).toBe("Priya CV.pdf");
    expect(a.result.score).toBeGreaterThan(0);
    expect(JSON.stringify(own)).not.toContain(RESUME_KEY); // storage keys never leave the server

    const other = await (await applicants(req("/api/employer/applicants", otherHirer))).json();
    expect(other.roles[0].opportunityId).toBe(OTHER_ROLE);
    expect(other.roles[0].applicants).toEqual([]);
  });

  it("lets only the owning organisation download the resume", async () => {
    const url = `/api/employer/resume?opportunityId=${ROLE}&candidateId=cand-1`;
    expect((await resume(req(url))).status).toBe(401);
    expect((await resume(req(url, seeker))).status).toBe(403);
    expect((await resume(req(url, otherHirer))).status).toBe(403);
    expect((await resume(req(`/api/employer/resume?opportunityId=${ROLE}&candidateId=nobody`, hirer))).status).toBe(404);

    const ok = await resume(req(url, hirer));
    expect(ok.status).toBe(200);
    expect(ok.headers.get("content-type")).toBe("application/pdf");
    expect(ok.headers.get("content-disposition")).toBe('attachment; filename="Priya CV.pdf"');
    expect(new TextDecoder().decode(await ok.arrayBuffer())).toContain("%PDF");
  });
});
