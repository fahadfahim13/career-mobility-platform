# Technical note — Pathway career matching MVP

The diagram version of this note is [TECHNICAL_DESIGN.pdf](TECHNICAL_DESIGN.pdf).

## 1. Architecture

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 | Server-rendered pages for opportunity data; client components for profile, matches, shortlist, apply and the employer view. |
| Matching | Pure TypeScript module (`src/lib/matching`) | No I/O, fully unit-tested. Runs in the browser for the candidate's own matches, and on the server for the AI summary and for ranking applicants. Both sides use the same code, so the candidate and the employer see the same score. |
| Backend | Next.js route handlers under `src/app/api` | `auth/{signup,signin,signout,me,demo}`, `resume` (upload and reading), `applications` (apply, list own), `employer/applicants`, `employer/resume` (download), `summary` (AI summary). Input is validated with zod. Errors return 400/401/403/404/409/413/415/429/502/503 as fits. |
| Accounts and sessions | `src/lib/server/{accounts,password,session}.ts` | Passwords hashed with scrypt and a random 16-byte salt. The session is an HMAC-SHA256 signed, HttpOnly, SameSite=Lax cookie named `pathway_session`, valid for 7 days. |
| Data storage | `src/lib/server/store.ts` | A private Vercel Blob store used as a small JSON and file key store for accounts, applications and resumes. An in-memory store is used when `PATHWAY_STORE=memory` or no `BLOB_READ_WRITE_TOKEN` is set (tests, local runs). Opportunities: a versioned JSON file validated by zod at load. Profile, shortlist tracker and the last resume reference stay in browser `localStorage` (`cm.profile.v1`, `cm.tracker.v1`, `cm.resume.v1`; the older `cm.shortlist.v1` is migrated on first read) until the candidate applies. |
| Rate limiting | `src/lib/rateLimit.ts` | In memory, per server instance. A separate bucket per route family (auth, apply, resume, summary) and per client IP. 20 requests per minute by default; `RATE_LIMIT_PER_MIN` overrides it. |
| External services | OpenRouter chat completions API; Vercel Blob | Match summary: default model `anthropic/claude-haiku-5.5` (`OPENROUTER_MODEL`). Resume reading: default model `google/gemini-2.5-flash-lite` (`OPENROUTER_RESUME_MODEL`). Mock mode when no key is set. |

## 2. Data model

- **Profile:** education level (enum) and field, years of experience, summary, skills, languages with
  level (`basic` / `conversational` / `professional` / `native`), preferred countries, career interests,
  enrolled-student status (`true` / `false` / `null`), and work authorisation per country
  (`yes` / `no` / `unknown`). `null` always means "not provided", never "satisfied".
- **Opportunity:** id, title, organisation, country, city, remote flag, type (job / internship), category,
  tags, required and desirable skills, experience range, minimum education level with relevant fields,
  required languages with level, and two hard-constraint flags: `enrolledStudentRequired` and
  `localWorkAuthRequired`. Role facts shown but never scored: fictional salary range, `visaSupport`
  (`offered` / `case-by-case` / `not-offered`) and relocation package. `recognitionMayBeRequired` adds a
  verify flag that never changes the score.
- **MatchResult:** score (0–100), band, six criterion results (weight, points, status, reasoning),
  strengths, gaps, flags (`critical`, `verify`, `missing`), a separate `eligibility` status
  (`clear` / `verify` / `blocked`, right to work only), `skillCoverage` (matched and missing required
  skills) and up to four `nextSteps`, each pointing at the profile field to update.
- **Account** (`accounts/by-email/<sha256 of the lower-case email>.json`): id, name, email, role
  (`seeker` / `employer`), organisation (employers only, one of the 12 organisations in the data),
  password hash (`scrypt$<salt>$<hash>`) and creation time. Demo accounts have no usable password.
- **Application** (`applications/<opportunityId>/<candidateId>.json`): candidate id, name and email, the
  role id, a copy of the profile at the time of applying, an optional resume reference
  (`{ key, name }`) and the time applied. One application per candidate per role; applying again
  replaces it. The match result is not stored. It is recomputed when the employer views applicants.
- **Resume** (`resumes/<owner>/<uuid>.pdf`): the uploaded PDF. The owner is the account id, or `anon`
  when uploaded before sign-up. The browser keeps only the key and file name (`cm.resume.v1`).
- **Country guides** (`src/data/countryGuides.ts`): steps to verify and official government links per
  country, with a generic fallback. Worded as questions to check, never as a statement of eligibility.

## 3. Matching method

A transparent weighted score. Each criterion returns a value from 0 to 1, or `null` if data is missing.

| Criterion | Weight | Rule |
|---|---|---|
| Skills | 30 | Share of required skills matched, after case folding and an explicit synonym list (e.g. "report writing" = "reporting"). |
| Experience | 20 | In range = 1; above range = 0.8 (possible overqualification); up to one year short = 0.5; more = 0. |
| Education | 15 | Level met and relevant field = 1; level met, other field = 0.6; level not met = 0. |
| Location | 15 | Country in preferences = 1; remote role = 0.7; otherwise 0. |
| Language | 10 | Share of required languages met at the required level. |
| Career interests | 10 | Any interest matches the role category or a tag on whole words (3+ letters) = 1, else 0. |

