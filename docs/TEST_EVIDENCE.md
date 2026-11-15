# Test evidence

Run date: 2026-11-16. Commands: `npm test` (unit, `npx vitest run --reporter=verbose`), `npx playwright test --list`
(end-to-end inventory), `npm run report` (ranking).

**Result: 121/121 unit tests passed (16 files). The end-to-end suite has 25 tests in 5 files, run on
desktop and mobile: 50 runs. All 50 passed against the production site on 2026-11-16. A separate live
check on production passed 7/7 (section 5).**

## 1. The three required cases (sample profile from the brief)

| Case | Opportunity | Score | Band | Why |
|---|---|---|---|---|
| Strong match | Programme Assistant – International NGO (Toronto) | 100 | Strong | All 4 required skills; 2 years within the 1–2 year range; Business Administration degree in a relevant field; Canada is preferred; English met; matches "programme support". Flag: work authorisation needs verification (unknown, not assumed). |
| Partial match | Junior Data Analyst (Amsterdam) | 57 | Partial | Skills 12/30 (has Excel and Reporting; missing SQL, Python, Data visualisation); Netherlands not preferred (0/15); interests 0/10; experience, education and language met. |
| Critical requirement gap | German-speaking Client Associate (Frankfurt) | 35 (raw 65) | Critical gap | Requires professional German; the profile lists none. Critical flag raised, score capped at 35. Also flagged: work authorisation needs verification. |
| Critical requirement gap (2nd) | Business Analyst Intern (Berlin) | 35 | Critical gap | Open only to enrolled students; the profile states not enrolled. Local work eligibility required and unknown, so it is flagged for verification. |

Unit tests: `strong match: Programme Assistant NGO`, `partial match: Junior Data Analyst`,
`critical gap: German-speaking Client Associate`, `critical gap: Business Analyst Intern`
(`src/lib/matching/engine.test.ts`).

## 2. Full ranking for the sample profile (`npm run report`)

| Rank | Opportunity | Score | Band | Flags |
|---|---|---|---|---|
| 1 | programme-assistant-ngo | 100 | Strong | verify |
| 2 | operations-coordinator-singapore | 88 | Strong | verify |
| 3 | project-coordinator-toronto | 88 | Strong | verify, verify |
| 4 | research-assistant-remote | 79 | Strong | — |
| 5 | operations-specialist-munich | 72 | Partial | verify, verify |
| 6 | marketing-coordinator-vancouver | 68 | Partial | verify |
| 7 | junior-data-analyst-amsterdam | 57 | Partial | verify |
| 8 | programme-officer-berlin | 53 | Partial | verify, verify |
| 9 | business-analyst-intern-berlin | 35 | Critical gap | critical, verify |
| 10 | german-client-associate-frankfurt | 35 | Critical gap | critical, verify |
| 11 | sales-executive-dubai | 35 | Critical gap | critical, verify |
| 12 | software-engineer-london | 19 | Weak | verify |

The remote research role has no `verify` flag because it does not require local work authorisation.
The three roles with two `verify` flags also need qualification recognition
(`recognitionMayBeRequired`). That flag never changes the score.

## 3. Unit tests (Vitest) — 121 passed

