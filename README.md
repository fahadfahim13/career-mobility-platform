# Pathway — International Career Matching (MVP)

A working prototype of an AI-assisted international career mobility platform. A user creates a career
profile, the system scores 12 sample opportunities across six countries, and the user receives a ranked
list with the reasons for each score, the gaps, and any eligibility concerns. Opportunities can be
opened in detail and saved to a shortlist.

- **Live demo:** https://career-mobility-platform.vercel.app
- **Source:** https://github.com/fahadfahim13/career-mobility-platform
- **Technical note:** [docs/TECHNICAL_NOTE.md](docs/TECHNICAL_NOTE.md)
- **Test evidence:** [docs/TEST_EVIDENCE.md](docs/TEST_EVIDENCE.md)

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
| `OPENROUTER_API_KEY` | No | Enables the AI-written summary on the opportunity detail page, through OpenRouter. |
| `OPENROUTER_MODEL` | No | OpenRouter model id. Default `anthropic/claude-haiku-5.5`. |

Without a key the app runs in **mock mode**: every feature works, and the detail page shows a
rule-based summary instead. Copy `.env.example` to `.env.local` to set the key. The score, ranking,
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
