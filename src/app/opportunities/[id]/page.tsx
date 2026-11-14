import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OpportunityMatch } from "../../../components/OpportunityMatch";
import { opportunityMeta } from "../../../components/MatchCard";
import { ShortlistButton } from "../../../components/ShortlistButton";
import { panel } from "../../../components/ui";
import { getOpportunities, getOpportunity } from "../../../lib/data";
import { EDUCATION_LABEL, formatLanguage } from "../../../lib/format";

export function generateStaticParams() {
  return getOpportunities().map((o) => ({ id: o.id }));
}

export const dynamicParams = false; // Unknown ids return 404.

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const opp = getOpportunity((await params).id);
  return { title: opp ? `${opp.title} — Pathway` : "Not found — Pathway" };
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-2.5 last:border-0 sm:grid-cols-[140px_1fr]">
      <dt className="text-sm font-medium text-slate-600">{label}</dt>
      <dd className="text-sm text-ink">{children}</dd>
    </div>
  );
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const opp = getOpportunity((await params).id);
  if (!opp) notFound();

  const years = opp.maxYears === null ? `${opp.minYears}+ years` : `${opp.minYears}–${opp.maxYears} years`;

  return (
    <div className="space-y-6">
      <Link href="/matches" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Back to matches
      </Link>
      <header className="flex flex-col items-start justify-between gap-4 sm:flex-row">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{opp.title}</h1>
          <p className="mt-1 text-slate-600">{opportunityMeta(opp)}</p>
        </div>
        <ShortlistButton id={opp.id} title={opp.title} />
      </header>

      <p className="max-w-3xl text-slate-700">{opp.description}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section aria-labelledby="req-h" className={`${panel} self-start p-5 sm:p-6`}>
          <h2 id="req-h" className="text-lg font-semibold text-ink">Requirements</h2>
          <dl className="mt-2">
            <Row label="Required skills">{opp.requiredSkills.join(", ")}</Row>
            <Row label="Desirable skills">{opp.niceToHaveSkills.join(", ") || "—"}</Row>
            <Row label="Experience">{years}</Row>
            <Row label="Field">{opp.category}</Row>
            <Row label="Education">
              {opp.education
                ? `${EDUCATION_LABEL[opp.education.minLevel]} or higher${opp.education.relevantFields.length ? ` in ${opp.education.relevantFields.join(", ")}` : ""}`
                : "No formal requirement stated"}
            </Row>
            <Row label="Languages">{opp.languages.map(formatLanguage).join(", ") || "—"}</Row>
            <Row label="Eligibility">
              <ul className="space-y-0.5">
                <li>{opp.localWorkAuthRequired ? `Right to work in ${opp.country} required` : "No local work authorisation required (remote contract)"}</li>
                {opp.enrolledStudentRequired && <li>Open only to currently enrolled students</li>}
              </ul>
            </Row>
          </dl>
        </section>
        <OpportunityMatch opp={opp} />
      </div>
    </div>
  );
}