| Area | Tests |
|---|---|
| Data (8) | at least 10 valid opportunities; unique ids; at least two hard constraints; lookup by id and unknown id; sample profile passes schema; every role has salary, visa support and relocation fields; every role country has a guide with official https sources; unknown country falls back to a generic guide |
| Criteria (9) | skill normalisation and synonyms; experience in range / overqualified / slightly short / far short / unknown; education relevant / unrelated / level not met; location preferred / remote / other; language met / below level; whole-word matching ("IT" does not match "monitoring"; one-letter interests or fields match nothing; multi-word interests still match) |
| Engine (13) | the four required cases above; unknown work authorisation never treated as satisfied ("yes" removes the flag, "no" makes it critical); no flag for roles without the requirement; empty profile fields give finite scores and "missing" flags; unknown enrolment flagged; synonyms; weights sum to 100; points sum to score; deterministic ranking; NGO role ranks first |
| Engine, research-led outputs (5) | sample ranking unchanged (all 12 scores pinned); eligibility reported separately from fit (verify / clear / blocked); matched and missing required skills; recognition flag never changes the score; next steps point at the profile field to update, at most 4 |
| AI summary (9) | template mentions band and top gap; template mentions verification; no key → template; client error → template; non-JSON → template; too short or invented numbers → template; timeout → template; valid output → AI, and no free-text profile data in the prompt; output that drops the verification caveat → template |
| OpenRouter client (6) | no key → mock mode; correct URL, bearer key, model and JSON schema sent; `OPENROUTER_MODEL` override; HTTP error → template; non-JSON content → template; valid response → AI summary |
| Summary API (4) | server recomputes the match from the profile; client-supplied results ignored (no free text reaches the prompt); malformed JSON 400 and unknown opportunity 404; rate limit returns 429 after repeated requests from one client |
| Resume fields (11) | `sanitizeResumeFields`: keeps valid values and trims, dedupes and caps lists; unusable values become "not provided"; years capped at 50 and long text at the profile limits; non-object input gives empty fields. `mergeResume`: fills an empty profile and counts filled fields; never touches countries or work authorisation and keeps existing list items; updates a language level for the same language. `yearsFromRoles`: sums dated roles, "present" = today, internships count half; overlapping roles not double counted; null when no usable dates, future or reversed ranges ignored; used by `sanitizeResumeFields` when roles are present |
| Resume extract (4) | `isPdf` checks the `%PDF-` magic bytes, not the file name; the PDF is sent as a base64 file part to the low-cost model with a strict JSON schema; `OPENROUTER_RESUME_MODEL` override; HTTP errors and non-JSON content throw |
| Resume API (5) | 503 when resume reading is not configured; missing file, non-PDF and oversized file rejected; stores the PDF and returns the cleaned fields; still returns the fields when storage fails; 502 with a plain message when the model fails |
| Server auth (9) | password hashing: right password verified, wrong one rejected; a new salt each time. Session token: round-trips; tampered, foreign or expired token rejected; read from the request cookie header; cookie is HttpOnly and SameSite=Lax. Server accounts: create, refuse a duplicate email, sign in; employers must pick a listed organisation; demo accounts created once and reused |
| Auth, applications and employer routes (8) | sign-up sets an HttpOnly session cookie and `/me` reads it; duplicate email, wrong password and made-up organisation rejected; demo sign-in works for both roles and nothing else; only a signed-in candidate with a complete profile can apply; a resume the candidate did not upload cannot be attached; the application is recorded and listed for the candidate; applicants with match results are listed for the employer's own organisation only; only the owning organisation can download the resume |
| Rate limit (3) | 20 requests per minute per key, then blocked until the window resets; separate buckets per route key; `RATE_LIMIT_PER_MIN` override |
| Storage (15) | profile round-trip; empty storage; corrupt JSON ignored; schema-invalid profile ignored; shortlist toggle; clear all data; v1 shortlist migrates into the tracker at "Saved"; stage and note updates; updates for untracked ids ignored; removing an item drops its stage; corrupt tracker data dropped; one bad tracker item keeps the rest; unreadable tracker backed up before any write; duplicates removed; legacy key kept until the tracker write succeeds |
| Profile strength (3) | empty profile 0% with 8 missing sections; sample profile 88% (only work authorisation missing); 100% only when work authorisation is answered yes or no for every preferred country |
| Match filters (5) | default keeps rank order; band, country and visa-support filters combine; eligibility filter; empty result; eligibility-first sort |
| Candidate ranking (4) | 8 fictional candidates with valid profiles and unique ids; ranked by fit, deterministic; right-to-work-first sort; the pool mixes strong and weaker matches |

## 4. End-to-end tests (Playwright) — 25 tests × 2 projects = 50 runs

Each test runs on Desktop Chrome and on a Pixel 7 viewport. Locally the server runs in mock mode with
the in-memory store (`PATHWAY_STORE=memory RATE_LIMIT_PER_MIN=1000`). The resume tests mock
`/api/resume` in the browser, so they make no AI calls.

**`journey.spec.ts` (9)**

