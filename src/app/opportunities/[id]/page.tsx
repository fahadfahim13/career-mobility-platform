import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { opportunityMeta } from "../../../components/MatchCard";
import { OpportunityMatch } from "../../../components/OpportunityMatch";
import { ShortlistButton } from "../../../components/ShortlistButton";
import { VerifySteps } from "../../../components/VerifySteps";
import { getOpportunities, getOpportunity } from "../../../lib/data";
import { EDUCATION_LABEL, formatLanguage, formatSalary, formatYears, refCode, VISA_SUPPORT_LABEL } from "../../../lib/format";

export function generateStaticParams() {
  return getOpportunities().map((o) => ({ id: o.id }));
}

export const dynamicParams = false; // Unknown ids return 404.

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const opp = getOpportunity((await params).id);
  return { title: opp ? `${opp.title} — Pathway` : "Not found — Pathway" };
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-line py-3 last:border-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

export default async function OpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const opp = getOpportunity((await params).id);
  if (!opp) notFound();

  return (
    <div className="space-y-8">
      <Link href="/matches" className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-field hover:underline">
        <ArrowLeft className="size-4" aria-hidden />
        Back to matches
      </Link>

      <header className="grid gap-4 border-b-2 border-ink pb-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-9">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{opp.title}</h1>
          <p className="mt-2 text-muted">{opportunityMeta(opp)}</p>
          <p className="mt-2 inline-block border-t border-ink pt-0.5 text-xs font-bold tracking-wider">Ref. {refCode(opp)}</p>
        </div>
        <div className="md:col-span-3 md:justify-self-end">
          <ShortlistButton id={opp.id} title={opp.title} />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-8">
          <p className="max-w-3xl text-lg leading-relaxed">{opp.description}</p>
          <OpportunityMatch opp={opp} />
          <VerifySteps opp={opp} />
        </div>

        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <h2 className="border-b-2 border-ink pb-2 text-lg font-bold tracking-tight">About the role</h2>
            <dl>
              <Fact label="Salary (fictional)">{formatSalary(opp)}</Fact>
              <Fact label="Visa and work permit">{VISA_SUPPORT_LABEL[opp.visaSupport]}</Fact>
              <Fact label="Relocation package">
                {opp.relocation.length ? (
                  <ul className="list-disc pl-4">{opp.relocation.map((r) => <li key={r}>{r}</li>)}</ul>
                ) : (
                  "Not offered"
                )}
              </Fact>
              <Fact label="Required skills">{opp.requiredSkills.join(", ")}</Fact>
              <Fact label="Desirable skills">{opp.niceToHaveSkills.join(", ") || "None stated"}</Fact>
              <Fact label="Experience">{formatYears(opp)}</Fact>
              <Fact label="Education">
                {opp.education
                  ? `${EDUCATION_LABEL[opp.education.minLevel]} or higher${opp.education.relevantFields.length ? ` in ${opp.education.relevantFields.join(", ")}` : ""}`
                  : "No formal requirement stated"}
              </Fact>
              <Fact label="Languages">{opp.languages.map(formatLanguage).join(", ") || "None stated"}</Fact>
              <Fact label="Eligibility">
                <ul className="space-y-0.5">
                  <li>{opp.localWorkAuthRequired ? `Right to work in ${opp.country} required` : "No local work authorisation required (remote contract)"}</li>
                  {opp.enrolledStudentRequired && <li>Open only to currently enrolled students</li>}
                  {opp.recognitionMayBeRequired && <li>Foreign qualifications may need formal recognition</li>}
                </ul>
              </Fact>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
