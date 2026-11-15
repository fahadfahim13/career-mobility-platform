# Pathway — International Career Matching (MVP)

A working prototype of an AI-assisted international career mobility platform. A user creates a career
profile, the system scores 12 sample opportunities across six countries, and the user receives a ranked
list with the reasons for each score, the gaps, and any eligibility concerns. Opportunities can be
opened in detail and saved to a shortlist.

- **Live demo:** https://career-mobility-platform.vercel.app
- **Source:** https://github.com/fahadfahim13/career-mobility-platform
- **Technical note:** [docs/TECHNICAL_NOTE.md](docs/TECHNICAL_NOTE.md)
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
- **Two sides: job seekers and employers.** Sign up as either. Employers pick a role and see fictional candidates ranked by the same engine, with right to work shown separately and the full score behind each candidate.
- **Sign in and sign up** with one-click demo accounts. This is a prototype: accounts live only in this browser, and passwords are stored as salted SHA-256 hashes. A production build would use a real identity provider.
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

## Configuration

| Variable | Required | Purpose |
|---|---|---|
| `OPENROUTER_API_KEY` | No | Enables resume reading and the AI-written match summary, through OpenRouter. |
| `OPENROUTER_MODEL` | No | Model for the match summary. Default `anthropic/claude-haiku-5.5`. |
| `OPENROUTER_RESUME_MODEL` | No | Model for resume reading. Default `google/gemini-2.5-flash-lite` (native PDF input, about $0.10 per million input tokens). |
| `BLOB_READ_WRITE_TOKEN` | No | Private Vercel Blob store for uploaded resumes. Set automatically when the store is connected. Without it, resumes are read but not kept. |

Without a key the app runs in **mock mode**: every feature works, the resume upload asks the user to
fill in the form by hand, and the detail page shows a rule-based summary instead.

**Resume upload** (`/api/resume`): the server checks the file is a real PDF (magic bytes) under 4 MB,
saves it to the private Blob store, and asks the model for dated roles, skills, education and
languages as strict JSON. Years of experience are calculated in code from the role dates, because
small models add dates badly. All output is cleaned by `sanitizeResumeFields` and merged into the
form for the user to check. Preferred countries and work authorisation are never read from a resume. Copy `.env.example` to `.env.local` to set the key. The score, ranking,
gaps and flags never depend on the AI.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Unit tests (Vitest) — matching engine, data, storage, AI fallback |
| `npm run test:e2e` | End-to-end tests (Playwright, desktop and mobile). First run: `npx playwright install chromium` |
| `npm run typecheck` / `npm run lint` | TypeScript and ESLint |
| `npm run report` | Prints the ranked results for the sample profile |

To run the end-to-end suite against a deployed URL: `BASE_URL=https://… npm run test:e2e`.

## Project structure

```
src/
  data/opportunities.json      12 fictional opportunities (validated by zod at load)
  data/sampleProfile.ts        the brief's sample candidate
  lib/schemas.ts               zod schemas: profile, form rules, opportunity
  lib/matching/                the scoring engine (pure functions, no I/O)
    criteria.ts                six weighted criteria
    explain.ts                 eligibility flags, strengths and gaps
    engine.ts                  matchOne / rankOpportunities
  lib/summary/                 template summary + optional AI summary with fallback
  lib/storage.ts               versioned localStorage for profile and shortlist
  app/                         pages: /, /profile, /matches, /opportunities, /opportunities/[id], /shortlist
  app/api/summary/route.ts     POST endpoint for the optional AI summary
  components/                  UI components
e2e/journey.spec.ts            end-to-end user journeys
docs/                          technical note, test evidence, plan and design spec
```

## AI and tool disclosure

| Tool | Used for |
|---|---|
| **Claude Code (Anthropic, model Claude Opus 5.5)** | AI coding assistant used throughout development, under my direction: turning the brief into a design spec and task plan, writing code and tests (test-first), UI polish, and drafting this documentation. I reviewed the code, decided the matching approach, weights and data, and can explain and change every part of it. |
| **Claude Haiku 5.5 via OpenRouter** | Runtime, optional: rewrites the rule engine's output into a two-sentence summary. Details and safeguards are in the technical note. |
| Next.js 15, React 19, TypeScript, Tailwind CSS 4 | Application framework and styling |
| OpenRouter API (plain `fetch`, no SDK) | Optional AI summary call |
| zod | Validation of profile input, sample data, stored data, API input and AI output |
| lucide-react | Icon set |
| Vitest, Playwright, jsdom | Unit and end-to-end testing |

No real personal data is used. All organisations, roles and the candidate are fictional.

## Known limitations

See the technical note for the full list. In short: no authentication or server-side storage (by
design, per the brief), keyword-and-synonym skill matching rather than semantic matching, and the
live AI path was tested with mocks only because no API key was available in the build environment.
