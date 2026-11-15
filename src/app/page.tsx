import { ArrowRight, Check, Minus, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BandBadge, EligibilityTag, ScoreFigure } from "../components/badges";
import { CompareMatrix, EligibilityFlow, TwoSidedFlow, WeightsDonut } from "../components/diagrams";
import { opportunityMeta } from "../components/MatchCard";
import { SampleProfileButton } from "../components/SampleProfileButton";
import { ScoreStrip } from "../components/ScoreStrip";
import { btnOnField, btnOnFieldOutline, btnPrimary, btnSecondary } from "../components/ui";
import { getCountryGuide } from "../data/countryGuides";
import { sampleProfile } from "../data/sampleProfile";
import { getOpportunities, getOpportunity } from "../lib/data";
import { matchOne } from "../lib/matching/engine";
import dubai from "../../public/images/dubai.webp";
import hero from "../../public/images/hero.webp";
import frankfurt from "../../public/images/frankfurt.webp";
import london from "../../public/images/london.webp";
import seeker from "../../public/images/seeker.webp";
import singapore from "../../public/images/singapore.webp";
import team from "../../public/images/team.webp";
import toronto from "../../public/images/toronto.webp";

const AUDIENCES = [
  {
    photo: seeker,
    alt: "A person applying for jobs on a laptop",
    title: "For job seekers",
    points: ["Roles abroad you qualify for", "Why you fit, and what to improve", "Official steps to verify right to work"],
    cta: "Find roles",
    href: "/signup?role=seeker",
    primary: true,
  },
  {
    photo: team,
    alt: "A hiring team reviewing candidates around a table",
    title: "For employers",
    points: ["Candidates ranked by fit for each role", "Right to work shown for every candidate", "The score behind every ranking"],
    cta: "Find candidates",
    href: "/signup?role=employer",
    primary: false,
  },
];

const COMPARE: [string, string, string][] = [
  ["Explained score", "A number with no reasons", "Every point explained"],
  ["Right to work", "A “visa sponsorship” badge", "Per person, per country"],
  ["Gaps with next steps", "Missing keywords", "Each gap has a next step"],
  ["Two-sided", "Applicants sorted by keywords", "Candidates ranked by fit"],
];

const CITIES = [
  { img: frankfurt, country: "Germany", city: "Frankfurt" },
  { img: toronto, country: "Canada", city: "Toronto" },
  { img: london, country: "United Kingdom", city: "London" },
  { img: singapore, country: "Singapore", city: "Singapore" },
  { img: dubai, country: "United Arab Emirates", city: "Dubai" },
];

/** Mosaic: two wide tiles over three squares; on phones the last tile spans the row. */
const TILE = [
  "aspect-[4/3] md:col-span-3",
  "aspect-[4/3] md:col-span-3",
  "aspect-square md:col-span-2",
  "aspect-square md:col-span-2",
  "col-span-2 aspect-[2/1] md:aspect-square",
];

const FAQ = [
  { q: "Is the score a hiring decision?", a: "No. It compares a profile with a role’s stated requirements. People make the decision." },
  { q: "Does Pathway decide who can work in a country?", a: "No. Right to work is self-stated. Unknown answers are marked “to verify”, with official links." },
  { q: "What does the AI do?", a: "It writes a two-sentence summary. It cannot change a score. Without it, a rules-based summary is shown." },
  { q: "Where is my data stored?", a: "In this prototype, only in your browser. Nothing is sent to a server or shared with employers." },
  { q: "Are these real jobs and candidates?", a: "No. All organisations, roles, salaries and candidates are fictional." },
];

