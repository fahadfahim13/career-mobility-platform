# Career Mobility MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a runnable, deployed prototype: profile → rule-based ranked matches with explanations → detail view → shortlist, plus README, technical note, test evidence and AI disclosure.

**Architecture:** Next.js App Router app. A pure TypeScript matching engine (`src/lib/matching/`) is the core and is unit-tested in isolation. Opportunity data is a JSON file validated by zod; profile and shortlist live in localStorage behind one hook. One server route adds an optional Claude-written summary with a deterministic template fallback.

**Tech Stack:** Next.js 15, TypeScript strict, Tailwind CSS, zod, Vitest, Playwright, `@anthropic-ai/sdk`, Vercel.

**Spec:** `docs/superpowers/specs/2026-11-15-career-mobility-design.md` (and the source PDF it cites).

## Global Constraints
- Project root: `F:/FFTech/assessments/career-mobility` (new git repo, branch `main`, local only until Fahim gives a remote).
- Fictional data only. No real names, emails or personal data anywhere.
- Never present work authorisation as a legal determination. Copy for unknown status, verbatim: "Work authorisation not confirmed — needs verification".
- Weights: skills 30, experience 20, education 15, location 15, language 10, interests 10. Critical cap 35. Bands ≥75 Strong, 50–74 Partial, <50 Weak.
- App must run with no env vars (`ANTHROPIC_API_KEY` optional). AI never changes score, band or flags.
- Model id `claude-haiku-5-5`; load the `claude-api` skill before writing Task 5.
- Imports at top of file; no inline imports.

## Review Focus
1. Profile with empty skills / no languages / no preferred countries → engine returns results with "missing info" notes, no crash, no NaN. (Task 2 test `handles empty profile fields`.)
2. Skill casing and synonyms ("excel" vs "Microsoft Excel", "project coordination" vs "coordination") → counted as matched. (Task 2 test `normalizes skills and synonyms`.)
3. Corrupt or old localStorage JSON → app falls back to empty state, not a white screen. (Task 3 test `ignores corrupt storage`.)
4. Unknown opportunity id at `/opportunities/[id]` → Next.js not-found page. (Task 4 e2e step.)
5. AI returns non-JSON, slow response, or no key → template summary, `source: "template"`. (Task 5 tests.)

---

### Task 1: Scaffold, domain types, sample data

**Files:**
- Create: Next app via `npx create-next-app@15 . --ts --tailwind --app --src-dir --eslint --use-npm --no-import-alias`, then `src/lib/types.ts`, `src/lib/schemas.ts`, `src/data/opportunities.json`, `src/data/sampleProfile.ts`, `src/lib/data.ts`, `vitest.config.ts`
- Test: `src/lib/data.test.ts`

**Interfaces:**
- Produces (`src/lib/types.ts`, inferred from zod in `schemas.ts`):
  - `EducationLevel = "none"|"secondary"|"diploma"|"bachelor"|"master"|"phd"`
  - `LanguageLevel = "basic"|"conversational"|"professional"|"native"`
  - `WorkAuth = "yes"|"no"|"unknown"`
  - `Profile { educationLevel: EducationLevel|null; educationField: string; yearsExperience: number|null; experienceSummary: string; skills: string[]; languages: {name:string; level:LanguageLevel}[]; preferredCountries: string[]; interests: string[]; enrolledStudent: boolean|null; workAuthorisation: Record<string, WorkAuth> }`
  - `Opportunity { id: string; title: string; organisation: string; country: string; city: string; remote: boolean; type: "job"|"internship"; category: string; tags: string[]; description: string; requiredSkills: string[]; niceToHaveSkills: string[]; minYears: number; maxYears: number|null; education: {minLevel: EducationLevel; relevantFields: string[]}|null; languages: {name:string; level:LanguageLevel}[]; enrolledStudentRequired: boolean; localWorkAuthRequired: boolean }`
  - `profileSchema`, `opportunitySchema` (zod)
  - `getOpportunities(): Opportunity[]` and `getOpportunity(id: string): Opportunity | undefined` in `src/lib/data.ts` (parses JSON with zod at module load, throws on invalid data)
  - `sampleProfile: Profile` — the brief's candidate: bachelor / Business Administration, 2 yrs, skills Excel, research, stakeholder communication, reporting, project coordination; Bengali native, English professional; Germany, Canada, Singapore; interests programme support, business operations, project coordination; `enrolledStudent: false`; `workAuthorisation: {}` (all unknown).

