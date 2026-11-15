# Pathway: competitor research

Date: 2026-11-15. Audience: assessors. Scope: what comparable products do, what they lack, and which patterns Pathway adopts or rejects.

## 1. Purpose and method

Pathway is an MVP international career-mobility platform. A user builds a profile and sees 12 fictional roles ranked by a deterministic 0-100 fit score over six weighted criteria, with strengths, gaps, eligibility flags and a shortlist. This document records the research behind eleven design changes (listed in section 3) so that each can be traced to observed practice or an observed gap.

Method:

- Three research passes were run on 2026-11-15 using live page fetches (WebFetch) and web search (WebSearch).
- Pass 1 covered relocation and cross-border job boards. Pass 2 covered AI job-match and fit-score tools. Pass 3 covered talent-mobility platforms and government or legal visa checkers.
- Quote tags follow the source files. **[live]** means quoted from a page fetched during the session. **[search]** means taken from search-result summaries of official pages, so the wording is likely close but was not read verbatim. Quotes without a tag come from fetched pages in the relocation and mobility passes, where the fetch tool returned page text through a summarising step. Treat them as near-verbatim and re-check before reuse in any external submission.
- Only public pages were read. Logged-in apps were not entered. Anything visible only inside an app is marked as not found rather than guessed.

Sites that could not be read fully (stated honestly):

| Site | Problem | Consequence |
|---|---|---|
| Make it in Germany (Quick-Check, Opportunity Card Self-Check) | Bot wall ("Verifying your browser before proceeding...") | Flow rebuilt from search snippets only. Exact disclaimer text not captured. |
| Australian Home Affairs Visa Explorer | HTTP 403 | Search summary only. No disclaimer captured. |
| VisaGuide.World | HTTP 403 | Not used. |
| Teal (site and help centre) | HTTP 403 | All Teal data is [search]. |
| Jobright in-app score ring and sub-score labels | Not documented publicly | Not copied. Would need a logged-in screenshot. |
| Indeed "Match Overview" article | Search found it, but the fetched article lacked it | Indeed data is [search]. |
| EURES job search | JavaScript app, unreadable | Profile and consent details come from search (Europass). |
| Welcome to the Jungle job pages | App was showing a migration splash | Onboarding detail partly from a third-party review. |
| Workday Career Hub product page | 404 | Used Skills Cloud page and admin-guide snippets. |
| Remote.com visa guides | 404, no disclaimer found | Search summary only. |
| Jobbatical | Pivoted to B2B immigration SaaS | No candidate job board to review. Used for eligibility language only. |

Products reviewed: Relocate.me, Jobbatical, Landing.jobs, Arc.dev, EURES, Make it in Germany, Welcome to the Jungle; Jobright, Jobscan, Teal, LinkedIn, Simplify, Eightfold, Huntr, Indeed; Gloat, Fuel50, Workday, Beamery, GOV.UK Check if you need a UK visa, Canada's Come to Canada tool, Boundless, Remote.com.

## 2. Landscape

### 2.1 Relocation and cross-border job boards

| Product | What it does well | What it lacks |
|---|---|---|
| Relocate.me | Relocation package shown as a perk checklist on job detail (flight, temporary housing, language courses, visa services). Country, visa and tax guides sit beside the jobs. | Score widget shows a bare figure (25/100 seen) with no strengths or gaps. Cards omit salary, visa and relocation facts. No disclaimer next to "Visa services". |
| Jobbatical | Clear eligibility language for employers: "Pre-Hiring Immigration Assessment", free no-login calculators. | Now employer-only. Candidates cannot see eligibility per job. Cites a "99.9%" visa success claim with no stated conditions. |
| Landing.jobs | Strongest structured data and filters: "Visa & work permit" (relocation / visa support), language, salary, experience. Detail chips such as "Requires work permit". Three-step explainer. | "Requires work permit" is a bare fact: it never says whether the user meets it. "Personalized matches" is a claim with no visible score or reason. |
| Arc.dev | Fact rows for location, timezone, salary, minimum experience. Self-select copy ("great fit" / "might not be the right fit"). | "Remote restrictions apply" is opaque. No per-candidate location check. Matching is aimed at employers. |
| EURES | Large inventory. Human fallback ("Individual advice and help"). Explicit consent before a profile is shared. | Two-system flow (Europass, then EURES). Suggestions are unexplained and carry no score. EU-citizen framing helps little with third-country work authorisation. |
| Make it in Germany (search only) | Government funnel: aim, nationality, qualification recognition, language, then visa routes. Described as "non-binding and free of charge". | No jobs attached. Does not say whether a specific role looks reachable by a given route. |
| Welcome to the Jungle | Best onboarding: stepper for job title, experience level, location. Asks about visa need and languages (Otta-era setup, third-party source). | Match is hidden: ranked by relevance with no score or reason. Visa need is asked once and never shown back on a job. |

