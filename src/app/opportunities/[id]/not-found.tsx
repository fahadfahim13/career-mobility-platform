import Link from "next/link";

export default function OpportunityNotFound() {
  return (
    <div className="mx-auto max-w-xl rounded-lg border border-line bg-white p-8 text-center">
      <h1 className="text-xl font-semibold text-ink">Opportunity not found</h1>
      <p className="mt-2 text-sm text-slate-600">This opportunity does not exist or is no longer listed.</p>
      <Link href="/opportunities" className="mt-4 inline-block text-sm font-medium text-brand-700 underline">
        Browse all opportunities
      </Link>
    </div>
  );
}