1. **Profile to shortlist:** load the sample profile → save → 12 ranked cards, Programme Assistant first
   with "Strong match", the "Eligibility to verify" badge and the verification notice → German Client Associate shows "Critical gap" and the
   German requirement → detail page shows the 6-row breakdown and summary → shortlist → persists after
   reload → remove → empty state.
2. **Filter by band:** "Critical gap" filter shows 3 cards.
3. **Validation:** submitting an empty form shows "Please correct 5 fields" with field messages and does not navigate.
4. **No profile:** /matches prompts the user to create a profile.
5. **Unknown opportunity:** /opportunities/does-not-exist returns 404 with a not-found page.
6. **API validation:** POST /api/summary with an invalid body returns 400.
7. **Landing:** the heading reads "Hire from abroad"; the sample button saves the sample candidate and opens 12 ranked matches.
8. **Filters, steps to verify and tracking:** Germany filter shows 4 roles; adding "confirmed right to work" shows the empty state; "Reset filters" restores 12. The detail page shows "Steps to verify before applying in Canada" with a canada.ca link and "Improve your match". Shortlisting, then setting the stage to "Applied", persists after reload.
9. **How matching works:** the page lists the six weights.

**`accounts.spec.ts` (4)**

10. **Employer sign-up:** "I'm hiring" → create an employer account for Harbourline Logistics → 8 talent-pool candidates ranked; for Operations Coordinator, Amira Haddad is first with "Strong match" → sign out.
11. **Sign-in:** a wrong password shows "Email or password is incorrect."; "Sign in as candidate" opens 12 matches and shows "Your profile".
12. **One-click hirer:** "Sign in as hirer" opens the Candidates page with ranked candidates.
13. **Employer page as guest:** asks the visitor to sign in.

**`site.spec.ts` (5)**

14. **404 page:** an unknown route returns 404 with a branded page and a link back home.
15. **Footer:** links to the privacy and terms page.
16. **Share image and icon:** the Open Graph image is served as PNG, and the icon returns 200.
17. **Landing visuals:** the score-weights diagram, the right-to-work figure and a city photo are visible.
18. **Country cards:** the Germany card opens "Roles in Germany" with 4 roles; "Show all countries" restores 12.

**`resume.spec.ts` (4)**

19. **Profile upload:** uploading the sample resume shows "Filled 8 fields from sample-resume.pdf" and fills education, years (7.9) and skills for review.
20. **Failed read:** a 502 from the API shows a plain message and leaves the form empty.
21. **Non-PDF:** a `.docx` file is refused in the browser, and the API is never called.
22. **Sign-up with resume:** a candidate adds a resume on sign-up and lands on a pre-filled profile.

**`applications.spec.ts` (3)**

23. **Apply and review:** a new candidate loads the sample profile and applies to Operations Coordinator → "Applied on …" shows and the shortlist tracks it → sign out → the demo hirer (Harbourline Logistics) sees the applicant with email, a match band, and "Right to work in Singapore" in the profile details.
24. **Guest:** the role page asks guests to sign in before applying.
25. **Other organisation:** an employer of Open Policy Lab sees none of these applicants.

## 5. Live checks on production (2026-11-16)

Site: https://career-mobility-platform.vercel.app, with the OpenRouter key, Blob store and session
secret set.

- **Full end-to-end suite:** `BASE_URL=https://career-mobility-platform.vercel.app npm run test:e2e` passed 50/50.
- **Scripted live flow, 7/7 passed:**
  1. Candidate signs up.
  2. Resume is read by the live model and stored.
  3. Candidate applies with the resume attached.
  4. The hirer sees the applicant with score 78, Strong.
  5. The hirer downloads the resume PDF.
  6. A candidate account is blocked from the employer download (403).
  7. An anonymous request is blocked (401).
- **AI summary:** the live AI summary was checked on the deployed site. The AI path is no longer
  tested with mocks only.

## 6. Manual checks

- Visual review of every page (home, profile, matches, two detail pages, all roles, shortlist, how matching works, not found, sign in, sign up, employer) at 360, 390, 768 and 1280 px (`node scripts/screenshots.mjs <dir>`). The script also checks that no page is wider than the viewport: no horizontal overflow at any width.
- Keyboard: visible focus ring on every control; error summary receives focus on failed submit.