### 2.2 AI match and fit-score tools

| Product | What it does well | What it lacks |
|---|---|---|
| Jobright | Match score with named parts (experience and seniority, skills alignment, industry, keyword gaps, "Why the Job Fits"). Clear decision-aid disclaimer. Tracker with stages. | Formula unpublished: the FAQ lists "how is it calculated" with no answer. Work authorisation is not a match factor. |
| Jobscan | Published weighting order (hard skills, education, job title, soft skills, other keywords). Match rate updates live. States what is not scored (word count). | Keyword matching against one job at a time. No eligibility, no country context, no numeric weights. No disclaimer. |
| Teal [search] | Colour-coded keyword chips. Tracker with Saved, Applying, Applied, Interviewing, Negotiating, Accepted, plus notes and an excitement level. | Resume keywords only. No job ranking, no eligibility. |
| LinkedIn | "x of y skills match your profile". Inferred skills labelled separately. States that hirers do not see the match level. | No numeric breakdown. Required and preferred items not visibly weighted. No work-authorisation check. |
| Simplify | Fraction-style keyword match ("6 of 10"). Best disclaimer in the group (feedback, not a prediction). | Keyword coverage only. No eligibility. No explanation of ranking across jobs. |
| Eightfold | Plain-language reasoning with each score. Candidates can see fit, aligned skills and gaps. Published bias-audit results. | Employer side, one company's jobs. Reasoning is generated for an embedding model, not traced from rules. No cross-country view. |
| Huntr | Four scored elements with approximate weights, five labelled bands, "Not Covered" marking, private notes on a kanban tracker. | Resume-versus-job only. No disclaimer found. |
| Indeed [search] | Per-item tick or cross on qualifications that the user can edit under "Matching data". Captures languages. | No numeric score, no weighting, no route to close a gap. No work-authorisation logic. |

### 2.3 Mobility platforms and visa checkers

| Product | What it does well | What it lacks |
|---|---|---|
| Gloat | Why-it-matches shown on the card itself. Saved list with statuses (Saved, In Progress, Successful, Closed). Calls to action name the next step. | Score scale not explained publicly. No cross-border or legal dimension. Internal workforce use only. |
| Fuel50 | "Next best step" language. Skills readiness framing. Goals and values used alongside skills. | No visible score meaning. Responsible-AI claims are assertions, not mechanisms. |
| Workday Career Hub / Skills Cloud | Short interests questionnaire before suggestions appear. A separate AI fact sheet exists for the product. | Thin public explainability. The fact sheet is buried in admin documentation and was not retrieved. |
| Beamery | Third-party assurance badge (Warden AI). "Transparent, context-aware recommendations". | No explainability detail on the page. |
| GOV.UK visa checker (walked end to end) | One question per page, a "Do not know" option, "Change" links on the answer review. Result is a list of routes the user "might be eligible" for. | No job matching. No saved state. No explicit disclaimer: hedging is carried by the verbs. |
| Canada: Come to Canada | Upfront topic list and a time estimate (10-15 minutes). Clear reference-only disclaimer. Result leads to instructions. | Long form. No link to actual jobs. |
| Boundless | Plain legal disclaimer sentences. | Informational page only. No checker. |
| Remote.com [search] | Separates employer-sponsored work permits from nomad visas. | No guide or disclaimer could be retrieved. |

## 3. Patterns adopted

