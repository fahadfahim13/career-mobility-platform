import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { BandBadge, EligibilityTag, ScoreFigure } from "../components/badges";
import { opportunityMeta } from "../components/MatchCard";
import { SampleProfileButton } from "../components/SampleProfileButton";
import { ScoreStrip } from "../components/ScoreStrip";
import { btnOnField, btnOnFieldOutline, btnPrimary, btnSecondary } from "../components/ui";
import { getCountryGuide } from "../data/countryGuides";
import { sampleProfile } from "../data/sampleProfile";
import { getOpportunities, getOpportunity } from "../lib/data";
import { refCode } from "../lib/format";
import { CRITICAL_CAP, matchOne } from "../lib/matching/engine";
import { WEIGHTS, LABELS } from "../lib/matching/criteria";

const STEPS = [
  {
    title: "Tell us where you want to work",
    body: "Your skills, experience, languages and the countries you would move to. For each country, say whether you have the right to work there, or answer “Not sure”.",
  },
  {
    title: "We score every role, openly",
    body: "Each role is scored on six weighted criteria. The strip under every score shows exactly where the points came from and where they were lost.",
  },
  {
    title: "You decide what is next",
    body: "Shortlist the roles worth pursuing, track each application, and work through the steps to verify, with links to the official sources.",
  },
];

const COMPARE = [
  ["The score", "A percentage, with no working shown", "The number and every point behind it, the same every time"],
  ["Visa and work permits", "A “visa sponsorship” badge on the job", "Your own status per country, kept apart from the score, plus steps to verify"],
  ["Gaps", "A list of missing keywords", "Missing skills, language levels and hard requirements, each with a next step"],
  ["Languages", "Collected at sign-up, then ignored", "The role’s required level compared with yours"],
  ["Your data", "An account and a CV upload", "No account. Your profile stays in this browser"],
];

const FAQ = [
  {
    q: "Is the match score a hiring decision?",
    a: "No. The score is feedback on how your profile compares with a role’s stated requirements. It is not an employer’s decision and not a prediction of an interview.",
  },
  {
    q: "Does Pathway decide whether I can work in a country?",
    a: "Never. If you are not sure of your right to work, the role is marked “Eligibility to verify” and you get the official sources to check. Only the authority of that country can make that decision.",
  },
  {
    q: "What does the AI do?",
    a: "Only one thing: it rewrites the rule engine’s result as a two-sentence summary. It cannot change a score, a gap or a flag. If the AI is unavailable, a summary built from the rules is shown instead.",
  },
  {
    q: "Where is my information stored?",
    a: "Only in your browser’s local storage. There is no account and nothing is sent to an employer. “Clear my data” on the profile page removes it.",
  },
  {
    q: "Are these real jobs?",
    a: "No. This is a prototype built for a technical assessment. All twelve organisations, roles and salaries are fictional.",
  },
];