- [ ] **Step 1:** Scaffold app, add deps `zod`, dev deps `vitest @vitest/coverage-v8 @playwright/test`; scripts `test`, `test:e2e`, `typecheck`. `git init`, commit scaffold.
- [ ] **Step 2: Write failing test `src/lib/data.test.ts`**
  - `it("loads at least 10 valid opportunities")` → `getOpportunities().length >= 10`.
  - `it("has unique ids")`.
  - `it("includes at least two hard constraints")` → count of opportunities with a non-English required language or `enrolledStudentRequired` or `localWorkAuthRequired` is `>= 2`.
  - `it("sample profile passes schema")` → `profileSchema.parse(sampleProfile)` does not throw.
- [ ] **Step 3:** Run `npx vitest run src/lib/data.test.ts` → FAIL (modules missing).
- [ ] **Step 4:** Write types, schemas, `data.ts`, and 12 opportunities: the 6 listed in the spec's "Sample data" section plus 6 more varied roles (Toronto project coordinator, Berlin NGO programme officer, Dubai sales executive requiring Arabic, remote research assistant, Munich operations specialist with local-work-auth required, Vancouver marketing coordinator). Fictional organisations only.
- [ ] **Step 5:** Run tests → PASS. Commit `feat: domain types, schemas and sample opportunities`.

### Task 2: Matching engine

**Files:**
- Create: `src/lib/matching/normalize.ts`, `src/lib/matching/criteria.ts`, `src/lib/matching/engine.ts`, `src/lib/matching/explain.ts`
- Test: `src/lib/matching/engine.test.ts`, `src/lib/matching/criteria.test.ts`

**Interfaces:**
- Consumes: Task 1 types, `getOpportunities`, `sampleProfile`.
- Produces:
  - `CriterionKey = "skills"|"experience"|"education"|"location"|"language"|"interests"`
  - `CriterionResult { key: CriterionKey; weight: number; score: number|null; points: number; status: "met"|"partial"|"unmet"|"unknown"; detail: string }`
  - `Flag { kind: "critical"|"verify"|"missing"; message: string }`
  - `MatchResult { opportunityId: string; score: number /*0..100 int*/; band: "Strong"|"Partial"|"Weak"|"Critical gap"; criteria: CriterionResult[]; strengths: string[]; gaps: string[]; flags: Flag[] }`
  - `matchOne(profile: Profile, opp: Opportunity): MatchResult`
  - `rankOpportunities(profile: Profile, opps: Opportunity[]): MatchResult[]`
  - `WEIGHTS: Record<CriterionKey, number>` exported from `criteria.ts`
  - `normalizeSkill(s: string): string` (lowercase, trim, strip "microsoft ", synonym map in `normalize.ts`)

- [ ] **Step 1: Write failing tests** (sample profile vs sample data):
  - `strong match: Programme Assistant NGO` → band `"Strong"`, `score >= 75`, `gaps` has no critical entry.
  - `partial match: Junior Data Analyst` → band `"Partial"` or `"Weak"`, `gaps` mention `"SQL"`.
  - `critical gap: German-speaking Client Associate` → band `"Critical gap"`, `score <= 35`, a `critical` flag containing `"German"`.
  - `critical gap: Business Analyst Intern` → `critical` flag mentions enrolled student; a `verify` flag equals the Global Constraints copy.
  - `unknown work auth is never treated as satisfied` → every opp with `localWorkAuthRequired` has a `verify` flag for sample profile; setting `workAuthorisation[country]="yes"` removes it; `"no"` turns it `critical`.
  - `handles empty profile fields` → profile with `skills: []`, `languages: []`, `preferredCountries: []`, `educationLevel: null`, `yearsExperience: null` → every result has finite score, `missing` flags present.
  - `normalizes skills and synonyms` → `"microsoft excel"` matches `"Excel"`; `"coordination"` matches `"project coordination"`.
  - `criteria points sum to score` (non-critical result) and `weights sum to 100`.
  - `ranking is deterministic` → sorted by score desc then id; two calls deep-equal.