Feature numbers refer to the eleven changes to Pathway: (1) score strip with rule arithmetic, (2) fit separate from eligibility status, (3) "x of y required skills" and why-it-fits chips, (4) per-gap next steps, (5) steps-to-verify checklist and disclaimer, (6) qualification-recognition flag, (7) relocation and visa facts with salary, (8) filters and sorting, (9) profile-strength meter and sectioned profile, (10) shortlist tracker, (11) "How matching works" page.

| Pattern | Seen at | How Pathway implements it |
|---|---|---|
| Show each score component with its weight | Huntr (stated weights per element); Jobscan (published priority order); Jobright (named sub-scores) | (1) Score strip lists every criterion with its rule arithmetic, for example points earned out of points available, summing to the total. Weights are stated, not approximated. |
| Plain-language reasoning beside every score | Eightfold ("No black boxes. Match scores come with plain-language reasoning") | (1), (3) Each criterion in the strip carries a one-line reason. The detail page repeats it in words. |
| Score scoped to a single role | Eightfold (a match score assesses fit for one job) | (11) A note on cards and on the "How matching works" page: the score is for this role only and is not portable. |
| Labelled bands | Huntr (Poor to Great); Jobscan (target match rate) | (8), (11) Named score bands are shown on cards, usable as a filter, and defined on the "How matching works" page. |
| "x of y" skill counts | LinkedIn ("x of y skills match"); Simplify ("6 of 10") | (3) Each match card shows "x of y required skills". Required and preferred skills are counted separately. |
| Why-it-matches on the card itself | Gloat (insights on the card); Jobright ("Why the Job Fits") | (3) Two or three why-it-fits chips on each match card, so the reason is visible without opening the detail page. |
| Strengths and gaps as separate lists | Jobright ("Potential Gaps"); Eightfold (aligned skills and gaps); Huntr ("Not Covered") | (1), (3) Detail page lists strengths and gaps in two groups. Gaps use neutral wording ("may need attention"). |
| Gap leads to an action | Fuel50 ("next best step"); Jobright (improve tips); LinkedIn (add the skill from the insight) | (4) Each gap has a next step that links back to the profile field the user can edit. |
| Evidence-linking: each reason cites its source | Eightfold (insights link back to supporting evidence); Huntr (shows which resume parts demonstrate coverage) | (4) Strengths and gaps name the profile field they came from, so the user can correct the input and see the score change. |
| Fit separate from eligibility | Gap in all three reports (see section 4). Closest: Landing.jobs "Requires work permit" chip; GOV.UK "might be eligible" | (2) A fit score and a separate status: clear, verify or blocked. Unknown work authorisation shows "verify", never silently lowers or raises the score. |
| Hedged eligibility verbs | GOV.UK ("You might be eligible for 12 visas"); Canada ("programs you may be eligible for") | (2), (5) Status labels and copy say "may", "might" and "needs verification". No verdicts. |
| Steps to verify with official links | Canada ("detailed list of instructions on what to do next"); Make it in Germany order (nationality, recognition, language) | (5) A per-country checklist on the detail page. Each step links to an official government source. |
| Not-legal-advice disclaimer | Canada ("for reference only"); Boundless ("does not constitute legal advice") | (5) A short, hedged disclaimer beside the checklist and in the footer, blending reference-only and not-legal-advice wording. |
| Qualification recognition as an explicit gate | Make it in Germany (search: recognition is a key gate); Jobbatical ("missing documents") | (6) A verify flag when a role or country needs a recognised qualification, linked to the checklist. It is a flag, not a score input. |
| Relocation package as a perk checklist | Relocate.me ("Advanced relocation package") | (7) Role detail lists relocation items individually (flight, housing, language courses, visa services). |
| Visa support and permit requirement as structured fields | Landing.jobs (filter "Visa & work permit", chip "Requires work permit"); Remote.com (sponsorship tag) | (7), (8) Visa support shown as a fact on card and detail, and available as a filter. |
| Salary range visible on the card | Landing.jobs; Arc.dev | (7) Salary range shown on each role. |
| Structured fact rows on detail | Arc.dev (location, timezone, salary, minimum experience) | (7) Detail page uses labelled fact rows for country, salary, relocation and visa support. |
| Filters including visa and country; sorting | Landing.jobs (visa, language, salary, experience); Jobright (work model, country, experience) | (8) Filters for band, country, eligibility and visa support, plus sorting. |
| Profile-strength meter | Absent from every public surface reviewed (WTTJ asks preferences once; Jobright documents none) | (9) Meter plus a hint such as "add languages to improve accuracy", so the user sees how input quality affects the result. |
| Sectioned, short onboarding with time estimate | Welcome to the Jungle (stepper); Canada (topic list and 10-15 minutes); GOV.UK (one question per page, "Do not know") | (9) Profile is split into short sections with a time estimate up front. Unknown is an allowed answer. |
| Tracker with stages and notes | Jobright (Applied to Archived); Teal (Saved to Accepted, notes); Gloat (Saved to Closed); Huntr (private notes) | (10) Shortlist becomes a tracker: Saved, Applying, Applied, Interviewing, Offer, Closed, with a notes field per role. |
| AI fact sheet and "how it works" page | Workday (separate AI Fact Sheet); Beamery (assurance badge); Eightfold (responsible-AI page) | (11) "How matching works" page: weights, bands, caps, what is not scored, an AI fact sheet and a privacy statement. |
| States what is not scored | Jobscan (word count not scored) | (11) The page lists inputs that do not affect the score. |
| Human decides, tool advises | Eightfold ("The AI recommends. People decide."); Jobright (guidance, not a hiring decision) | (11), (5) Principle line on the explainer page and in the disclaimer. |
| Privacy and consent in plain words | EURES (explicit consent before sharing; optional fields); Indeed (choose what to share) | (11) Statement that profile data stays in the user's browser. There is no sharing step to consent to. |