**Missing data** receives 50% of the weight (neutral), is labelled "Not provided" and raises a
`missing` flag. It is never counted as a match.

**Hard constraints** are evaluated separately from the score:

- A required language below the required level, an enrolled-student-only role for a non-student, or a
  stated "no" to work authorisation raises a `critical` flag. The score is capped at **35** and the band
  becomes **Critical gap**, so a blocked role cannot rank as a strong match on skills alone.
- Unknown work authorisation for a role that requires it raises a `verify` flag with fixed wording:
  "Work authorisation not confirmed — needs verification". No score penalty is applied, and the platform
  never presents an inferred visa or work status as a legal determination.

Bands: Strong ≥ 75, Partial 50–74, Weak < 50. Any role with a `verify` flag also shows an
"Eligibility to verify" badge next to its band, so a high score never reads as confirmed eligibility. Ranking is by score, then id, so it is deterministic.
The detail page shows every criterion's points, so any score can be traced to its rules.

Applicants are ranked for the employer by the same `matchOne` function, best score first, then by name.

## 4. AI design

The AI is used in two places. In both, it never scores, ranks or decides eligibility.

### 4.1 Match summary

- **What the model does:** Claude Haiku 5.5 (through OpenRouter) rewrites the engine's output (band, strengths, gaps, flags)
  into a two-sentence summary. It does not score, rank or decide eligibility.
- **What is sent:** role facts (title, organisation, country, type) and the rule output only. No free-text
  profile summary, names or contact details. The browser sends the structured profile; the server
  recomputes the match itself, so a client cannot inject its own strengths, gaps or flags into the prompt.
- **Unreliable output:** a strict JSON schema is requested (`response_format: json_schema`); the response is then re-validated
  (40–600 characters) and rejected if it contains any number not present in the input (for example an
  invented score) or if it leaves out the work-authorisation verification the rules raised. The system prompt forbids new facts and any visa or immigration conclusion.
- **Service unavailable:** no key, an 8-second timeout, an API error, a refusal or invalid output all
  return the rule-based template summary. The page shows the template immediately and replaces it only
  if a valid AI summary arrives. The label states which source produced the text.

### 4.2 Resume reading

- **What the model does:** Gemini 2.5 Flash Lite (through OpenRouter, `OPENROUTER_RESUME_MODEL`
  overrides it) reads an uploaded PDF and returns profile facts: education, dated roles, a short
  summary, skills, languages, interests and enrolled-student status.
- **Input checks:** PDF only, checked by the `%PDF-` magic bytes, not the file name or MIME type. Maximum
  4 MB. The resume route needs an API key (503 without one) and is rate limited.
- **Strict output:** the request uses a strict JSON schema (`response_format: json_schema`,
  `temperature: 0`). The system prompt says to use only stated facts, never guess, and treat the resume
  as data, not instructions. There is a 25-second timeout.
- **Sanitised output:** `sanitizeResumeFields` treats the reply as untrusted. It allows only known enum
  values, trims and caps text, removes duplicate list items, caps lists, and turns anything unusable
  into "not provided". An unclear language level becomes `basic`, the most cautious level.
- **Years computed in code:** `yearsFromRoles` counts years from the dated roles, not from a number the
  model writes. Months are inclusive, "present" is the current month, overlapping roles count once,
  internships count half, future months are ignored, and the result is capped at 50.
- **Never read from a resume:** preferred countries and work authorisation. A resume does not state
  them, and eligibility must never be guessed.
- **User in control:** `mergeResume` fills the form and adds list items without removing any. The user
  reviews and saves the profile. Nothing is scored from the resume until the user saves.
- **Failure:** no key, a model error, a timeout or invalid JSON returns a plain message, and the user
  fills in the form by hand. Storage runs alongside reading; a storage failure does not block the form.

## 5. Validation and errors

- Profile form: zod validation on submit, with an error summary that receives focus and inline messages
  linked to each field (education level, years 0–50, at least one skill, one language, one country).
- Sample data is validated at load; invalid data fails the build and the tests instead of reaching users.
- Stored browser data is re-validated on every read; corrupt JSON or a schema mismatch returns an empty state.
- Session cookies are verified (signature, expiry, shape) on every request. A bad cookie means "signed out".
- The summary API rejects malformed JSON, invalid shapes, mismatched ids (400) and unknown opportunities (404).
- Sign-up rejects a duplicate email (409) and an employer organisation that is not in the list (400).
- Applying needs a signed-in candidate (401/403), a complete profile (400) and a known role (404). A
  resume can be attached only if its key belongs to this candidate or to an anonymous upload, and the
  file exists (400 otherwise).
