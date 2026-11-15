import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { opportunityMeta } from "../../../components/MatchCard";
import { ApplyButton } from "../../../components/ApplyButton";
import { OpportunityMatch } from "../../../components/OpportunityMatch";
import { ShortlistButton } from "../../../components/ShortlistButton";
import { VerifySteps } from "../../../components/VerifySteps";
import { countryPhoto } from "../../../components/countryPhotos";
import { PageHero } from "../../../components/PageHero";
import { btnOnFieldOutline, wrap } from "../../../components/ui";
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
  const photo = countryPhoto(opp.country);

  return (
    <>
      <PageHero
        eyebrow={`Ref. ${refCode(opp)}`}
        title={opp.title}
        intro={opportunityMeta(opp)}
        photo={photo?.img}
        photoAlt={photo ? `${photo.city}, ${opp.country}` : ""}
      >
        <div className="flex flex-wrap items-start gap-3">
          <ApplyButton id={opp.id} title={opp.title} />
          <ShortlistButton id={opp.id} title={opp.title} />
          <Link href="/matches" className={btnOnFieldOutline}>
            <ArrowLeft className="size-4" aria-hidden />
            Back to matches
          </Link>
        </div>
      </PageHero>

      <div className={`${wrap} grid grid-cols-1 gap-10 py-12 sm:py-16 lg:grid-cols-12`}>
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
    </>
  );
}
