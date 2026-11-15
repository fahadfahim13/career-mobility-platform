import Link from "next/link";
import { OpportunityRow } from "../../components/OpportunityRow";
import { HeroStats, PageHero } from "../../components/PageHero";
import { countryPhoto } from "../../components/countryPhotos";
import { textLink, wrap } from "../../components/ui";
import london from "../../../public/images/london.webp";
import { getOpportunities } from "../../lib/data";

export const metadata = { title: "All roles — Pathway" };

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ country?: string }> }) {
  const all = getOpportunities();
  const { country } = await searchParams;
  const selected = country && all.some((o) => o.country === country) ? country : undefined;
  const opps = selected ? all.filter((o) => o.country === selected) : all;
  const countries = new Set(opps.map((o) => o.country)).size;
  const visa = opps.filter((o) => o.visaSupport === "offered").length;
  return (
    <>
      <PageHero
        eyebrow="Browse"
        title={selected ? `Roles in ${selected}` : "All roles"}
        intro={
          <>
            Salary, visa support and relocation facts for every role. For a ranking against your background, see{" "}
            <Link href="/matches" className="font-semibold text-on-field underline hover:no-underline">your matches</Link>.
          </>
        }
        photo={selected ? (countryPhoto(selected)?.img ?? london) : london}
        photoAlt={selected ? `${countryPhoto(selected)?.city ?? "London"} skyline` : "London skyline"}
      >
        <HeroStats items={[{ value: opps.length, label: "Roles" }, { value: countries, label: "Countries" }, { value: visa, label: "Visa support" }]} />
      </PageHero>
      <div className={`${wrap} py-12 sm:py-16`}>
        {selected && (
          <p className="mb-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold">Showing {opps.length} of {all.length} roles</span>
            <Link href="/opportunities" className={textLink}>Show all countries</Link>
          </p>
        )}
        <ul className="border-b-2 border-ink">
          {opps.map((o) => <OpportunityRow key={o.id} opp={o} />)}
        </ul>
      </div>
    </>
  );
}