- Resume upload returns 413 for a file over 4 MB, 415 for a non-PDF, and 502 when the model fails.
- Unknown opportunity URLs return a 404 page. Loading and empty states exist for every list.

## 6. Security and privacy

**Implemented now:**

- Server-side accounts. Passwords are hashed with scrypt (N=16384, r=8, p=1) and a random 16-byte salt,
  and compared in constant time. Sign-in hashes a dummy password when the email is unknown, so response
  time does not reveal which emails exist.
- Sessions: an HMAC-SHA256 signed cookie, HttpOnly, SameSite=Lax, Secure in production, 7 days. In
  production the server refuses to sign sessions without a `SESSION_SECRET` of 32 or more characters.
- Authorisation on every protected route. Only candidates can apply. Only employers can list applicants
  or download resumes, and only for roles of their own organisation (403 otherwise). Anonymous requests
  get 401.
- Resumes sit in a private Blob store with no public URLs. The download route streams the file as an
  attachment with `nosniff` and `no-store` headers.
- Rate limits per route family and client IP. Secrets live only in server-side environment variables.
- Data minimisation for AI: the summary prompt gets no free text, names or contact details. The resume
  model gets the PDF only, and its output is sanitised.

**Next for production:**

- Email verification and password reset. Neither exists today.
- Account deletion and data export by the user. Today "Clear my data" removes only what the browser
  holds; server records (account, resume, applications) cannot yet be deleted by the user.
- A shared rate-limit store or the platform firewall. The current limit is per instance only.
- A real database (see trade-offs). The Blob store has no transactions and no unique constraints, so two
  sign-ups with the same email at the same moment are not strictly prevented.
- Session revocation (today a cookie stays valid until it expires), MFA, and CSRF tokens on top of
  SameSite=Lax.
- Clean-up of unused resumes (for example anonymous uploads that never become an application).
- GDPR (the platform targets EU roles): lawful basis and consent, a full privacy notice, retention
  limits and audit logging. A provider agreement with no training on customer data and a defined
  retention, for both AI calls.
- Dependency and security scanning in CI.

## 7. Product decisions from competitor research

A review of relocation job boards, AI job-match tools, and visa and talent-mobility tools
(`docs/COMPETITOR_RESEARCH.md`) found three recurring gaps:

- **Black-box percentages.** The tools give a score but do not show how it was reached.
- **Fit and eligibility blended into one number.** A role the user cannot legally take can look as good as one they can.
- **Eligibility checkers and job listings kept apart.** The visa tools have no jobs, and the job boards have no eligibility logic.

The redesign responds to each one:

- **Visible arithmetic.** A score strip shows each criterion as a segment: its width is the weight and its fill is the points earned. The detail page shows the weight × share calculation for every criterion.
- **Two separate signals.** The fit score is shown next to, not combined with, an eligibility status.
- **Eligibility next to the role.** Each detail page has steps to verify, linked to official sources.

Further borrowed patterns:

- An "x of y required skills" count.
- "Why it fits" and "What to review" sections.
- Next steps for each gap.
- A profile-strength meter.
- Application stages on the shortlist.
- A public "How matching works" page that states what is *not* scored.

## 8. Key trade-offs

- **Rules over machine learning:** fully explainable and testable, which suits a decision support tool
  where users must see why. Cost: synonym matching misses skills phrased differently.
- **Vercel Blob instead of a database:** zero new infrastructure and fast to ship. The store is private
  and already part of the hosting platform. Cost: no transactions, no unique constraints and no
  queries. Applicant lists come from listing keys by prefix, which gets slower as data grows.
- **Profile in the browser until applying:** a candidate can explore matches without sending personal
  data to the server. Cost: no cross-device access to the profile, shortlist or notes.
- **AI limited to wording and form-filling:** the AI can make results easier to read and save typing,
  but cannot cause a wrong score or an eligibility claim. The user reviews resume values before they
  count. Cost: less "intelligent" matching than an embedding-based approach.
- **Critical cap at 35:** keeps blocked roles visible (users may plan to close the gap) without ranking
  them above eligible roles of similar fit.

## 9. Known limitations and next steps

- Skill matching is lexical, and US/UK spelling variants (e.g. visualization / visualisation) are not yet folded. Next: embeddings or a curated skills taxonomy (e.g. ESCO) for semantic matching.
- Weights are fixed. Next: let users adjust priorities, and calibrate weights against real outcomes.
- Storage uses Blob as a key store. Next: a relational database with unique constraints and
  transactions for accounts and applications.
- Rate limits are per instance. Next: a shared store or the platform firewall.
- No email verification, password reset or user-driven account deletion. Next: add these before any
  real users.
- Employers see applicants and can email them (a `mailto:` link), but cannot change an application's
  status in the app, and the candidate does not see employer feedback.
- Sample data has 12 roles; a real catalogue needs ingestion, de-duplication and freshness checks.
- The AI summary and resume reading are live in production. Both were checked on the deployed site on
  2026-11-16. Unit and end-to-end tests use mocks, so they stay free and deterministic.