export default function Home() {
  const demoOpp = getOpportunity("operations-coordinator-singapore")!;
  const demo = matchOne(sampleProfile, demoOpp);
  const roles = getOpportunities();
  const countries = [...new Set(roles.map((o) => o.country))];

  return (
    <div className="-mt-8 space-y-20 sm:-mt-12 sm:space-y-28">
      {/* Hero: statement on the navy field, a real photo, and a live match card computed by the engine. */}
      <section className="-mx-4 grid grid-cols-1 lg:mx-0 lg:grid-cols-12" aria-labelledby="hero-h">
        <div className="on-field flex flex-col justify-center bg-field px-5 py-12 text-on-field sm:px-10 sm:py-16 lg:col-span-6">
          <h1 id="hero-h" className="text-5xl font-extrabold leading-[0.95] tracking-tighter sm:text-7xl">
            Find work abroad.
            <br />
            Hire from abroad.
          </h1>
          <p className="mt-6 max-w-md text-lg text-on-field-muted">
            A clear fit score for every match. Right to work shown separately, never assumed.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?role=seeker" className={btnOnField}>
              I’m looking for work <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/signup?role=employer" className={btnOnFieldOutline}>I’m hiring</Link>
          </div>
          <div className="mt-6 text-sm">
            <SampleProfileButton className="inline-flex min-h-10 items-center gap-1.5 font-semibold text-on-field underline underline-offset-4 hover:no-underline" />
          </div>
        </div>

        <div className="relative min-h-[42rem] overflow-hidden bg-field-deep sm:min-h-[32rem] lg:col-span-6">
          <Image src={hero} alt="A candidate reviewing roles abroad on a laptop" fill priority placeholder="blur" sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-x-4 bottom-4 border border-ink bg-white p-5 shadow-[0_12px_32px_-12px_rgba(17,29,51,0.45)] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[22rem]">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Live example</p>
            <h2 className="mt-1 text-lg font-bold leading-snug tracking-tight">{demoOpp.title}</h2>
            <p className="text-sm text-muted">{opportunityMeta(demoOpp)}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <ScoreFigure score={demo.score} size="lg" />
              <div className="flex flex-col items-end gap-1">
                <BandBadge band={demo.band} />
                <EligibilityTag eligibility={demo.eligibility} />
              </div>
            </div>
            <div className="mt-4">
              <ScoreStrip result={demo} variant="full" animate />
            </div>
            <ul className="mt-4 space-y-1 text-sm">
              {demo.strengths.slice(0, 1).map((s) => (
                <li key={s} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-met" aria-hidden />{s}</li>
              ))}
              {demo.gaps.slice(0, 1).map((g) => (
                <li key={g} className="flex gap-2"><Minus className="mt-0.5 size-4 shrink-0 text-blocked" aria-hidden />{g}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The problem, drawn as a flow rather than written as a paragraph. */}
      <section aria-labelledby="problem-h">
        <div className="grid gap-4 lg:grid-cols-12">
          <h2 id="problem-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:col-span-7">One match. Both sides see the same facts.</h2>
          <p className="text-muted lg:col-span-5 lg:self-end">
            Candidates don’t know which roles abroad they qualify for. Employers don’t know who can work there. Pathway answers both.
          </p>
        </div>
        <div className="mt-10">
          <TwoSidedFlow />
        </div>
      </section>

      <section aria-labelledby="aud-h">
        <h2 id="aud-h" className="sr-only">Who Pathway is for</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {AUDIENCES.map((a) => (
            <article key={a.title} className="flex flex-col border border-line bg-white">
              <div className="relative aspect-[16/9]">
                <Image src={a.photo} alt={a.alt} fill placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-2xl font-bold tracking-tight">{a.title}</h3>
                <ul className="mt-3 flex-1 space-y-2 text-sm">
                  {a.points.map((p) => (
                    <li key={p} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-field" aria-hidden />{p}</li>
                  ))}
                </ul>
                <Link href={a.href} className={`${a.primary ? btnPrimary : btnSecondary} mt-6 self-start`}>
                  {a.cta} <ArrowRight className="size-4" aria-hidden />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* How it works: three steps, each shown as the screen it produces. */}
      <section aria-labelledby="steps-h">
        <h2 id="steps-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">How it works</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          <li className="flex flex-col border-t-4 border-field bg-white p-5">
            <p className="text-sm font-bold text-muted">Step 1</p>
            <h3 className="text-xl font-bold">Build a profile</h3>
            <div className="mt-5 flex-1 space-y-2 text-sm" aria-hidden>
              {[["Skills", "Excel, SQL, Logistics"], ["Experience", "4 years"], ["Singapore", "Not sure"]].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between border border-line px-3 py-2">
                  <span className="font-semibold">{k}</span>
                  <span className="text-muted">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">About five minutes.</p>
          </li>
          <li className="flex flex-col border-t-4 border-field bg-white p-5">
            <p className="text-sm font-bold text-muted">Step 2</p>
            <h3 className="text-xl font-bold">Get scored matches</h3>
            <div className="mt-5 flex flex-1 flex-col justify-center gap-3" aria-hidden>
              <div className="flex items-end justify-between">
                <ScoreFigure score={demo.score} size="lg" />
                <BandBadge band={demo.band} />
              </div>
              <ScoreStrip result={demo} variant="full" />
            </div>
            <p className="mt-4 text-sm text-muted">Six weighted criteria, working shown.</p>
          </li>
          <li className="flex flex-col border-t-4 border-field bg-white p-5">
            <p className="text-sm font-bold text-muted">Step 3</p>
            <h3 className="text-xl font-bold">Verify and apply</h3>
            <ol className="mt-5 flex-1 space-y-2 text-sm font-semibold" aria-hidden>
              {["Saved", "Applied", "Interviewing", "Offer"].map((s, i) => (
                <li key={s} className="flex items-center gap-3">
                  <span className={`grid size-7 shrink-0 place-items-center text-xs ${i === 0 ? "bg-field text-on-field" : "border border-field text-field"}`}>{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-muted">Official links for each country.</p>
          </li>
        </ol>
      </section>

      {/* Two signals: a chart of the real weights and the eligibility decision diagram. */}
      <section aria-labelledby="signals-h" className="on-field -mx-4 bg-field px-5 py-12 text-on-field sm:mx-0 sm:px-10 sm:py-16">
        <h2 id="signals-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">Two signals, never blended</h2>
        <p className="mt-3 max-w-xl text-on-field-muted">A great fit you can’t legally take is not a great match.</p>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="mb-5 text-xl font-bold">1. Fit score</h3>
            <WeightsDonut onField />
          </div>
          <div>
            <h3 className="mb-5 text-xl font-bold">2. Right to work</h3>
            <EligibilityFlow onField />
          </div>
        </div>
      </section>

      <section aria-labelledby="compare-h" className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="compare-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl">Why Pathway</h2>
          <p className="mt-4 text-muted">From a review of 23 job boards, match tools and visa checkers.</p>
          <a href="https://github.com/fahadfahim13/career-mobility-platform/blob/main/docs/COMPETITOR_RESEARCH.md" className="mt-3 inline-block font-semibold text-field underline">
            Read the research
          </a>
        </div>
        <div className="lg:col-span-8">
          <CompareMatrix rows={COMPARE} />
        </div>
      </section>

      {/* Countries as a photo mosaic, with official sources underneath. */}
      <section aria-labelledby="sources-h">
        <div className="grid gap-4 lg:grid-cols-12">
          <h2 id="sources-h" className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:col-span-7">
            {roles.length} roles in {countries.length} countries
          </h2>
          <p className="text-muted lg:col-span-5 lg:self-end">Every role links to the country’s official authority. Reference only, not legal advice.</p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-6">
          {CITIES.map((c, i) => (
            <li key={c.city} className={`relative overflow-hidden bg-field-deep ${TILE[i]}`}>
              <Image src={c.img} alt={`${c.city} skyline`} fill placeholder="blur" sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-10 text-white">
                <p className="font-bold">{c.country}</p>
                <p className="text-xs opacity-80">{roles.filter((r) => r.country === c.country).length} roles</p>
              </div>
            </li>
          ))}
        </ul>
        <ul className="mt-6 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
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
                <Plus className="size-5 shrink-0 text-field transition-transform duration-200 group-open:rotate-45" aria-hidden />
              </summary>
              <p className="pb-5 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="on-field relative -mx-4 overflow-hidden bg-field px-5 py-14 text-on-field sm:mx-0 sm:px-10" aria-labelledby="cta-h">
        <Image src={team} alt="" fill sizes="100vw" className="object-cover opacity-15" />
        <div className="relative">
          <h2 id="cta-h" className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">Start matching in minutes.</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/signup?role=seeker" className={btnOnField}>
              I’m looking for work <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link href="/signup?role=employer" className={btnOnFieldOutline}>I’m hiring</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