## 4. Gaps Pathway targets

These recur across the three reports and are deduplicated here.

1. **Black-box or opaque scores.** Relocate.me shows a bare 25/100. Jobright's FAQ lists the calculation with no answer. Landing.jobs and WTTJ claim matching but show no score. Huntr and Jobscan publish approximate weights or an order, but no one shows the arithmetic per criterion. Pathway shows the full rule trace.
2. **Fit and eligibility are blended or absent.** Every product folds everything into one number or ignores legality. A strong fit that the user cannot legally take looks the same as one they can. Pathway keeps two separate signals.
3. **Work authorisation is not personalised per job.** Boards show "Requires work permit" or "Remote restrictions apply". Match tools treat location as a filter at most. Nothing joins the requirement to the user's own situation in a given country. Pathway shows "needs verification" when it is unknown.
4. **Eligibility tools and job boards are split.** Government checkers and employer calculators have no jobs. Job boards have no eligibility logic. Mobility suites are internal-only. Pathway puts a fit score, an eligibility status and verification steps on one card.
5. **No credible legal caution, or none at all.** Relocate.me lists "Visa services" with no caveat. Jobbatical cites a success rate without conditions. GOV.UK carries hedging in verbs only. Pathway pairs hedged wording with links to official sources and a plain disclaimer.
6. **Preferences, languages and qualifications are collected but not used visibly.** WTTJ asks about visa need and languages once and never shows them on a job. Indeed captures languages without scoring them. No tool flags qualification recognition across countries, and no public surface offers a profile-strength meter or user-correctable inputs. Pathway shows inputs back on each role and lets the user edit them.

## 5. Patterns deliberately not adopted