- [ ] **Step 2:** Run `npx vitest run src/lib/matching` → FAIL.
- [ ] **Step 3:** Implement per the spec's "Matching model" rules. `explain.ts` builds `strengths` (met criteria details) and `gaps` (unmet/partial details, critical messages first). Points = `round(weight * (score ?? 0.5))`; score = sum of points, then `min(score, 35)` if any critical flag.
- [ ] **Step 4:** Run tests → PASS. If a sample-data expectation fails, fix the data or rule, not the test thresholds, and note why in the commit body.
- [ ] **Step 5:** Commit `feat: transparent rule-based matching engine`.

### Task 3: Profile form + local storage

**Files:**
- Create: `src/lib/storage.ts`, `src/hooks/useLocalState.ts`, `src/app/profile/page.tsx`, `src/components/ProfileForm.tsx`, `src/components/TagInput.tsx`
- Test: `src/lib/storage.test.ts`

**Interfaces:**
- Produces:
  - `loadProfile(): Profile | null`, `saveProfile(p: Profile): void`, `loadShortlist(): string[]`, `toggleShortlist(id: string): string[]`, `clearAll(): void` — keys `cm.profile.v1`, `cm.shortlist.v1`; every load validates with zod and returns the empty value on parse error.
  - `useProfile(): [Profile|null, (p: Profile) => void]`, `useShortlist(): { ids: string[]; toggle(id: string): void; has(id: string): boolean }` (hydration-safe: read storage in `useEffect`).

- [ ] **Step 1: Write failing tests** (vitest `environment: "jsdom"` for this file): `round-trips profile`, `ignores corrupt storage` (set `cm.profile.v1` = `"{bad"` → `loadProfile()` is `null`), `toggleShortlist adds then removes`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement storage + hooks.
- [ ] **Step 4:** Build `ProfileForm`: client validation via `profileSchema.safeParse` with inline per-field errors (years 0–50, at least 1 skill, at least 1 language, at least 1 preferred country); "Load sample profile" button; "Clear my data" button; on save → `router.push("/matches")`. Work authorisation: one select per preferred country (yes/no/unknown, default unknown) with helper text "We do not determine visa status."
- [ ] **Step 5:** Run tests → PASS; `npm run typecheck` clean. Commit `feat: profile form with validated local storage`.

### Task 4: Matches, detail, shortlist UI

**Files:**
- Create: `src/app/page.tsx` (landing: what it does + CTA), `src/app/matches/page.tsx`, `src/app/opportunities/page.tsx`, `src/app/opportunities/[id]/page.tsx`, `src/app/opportunities/[id]/not-found.tsx`, `src/app/shortlist/page.tsx`, `src/components/MatchCard.tsx`, `src/components/ScoreBreakdown.tsx`, `src/components/FlagList.tsx`, `src/components/ShortlistButton.tsx`, `src/components/Nav.tsx`

**Interfaces:**
- Consumes: `rankOpportunities`, `matchOne`, `getOpportunity`, `useProfile`, `useShortlist`. Matching runs client-side (profile is in localStorage).

- [ ] **Step 1:** `/matches`: no profile → prompt linking `/profile`. Else list `MatchCard`s (title, org, city/country, type, score + band badge, top 3 strengths, top 3 gaps, flags, shortlist button, "View details"). Band filter chips (All / Strong / Partial / Weak / Critical gap).
- [ ] **Step 2:** Detail page: header, description, requirements block (skills, experience range, education, languages, eligibility), `ScoreBreakdown` table (criterion, weight, points, status, detail), `FlagList` (critical red, verify amber, missing grey), shortlist button, summary panel (Task 5 hooks in; until then render template). Unknown id → `notFound()`.
- [ ] **Step 3:** `/shortlist` lists saved items with current score and remove; empty state. `/opportunities` lists all roles unranked.
- [ ] **Step 4:** Manual check: `npm run dev`, load sample profile, confirm order and the three expected bands in the browser; `npm run typecheck && npm run lint` clean.
- [ ] **Step 5:** Commit `feat: ranked matches, detail view and shortlist`.

