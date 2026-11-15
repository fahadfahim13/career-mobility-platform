# Pathway — International Career Matching (MVP)

A working prototype of an AI-assisted international career mobility platform. A user creates a career
profile, the system scores 12 sample opportunities across six countries, and the user receives a ranked
list with the reasons for each score, the gaps, and any eligibility concerns. Opportunities can be
opened in detail, saved to a shortlist and applied to. Employers see the people who applied to their
organisation's roles, ranked by the same engine.

- **Live demo:** https://career-mobility-platform.vercel.app
- **Source:** https://github.com/fahadfahim13/career-mobility-platform
- **Technical note:** [docs/TECHNICAL_NOTE.md](docs/TECHNICAL_NOTE.md)
- **Technical design (diagrams):** [docs/TECHNICAL_DESIGN.pdf](docs/TECHNICAL_DESIGN.pdf) — the diagram version of the technical note
- **Test evidence:** [docs/TEST_EVIDENCE.md](docs/TEST_EVIDENCE.md)
- **Competitor research:** [docs/COMPETITOR_RESEARCH.md](docs/COMPETITOR_RESEARCH.md)

## What it does

Each feature below came out of the competitor research (relocation job boards, AI job-match tools, and visa and talent-mobility tools):

- **Score strip with full arithmetic.** Each score is split into six segments: the width is the weight and the fill is the points earned. The detail page shows weight × share = points for every criterion.
- **Fit and eligibility kept apart.** The 0–100 fit score sits next to a separate right-to-work status taken from your own answer: stated, to verify, or stated as not held. An unknown status is never assumed.
- **Steps to verify** for each country, with links to the official government sources, plus a reference-only disclaimer.
- **Next steps for each gap**, each linking to the profile field to update.
- **Required-skill count** on every card ("3 of 4 required skills").
- **Qualification-recognition flag** where it applies.
- **Facts on every role:** salary range, visa support and relocation package (all fictional).
- **Filters and sorting:** match band, country, right-to-work status and visa support; sort by best fit or eligibility first.
- **Profile-strength meter** with section progress and a time estimate.
- **Shortlist with application stages** (Saved → Applying → Applied → Interviewing → Offer → Closed) and notes.
- **Resume upload with AI reading.** On the profile page and on candidate sign-up, a candidate can upload a PDF resume. The server reads it with a low-cost model and fills the form. The candidate reviews every value before saving. Years of experience are calculated in code, not by the model. Preferred countries and work authorisation are never read from a resume.
- **Apply to a role.** A signed-in candidate with a complete profile applies from the role page. The application carries the current profile and, if uploaded, the resume. Applying again sends the updated profile.
- **Two sides: job seekers and employers.** Sign up as either. An employer picks their organisation from the 12 organisations in the data. The employer page lists the people who applied to that organisation's roles, ranked by the same engine, with the full profile, email and a resume download. Employers never see another organisation's applicants. A fictional talent pool stays below as "Suggested from the talent pool".
- **Server-side accounts and sessions.** Passwords are hashed with scrypt and a random salt. The session is a signed, HttpOnly cookie. One-click demo buttons ("Sign in as candidate", "Sign in as hirer") open demo accounts. The demo hirer belongs to Harbourline Logistics.
- **"How matching works" page** covering weights, bands, caps, what is *not* scored, an AI fact sheet and the data policy.

## Quick start

Requirements: Node.js 20 or later, npm.

```bash
npm install
npm run dev          # http://localhost:3000
```

Then open **Profile → Load sample profile → Save profile and view matches**. The sample profile is the
fictional candidate from the assessment brief.

Production build:

```bash
npm run build
npm start
```

Without any environment variables, `npm run dev` runs with an in-memory store. Accounts, applications
and resumes then last only until the server restarts. `npm start` runs in production mode, so set
`SESSION_SECRET` (32+ characters) first, or sign-in and sign-up will fail.

## Configuration

Copy `.env.example` to `.env.local` and fill in the values you need.

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | No | Enables resume reading and the AI-written match summary, through OpenRouter. |
| `OPENROUTER_MODEL` | No | Model for the match summary. Default `anthropic/claude-haiku-5.5`. |
| `OPENROUTER_RESUME_MODEL` | No | Model for resume reading. Default `google/gemini-2.5-flash-lite` (native PDF input, about $0.10 per million input tokens). |
| `BLOB_READ_WRITE_TOKEN` | In production | Private Vercel Blob store that holds accounts, applications and resumes. Set automatically when the store is connected. Without it, the app uses an in-memory store. |
| `SESSION_SECRET` | In production | Signs the session cookie (HMAC-SHA256). At least 32 characters. The server refuses to sign sessions in production without it. Development uses a fixed local secret. |
| `PATHWAY_STORE` | No | `memory` forces the in-memory store, even when a Blob token is set. Used for tests and local end-to-end runs. |
| `RATE_LIMIT_PER_MIN` | No | Requests per minute per client for each route family. Default 20. |