| Pattern | Seen at | Why Pathway does not adopt it |
|---|---|---|
| Resume upload and parsing | Jobright, Jobscan, Teal, Simplify, Huntr, Relocate.me widget | Adds a parsing step whose errors would be hard to explain, and sends personal documents somewhere. Pathway uses structured profile fields, which keeps the score reproducible and the data local. |
| Black-box or "AI-generated" percentage scores | Relocate.me, Jobright, Landing.jobs "personalized matches" | Cannot be audited. Embedding or language-model scores can drift between runs. A deterministic rule engine is reproducible and can be explained line by line. |
| Success-rate or outcome claims | Jobbatical ("99.9%" visa success claim); Boundless disclaimer notes past results do not predict outcomes | A mobility tool cannot promise visa results and the claim has no stated conditions. Pathway makes no outcome claims and says the score is not a prediction. |
| Single blended score including legality | Most match tools | Hides the reason a role is unattainable. Section 4, gap 2. |
| Gamification: streaks, badges, excitement ratings | Teal (excitement level on tracked jobs) | The research found no evidence it helps a serious decision, and it could suggest that visa steps are a game. The tracker keeps stages and notes only. |
| Third-party audit badges and bias-audit claims | Beamery (Warden AI badge); Eightfold (NYC LL144 audits) | Pathway has no independent audit and must not imply one. The "How matching works" page publishes the method and limits instead. |
| Autofill and automatic applications | Jobright, Simplify, Huntr | Out of scope for the MVP, and it would reduce the user's control over what they submit. |
| Hidden gating of value behind login or a paid tier | Relocate.me (full report gated), Teal (top 5 keywords free), LinkedIn (Premium rating) | The explanation is the product. Pathway shows the full breakdown to everyone. |
| Verdict-style eligibility results | Jobbatical "Instantly check eligibility" language, framed for employers | Pathway is not an immigration adviser. Results are "clear / verify / blocked" signals with official links, not rulings. |
| Hiring-side scoring of candidates | Eightfold, Beamery, Arc.dev (employer-facing) | Pathway is candidate-facing. Nothing is shared with employers. |

## 6. Copy principles derived

1. **Hedge every legal statement.** Use "may", "might" and "needs verification". Never "you are eligible" or "you can work in". Source: GOV.UK result heading "You might be eligible for 12 visas." [live]; Canada "programs you may be eligible for".
2. **State plainly that it is reference only.** Source: Canada, "This information is for reference only and no immigration decision will be made".
3. **Say it is not legal advice.** Source: Boundless, "does not constitute legal advice".
4. **Send the user to the official authority for the final check.** Source: Canada, "detailed list of instructions on what to do next". Each step links to the government site.
5. **Call the score feedback, not a decision.** Source: Simplify, "Simplify feedback, not an employer's ATS score or a prediction of an interview" [live]. Source: Jobright, "guidance, not an employer's hiring decision" [live].
6. **Say what the score is not.** Not an interview probability, not a hiring decision, not an eligibility ruling. Source: Jobright blog, a score "is not an interview probability" [search].
7. **Scope the score to one role.** Source: Eightfold, a match score assesses fit "for one job".
8. **Say what is and is not scored.** List the inputs, weights and exclusions. Source: Jobscan states that word count is not scored [live].
9. **Keep the human in charge.** Source: Eightfold, "The AI recommends. People decide."
10. **Use neutral gap wording.** Source: Jobright, "Areas to review before deciding whether to apply" [live]. Avoid "weak", "poor" and "fail".
11. **Encourage truthful edits only.** Source: Jobright, "Improve truthful, relevant details before you apply" [live]. Gap next steps point to real profile fields, not to rewording tricks.
12. **Let the user say "not sure".** Source: GOV.UK, "Do not know" option. Unknown work authorisation should read "needs verification", not zero.
13. **Set expectations before asking.** Tell the user what will be asked and how long it takes. Source: Canada, "about 10-15 minutes".
14. **Name the next step on each button.** Avoid generic labels. Source: Gloat, calls to action "more clearly describe what the next step is".
15. **Be plain about privacy.** Say where data lives and that nothing is shared with employers. Source: Eightfold, "People stay in charge"; EURES, consent "explicitly confirm". Pathway's own line: your data stays in your browser.
16. **Do not promise outcomes.** No success rates, no guarantees. Source: Boundless, "Past results do not guarantee or predict similar outcomes".

## 7. Limits of this research

- Make it in Germany, Australian Home Affairs and Teal could not be read directly, so their entries rely on search summaries.
- Jobright's in-app score ring and the exact text of the Make it in Germany disclaimer were not captured.
- Quotes marked [search] should be re-checked against the live page before they appear in anything external.
- All Pathway roles are fictional. Official-source links in the checklist should be re-verified before any real use.
