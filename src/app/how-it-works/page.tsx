import Link from "next/link";
import { EligibilityFlow, WeightsDonut } from "../../components/diagrams";
import { CtaBand, PageHero } from "../../components/PageHero";
import { btnOnField, wrap } from "../../components/ui";
import team from "../../../public/images/team.webp";
import { CRITICAL_CAP } from "../../lib/matching/engine";
import { LABELS, WEIGHTS } from "../../lib/matching/criteria";
import { RECOGNITION_MESSAGE, VERIFY_WORK_AUTH_MESSAGE } from "../../lib/matching/explain";
import type { CriterionKey } from "../../lib/matching/types";
import { DEFAULT_OPENROUTER_MODEL } from "../../lib/summary/openrouter";

export const metadata = { title: "How matching works — Pathway" };

const RULES: Record<CriterionKey, string> = {
  skills: "Share of the role’s required skills found in your profile. Common synonyms are recognised (for example, “MS Excel” and “Excel”). Desirable skills are listed but not scored.",
  experience: "Full points inside the required range. Half points if you are one year short, none if more. Slightly reduced (80%) if you exceed the range, with a note that you may be overqualified.",
  education: "Full points when you meet the minimum level in a relevant field. 60% when the level is met but the field is different. None below the minimum level.",
  location: "Full points when the role is in one of your preferred countries. 70% for a remote role based elsewhere. None otherwise.",
  language: "Each required language is compared with your level (basic, conversational, professional, native).",
  interests: "Full points when one of your career interests matches the role’s area, word for word.",
};

const NOT_SCORED = [
  "Nationality, age, gender, photos or any protected characteristic. These are never collected.",
  "Salary, visa support and relocation package: shown as facts, never used to rank you.",
  "CV formatting, keywords or writing style.",
  "Your free-text experience summary. It is never sent to the AI.",
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="Method"
        title="How matching works"
        intro="No black boxes. Every score is the sum of six rules. The same profile and role always give the same result."
        aside={
          <div className="border border-on-field-muted/40 bg-field-deep/60 p-6">
            <WeightsDonut onField />
          </div>
        }
      />
      <div className={`${wrap} space-y-16 py-14 sm:py-20`}>

      <section aria-labelledby="w-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="w-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">The six weighted criteria</h2>
        <div className="lg:col-span-8">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-ink text-xs font-bold uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="py-2 pr-3">Criterion</th>
                <th scope="col" className="py-2 pr-3 text-right">Weight</th>
                <th scope="col" className="py-2 pl-3">Rule</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(WEIGHTS) as CriterionKey[]).map((k) => (
                <tr key={k} className="border-b border-line align-top">
                  <th scope="row" className="py-3 pr-3 font-bold">{LABELS[k]}</th>
                  <td className="py-3 pr-3 text-right text-xl font-extrabold tabular-nums">{WEIGHTS[k]}</td>
                  <td className="py-3 pl-3 text-muted">{RULES[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 text-sm">
            <strong>Missing information</strong> earns half the weight for that criterion: neither rewarded nor penalised. It
            is shown with a hatched segment on the score strip and listed as &ldquo;Information missing&rdquo;.
          </p>
        </div>
      </section>

      <section aria-labelledby="b-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="b-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">Bands and hard requirements</h2>
        <div className="space-y-4 lg:col-span-8">
          <dl className="grid gap-px bg-line sm:grid-cols-4">
            {[
              ["Strong", "75 or more"],
              ["Partial", "50 to 74"],
              ["Weak", "Below 50"],
              ["Critical gap", `Capped at ${CRITICAL_CAP}`],
            ].map(([b, r]) => (
              <div key={b} className="bg-paper p-4">
                <dt className="font-bold">{b}</dt>
                <dd className="text-sm text-muted">{r}</dd>
              </div>
            ))}
          </dl>
          <p className="text-sm">
            Three hard requirements cap the score at {CRITICAL_CAP}, so a blocked role can never outrank an eligible one on
            skills alone: a required language level you do not meet, a role open only to enrolled students when you are not
            enrolled, and a role requiring local work authorisation when you have said you do not have it.
          </p>
        </div>
      </section>

      <section aria-labelledby="e-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="e-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">Eligibility is a separate signal</h2>
        <div className="space-y-4 text-sm lg:col-span-8">
          <div className="border border-line bg-white p-5 sm:p-6">
            <EligibilityFlow />
          </div>
          <p>
            Your right to work comes only from your own answer for each country. Pathway never infers it and never makes a
            legal determination.
          </p>
          <p>When you are not sure, the role shows &ldquo;{VERIFY_WORK_AUTH_MESSAGE}&rdquo;.</p>
          <p>
            Where a foreign qualification may need formal recognition, the role also shows &ldquo;{RECOGNITION_MESSAGE}&rdquo;.
            This never changes the score.
          </p>
        </div>
      </section>

      <section aria-labelledby="n-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="n-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">What is not scored</h2>
        <ul className="space-y-2 text-sm lg:col-span-8">
          {NOT_SCORED.map((n) => <li key={n} className="border-b border-line pb-2">{n}</li>)}
        </ul>
      </section>

      <section aria-labelledby="ai-h" className="grid gap-8 lg:grid-cols-12">
        <h2 id="ai-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">AI fact sheet</h2>
        <dl className="divide-y divide-line border-y-2 border-ink text-sm lg:col-span-8">
          {[
            ["What it does", "Rewrites the rule engine’s result for one role as a two-sentence summary on the detail page."],
            ["Model", `${DEFAULT_OPENROUTER_MODEL} through OpenRouter (configurable).`],
            ["What it receives", "The role and the engine’s computed result. The server recalculates the match itself; your free-text summary is removed."],
            ["What it cannot do", "Change a score, a band, a gap or a flag. Its output is checked for length, invented numbers and missing verification wording."],
            ["If it fails", "A summary generated from the rules is shown instead, and labelled as such."],
          ].map(([k, v]) => (
            <div key={k} className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr]">
              <dt className="font-bold">{k}</dt>
              <dd className="text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="privacy" aria-labelledby="p-h" className="grid scroll-mt-24 gap-8 lg:grid-cols-12">
        <h2 id="p-h" className="text-2xl font-extrabold tracking-tight lg:col-span-4">Your data</h2>
        <div className="space-y-3 text-sm lg:col-span-8">
          <p>Your profile, shortlist, stages and notes are stored only in this browser&apos;s local storage. Accounts are browser-only too. Only a resume you choose to upload is stored on a server, in private storage.</p>
          <p>Nothing is shared with employers. The only data that leaves your browser is the structured profile sent to generate the optional AI summary, without your free-text summary.</p>
          <p>Use &ldquo;Clear my data&rdquo; on the profile page to remove everything.</p>
        </div>
      </section>

      </div>
      <CtaBand title="See your own scores." photo={team}>
        <Link href="/profile" className={btnOnField}>Build your profile</Link>
      </CtaBand>
    </>
  );
}