Without an OpenRouter key the app runs in **mock mode**. Every feature works, the resume upload asks the
user to fill in the form by hand, and the detail page shows a rule-based summary instead. In production
the key is set, so the AI summary and resume reading are live.

**Resume upload** (`POST /api/resume`): the server checks the file is a real PDF (magic bytes) of 4 MB
or less. It saves the file to the private store under the uploader's account id (or `anon` before
sign-up). It asks the model for dated roles, skills, education and languages as strict JSON. Years of
experience are calculated in code from the role dates, because small models add dates badly. All
output is cleaned by `sanitizeResumeFields` and merged into the form by `mergeResume` for the user to
check. Preferred countries and work authorisation are never read from a resume.

The score, ranking, gaps and flags never depend on the AI.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Unit tests (Vitest): matching engine, data, storage, AI summary and fallback, resume reading, server auth, applications and employer access, rate limit |
| `npm run test:e2e` | End-to-end tests (Playwright, desktop and mobile). First run: `npx playwright install chromium` |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run report` | Prints the ranked results for the sample profile |

**End-to-end tests, local run.** `npm run test:e2e` builds the app and starts its own server with safe
test settings: no AI key, an in-memory store (no writes to real storage), a test-only session secret
and a high rate limit. Nothing else is needed.

The resume tests mock `/api/resume` in the browser, so they make no AI calls. To run the suite against
a deployed URL: `BASE_URL=https://… npm run test:e2e`. This creates real test accounts on that site.

## Project structure

```
src/
  data/opportunities.json      12 fictional opportunities (validated by zod at load)
  data/candidates.ts           8 fictional candidates for the employer talent pool
  data/sampleProfile.ts        the brief's sample candidate
  lib/schemas.ts               zod schemas: profile, form rules, opportunity
  lib/matching/                the scoring engine (pure functions, no I/O)
    criteria.ts                six weighted criteria
    explain.ts                 eligibility flags, strengths and gaps
    engine.ts                  matchOne / rankOpportunities
  lib/summary/                 template summary + optional AI summary with fallback
  lib/resume/                  resume reading: extract.ts (model call), fields.ts (sanitise, years, merge), store.ts
  lib/server/                  server only: accounts, password (scrypt), session (signed cookie),
                               store (Blob or memory), applications, http helpers
  lib/accounts.ts              shared account rules, organisations, demo accounts, fetch helpers
  lib/rateLimit.ts             in-memory rate limiter
  lib/storage.ts               versioned localStorage for profile, shortlist and resume reference
  app/                         pages: /, /profile, /matches, /opportunities, /opportunities/[id],
                               /shortlist, /employer, /signin, /signup, /how-it-works, /legal
  app/api/summary/             POST: optional AI summary
  app/api/auth/                signup, signin, signout, me, demo
  app/api/resume/              POST: resume upload and reading
  app/api/applications/        POST: apply; GET: the candidate's own applications
  app/api/employer/            GET applicants (own organisation only); GET resume download
  components/                  UI components (ApplyButton, ApplicantList, ResumeUpload, …)
e2e/                           end-to-end specs: journey, accounts, site, resume, applications
docs/                          technical note, technical design (PDF), test evidence, research
```

## AI and tool disclosure

| Tool | Used for |
|---|---|
| **Claude Code (Anthropic, model Claude Opus 5.5)** | AI coding assistant used throughout development, under my direction: turning the brief into a design spec and task plan, writing code and tests (test-first), UI polish, and drafting this documentation. I reviewed the code, decided the matching approach, weights and data, and can explain and change every part of it. |
| **Claude Haiku 5.5 via OpenRouter** | Runtime: rewrites the rule engine's output into a two-sentence summary. Details and safeguards are in the technical note. |
| **Gemini 2.5 Flash Lite via OpenRouter** | Runtime: reads uploaded resumes into profile fields. The user reviews the fields before saving. |
| Next.js 15, React 19, TypeScript, Tailwind CSS 4 | Application framework and styling |
| OpenRouter API (plain `fetch`, no SDK) | AI summary and resume reading calls |
| Vercel Blob (`@vercel/blob`, private store) | Accounts, applications and resumes |
| zod | Validation of profile input, sample data, stored data, sessions, API input and AI output |
| lucide-react | Icon set |
| Vitest, Playwright, jsdom | Unit and end-to-end testing |

No real personal data is used in the sample data. All organisations, roles and the sample candidates
are fictional.

## Known limitations

See the technical note for the full list. In short:

- Skill matching uses keywords and synonyms, not semantic matching.
- The Blob store is used as a simple key store. It has no transactions and no unique constraints, and
  applicant lists come from listing keys.
- Rate limits are in memory, per server instance.
- No email verification, no password reset, and no way for a user to delete their account or
  applications.
- Profile, shortlist and notes stay in the browser until the candidate applies, so they do not follow
  the user to another device.