### Task 5: Optional AI summary with fallback

**Files:**
- Create: `src/lib/summary/template.ts`, `src/lib/summary/ai.ts`, `src/app/api/summary/route.ts`, `src/components/SummaryPanel.tsx`, `.env.example`
- Test: `src/lib/summary/summary.test.ts`

**Interfaces:**
- Produces:
  - `templateSummary(opp: Opportunity, r: MatchResult): string`
  - `aiSummary(opp: Opportunity, r: MatchResult, deps?: { client?: AnthropicLike; timeoutMs?: number }): Promise<{ text: string; source: "ai"|"template" }>` — returns template on missing key, timeout (default 6000 ms), API error, or output failing zod `{ summary: string(20..600) }`.
  - `POST /api/summary` body `{ opportunityId: string; result: MatchResult }` validated by zod (400 on invalid, 404 unknown id) → `{ text, source }`. Prompt sends only opportunity fields + `MatchResult` (no free-text profile fields); system prompt forbids new facts, scores or legal/visa conclusions.

- [ ] **Step 1: Failing tests:** `template mentions band and top gap`; `no key → source template`; `client throws → template`; `client returns non-JSON → template`; `slow client beyond timeout → template`; `valid JSON → source ai`.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement (load `claude-api` skill first). **Step 4:** PASS.
- [ ] **Step 5:** `SummaryPanel` fetches on detail page, shows text + small label "AI-written from the score breakdown" or "Generated from rules". Commit `feat: optional AI summary with deterministic fallback`.

### Task 6: E2E test, docs, evidence

**Files:**
- Create: `e2e/journey.spec.ts`, `playwright.config.ts`, `README.md`, `docs/TECHNICAL_NOTE.md`, `docs/TEST_EVIDENCE.md`

- [ ] **Step 1: E2E test** `profile to shortlist journey`: go `/profile` → "Load sample profile" → save → `/matches` first card is "Programme Assistant" with "Strong"; German Client Associate card shows "Critical gap"; open detail → breakdown table has 6 rows; click shortlist → `/shortlist` shows it; reload keeps it. Second test: `/opportunities/does-not-exist` shows not-found. Third: submit empty form → inline errors visible.
- [ ] **Step 2:** `npm run test && npm run test:e2e` → all PASS; save output to `docs/TEST_EVIDENCE.md` with a table of the three required cases (strong / partial / critical gap) and their actual scores.
- [ ] **Step 3:** `README.md`: what it is, live link placeholder, setup (`npm i`, `npm run dev`), env (`ANTHROPIC_API_KEY` optional, mock = unset), scripts, project structure, **AI/tool disclosure** (Claude Code used for scaffolding/implementation assistance under Fahim's direction; Claude Haiku at runtime for optional summaries; libraries listed), limitations.
- [ ] **Step 4:** `docs/TECHNICAL_NOTE.md` (≤2 pages): architecture, data model, matching method + weights table, AI design (what is sent, unreliable output, outage), validation/errors, security & privacy for real deployment (auth, encryption at rest, data minimisation, consent, retention/delete, GDPR given EU roles, no PII to LLM), trade-offs, known limitations, next steps.
- [ ] **Step 5:** Commit `docs: README, technical note, test evidence`.

### Task 7: Deploy (gated on Fahim)

- [ ] **Step 1:** Ask Fahim: GitHub repo (public/private + account) and Vercel account to use; whether to set `ANTHROPIC_API_KEY` on Vercel.
- [ ] **Step 2:** Push, deploy, open live URL, run the e2e journey against it (`BASE_URL=<url> npm run test:e2e`), put URL in README, commit.
- [ ] **Step 3:** Hand Fahim: live URL, repo URL, a 2–3 min demo script for his screen recording (needs from user: the recording itself), and the submission email draft with subject `Technical Assessment – Full-Stack Developer – <full name>`.
