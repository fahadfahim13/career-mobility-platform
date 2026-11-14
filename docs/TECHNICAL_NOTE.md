# Technical note — Pathway career matching MVP

## 1. Architecture

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS 4 | Server-rendered pages for opportunity data; client components for profile, matches and shortlist. |
| Matching | Pure TypeScript module (`src/lib/matching`) | No I/O, fully unit-tested. Runs in the browser, so the profile never has to leave the device to be scored. |
| Backend | One Next.js route handler, `POST /api/summary` | Only used for the optional AI summary. Receives the profile (validated with zod), recomputes the match on the server, rate-limited per client (20/min). Returns 400/404/429 on bad input or abuse. |
| Data storage | Opportunities: versioned JSON file validated by zod at load. Profile and shortlist: browser `localStorage` under versioned keys (`cm.profile.v1`, `cm.shortlist.v1`). | No database is needed for the brief's scope. Corrupt or out-of-date stored data is discarded, not trusted. |
| External service | Anthropic API (Claude Haiku 5.5), optional | Mock mode when no key is set. |

## 2. Data model

- **Profile:** education level (enum) and field, years of experience, summary, skills, languages with
  level (`basic` / `conversational` / `professional` / `native`), preferred countries, career interests,
  enrolled-student status (`true` / `false` / `null`), and work authorisation per country
  (`yes` / `no` / `unknown`). `null` always means "not provided", never "satisfied".
- **Opportunity:** id, title, organisation, country, city, remote flag, type (job / internship), category,
  tags, required and desirable skills, experience range, minimum education level with relevant fields,
  required languages with level, and two hard-constraint flags: `enrolledStudentRequired` and
  `localWorkAuthRequired`.
- **MatchResult:** score (0–100), band, six criterion results (weight, points, status, reasoning),
  strengths, gaps, and flags (`critical`, `verify`, `missing`).

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

## 4. AI design

- **What the model does:** Claude Haiku 5.5 rewrites the engine's output (band, strengths, gaps, flags)
  into a two-sentence summary. It does not score, rank or decide eligibility.
- **What is sent:** role facts (title, organisation, country, type) and the rule output only. No free-text
  profile summary, names or contact details. The browser sends the structured profile; the server
  recomputes the match itself, so a client cannot inject its own strengths, gaps or flags into the prompt.
- **Unreliable output:** structured output (zod schema) is requested; the response is then re-validated
  (40–600 characters) and rejected if it contains any number not present in the input (for example an
  invented score) or if it leaves out the work-authorisation verification the rules raised. The system prompt forbids new facts and any visa or immigration conclusion.
- **Service unavailable:** no key, a 6-second timeout, an API error, a refusal or invalid output all
  return the rule-based template summary. The page shows the template immediately and replaces it only
  if a valid AI summary arrives. The label states which source produced the text.

## 5. Validation and errors

- Profile form: zod validation on submit, with an error summary that receives focus and inline messages
  linked to each field (education level, years 0–50, at least one skill, one language, one country).
- Sample data is validated at load; invalid data fails the build and the tests instead of reaching users.
- Stored data is re-validated on every read; corrupt JSON or a schema mismatch returns an empty state.
- The API rejects malformed JSON, invalid shapes, mismatched ids (400) and unknown opportunities (404).
- Unknown opportunity URLs return a 404 page. Loading and empty states exist for every list.

## 6. Security and privacy (for a real deployment)

- Authentication (e.g. OIDC with MFA) and per-user authorisation on every profile read and write.
- Store profiles server-side, encrypted at rest and in transit (TLS); field-level encryption for
  sensitive attributes such as work-authorisation status.
- Data minimisation: collect only what matching needs; keep sending no free-text personal data to the
  AI provider, and use a provider agreement with no training on customer data and a defined retention.
- GDPR (the platform targets EU roles): lawful basis and consent, a privacy notice, data export and
  deletion (the prototype already offers "Clear my data"), retention limits and audit logging.
- Replace the prototype's in-memory, per-instance rate limit with a shared store or the platform firewall; secrets only in server-side environment
  variables; dependency and security scanning in CI.

## 7. Key trade-offs

- **Rules over machine learning:** fully explainable and testable, which suits a decision support tool
  where users must see why. Cost: synonym matching misses skills phrased differently.
- **Browser storage instead of a database:** no personal data leaves the device and the prototype has no
  server state to secure. Cost: no cross-device access and no recruiter-side features.
- **AI limited to wording:** the AI can make results easier to read but cannot cause a wrong score or an
  eligibility claim. Cost: less "intelligent" matching than an embedding-based approach.
- **Critical cap at 35:** keeps blocked roles visible (users may plan to close the gap) without ranking
  them above eligible roles of similar fit.

## 8. Known limitations and next steps

- Skill matching is lexical, and US/UK spelling variants (e.g. visualization / visualisation) are not yet folded. Next: embeddings or a curated skills taxonomy (e.g. ESCO) for semantic matching.
- Weights are fixed. Next: let users adjust priorities, and calibrate weights against real outcomes.
- The live AI call was tested only with mocks (no API key in the build environment); all fallback paths
  are covered by unit tests.
- No authentication, server-side storage or recruiter view, as agreed in the brief's scope.
- Sample data has 12 roles; a real catalogue needs ingestion, de-duplication and freshness checks.