export default function Home() {
  const demoOpp = getOpportunity("operations-coordinator-singapore")!;
  const demo = matchOne(sampleProfile, demoOpp);
  const countries = [...new Set(getOpportunities().map((o) => o.country))];

  return (
    <div className="-mt-8 space-y-20 sm:-mt-12 sm:space-y-28">
      {/* Hero: the ultramarine field and a live score strip computed by the engine. */}
      <section className="-mx-4 grid grid-cols-1 lg:mx-0 lg:grid-cols-12" aria-labelledby="hero-h">
        <div className="on-field bg-field px-5 py-12 text-on-field sm:px-10 sm:py-16 lg:col-span-7">
          <h1 id="hero-h" className="text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-7xl">
            Work abroad.
            <br />
            Know exactly why you fit.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-on-field-muted">
            Pathway ranks international roles against your profile and shows the arithmetic behind every score. Your
            right to work is checked separately, and never assumed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SampleProfileButton className={btnOnField} />
            <Link href="/profile" className={btnOnFieldOutline}>Build your profile</Link>
          </div>
          <p className="mt-6 text-sm text-on-field-muted">No account. About five minutes. Your data stays in this browser.</p>
        </div>

        <div className="border-x-2 border-b-2 border-ink bg-white px-5 py-8 sm:px-8 lg:col-span-5 lg:border-l-0 lg:border-t-2 lg:py-10">
          <h2 className="text-sm font-bold">Live example, calculated by the same engine you will use</h2>
          <div className="mt-5 border-t-2 border-ink pt-4">
            <p className="text-xl font-bold leading-snug tracking-tight">{demoOpp.title}</p>
            <p className="text-sm text-muted">{opportunityMeta(demoOpp)}</p>
            <p className="mt-2 inline-block border-t border-ink pt-0.5 text-xs font-bold tracking-wider">Ref. {refCode(demoOpp)}</p>
          </div>
          <div className="mt-5 flex items-end justify-between gap-3">
            <ScoreFigure score={demo.score} size="lg" />
            <div className="flex flex-col items-end gap-1">
              <BandBadge band={demo.band} />
              <EligibilityTag eligibility={demo.eligibility} />
            </div>
          </div>
          <div className="mt-6">
            <ScoreStrip result={demo} variant="full" animate />
          </div>
          <ul className="mt-5 space-y-1.5 text-sm">
            {demo.strengths.slice(0, 2).map((s) => (
              <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />{s}</li>
            ))}
            {demo.gaps.slice(0, 1).map((g) => (
              <li key={g} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />{g}</li>
            ))}
          </ul>
          <p className="mt-4 bg-verify-tint px-3 py-2 text-xs">
            A high score is not a right to work. This candidate has not confirmed work authorisation for {demoOpp.country},
            so the role is marked for verification.
          </p>
        </div>
      </section>

      <section aria-labelledby="steps-h">
        <h2 id="steps-h" className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">From profile to shortlist in three steps</h2>
        <ol className="mt-10 grid gap-px bg-ink sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className="bg-paper p-6 sm:p-8">
              <span className="text-6xl font-extrabold leading-none tracking-tighter text-field" aria-hidden>{i + 1}</span>
              <h3 className="mt-4 text-xl font-bold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="signals-h" className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="signals-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">Two signals, never blended</h2>
          <p className="mt-4 text-muted">
            Most tools fold everything into one percentage, so a role you cannot legally take looks as good as one you can.
            Pathway keeps fit and eligibility apart.
          </p>
        </div>
        <div className="grid gap-px bg-ink sm:grid-cols-2 lg:col-span-8">
          <div className="bg-paper p-6">
            <h3 className="text-xl font-bold">Fit score, 0 to 100</h3>
            <p className="mt-2 text-sm text-muted">How your profile compares with the role’s stated requirements.</p>
            <dl className="mt-5 divide-y divide-line text-sm">
              {Object.entries(WEIGHTS).map(([k, w]) => (
                <div key={k} className="flex justify-between py-1.5">
                  <dt>{LABELS[k as keyof typeof LABELS]}</dt>
                  <dd className="font-bold tabular-nums">{w}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-sm">
              An unmet hard requirement (language, enrolment, a stated lack of work authorisation) caps the score at{" "}
              <strong>{CRITICAL_CAP}</strong>.
            </p>
          </div>
          <div className="bg-paper p-6">
            <h3 className="text-xl font-bold">Eligibility status</h3>
            <p className="mt-2 text-sm text-muted">Your right to work in the role’s country, from your own answer.</p>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <EligibilityTag eligibility="clear" />
                <p className="mt-1">You said you have the right to work there.</p>
              </li>
              <li>
                <EligibilityTag eligibility="verify" />
                <p className="mt-1">You are not sure. Nothing is assumed; you get steps to verify.</p>
              </li>
              <li>
                <EligibilityTag eligibility="blocked" />
                <p className="mt-1">You said you do not have it. The role is shown, but capped.</p>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="compare-h">
        <h2 id="compare-h" className="max-w-3xl text-3xl font-extrabold tracking-tight sm:text-5xl">What changes compared with today’s tools</h2>
        <p className="mt-4 max-w-2xl text-muted">
          Based on a review of relocation job boards, AI job-match tools and official visa checkers.{" "}
          <a href="https://github.com/fahadfahim13/career-mobility-platform/blob/main/docs/COMPETITOR_RESEARCH.md" className="font-semibold text-field underline">
            Read the research
          </a>
        </p>
        <dl className="mt-8 space-y-6 sm:hidden">
          {COMPARE.map(([topic, them, us]) => (
            <div key={topic} className="border-t-2 border-ink pt-3">
              <dt className="font-bold">{topic}</dt>
              <dd className="mt-1 text-sm text-muted">Most tools: {them}</dd>
              <dd className="mt-2 bg-field-tint px-3 py-2 text-sm font-semibold">Pathway: {us}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 hidden sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-ink">
              <tr>
                <th scope="col" className="w-1/5 py-3 pr-4 font-bold"><span className="sr-only">Topic</span></th>
                <th scope="col" className="py-3 pr-4 font-bold text-muted">What most tools show</th>
                <th scope="col" className="bg-field px-4 py-3 font-bold text-on-field">What Pathway shows</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map(([topic, them, us]) => (
                <tr key={topic} className="border-b border-line align-top">
                  <th scope="row" className="py-4 pr-4 font-bold">{topic}</th>
                  <td className="py-4 pr-4 text-muted">{them}</td>
                  <td className="bg-field-tint px-4 py-4 font-semibold">{us}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="sources-h" className="grid gap-8 border-t-2 border-ink pt-10 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="sources-h" className="text-3xl font-extrabold tracking-tight">Official sources on every role</h2>
          <p className="mt-3 text-muted">
            Each role links to the government authority for its country, with the questions to check before you apply. For
            reference only; not legal advice.
          </p>
        </div>
        <ul className="grid gap-px bg-line sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
          {countries.map((c) => {
            const g = getCountryGuide(c);
            return (
              <li key={c} className="bg-paper p-4">
                <p className="font-bold">{c}</p>
                {g.sources.map((s) => (
                  <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="mt-1 block text-sm text-field underline">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                ))}
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="faq-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="faq-h" className="text-3xl font-extrabold tracking-tight lg:col-span-4">Questions</h2>
        <div className="divide-y divide-line border-y-2 border-ink lg:col-span-8">
          {FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 items-center justify-between gap-4 py-3 text-lg font-bold">
                {f.q}
                <span className="text-2xl font-normal text-field transition-transform duration-200 group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="pb-5 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="on-field -mx-4 bg-ink px-5 py-12 text-paper sm:mx-0 sm:px-10" aria-labelledby="cta-h">
        <h2 id="cta-h" className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">See your first ranked list in one click.</h2>
        <p className="mt-3 max-w-xl text-slate-300">Load the sample candidate from the brief, or build your own profile.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <SampleProfileButton className={btnPrimary} />
          <Link href="/profile" className={`${btnSecondary} border-paper bg-ink text-paper hover:bg-paper hover:text-ink`}>Build your profile</Link>
        </div>
      </section>
    </div>
  );
}
