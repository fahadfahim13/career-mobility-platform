import { normalizeCountry } from "../lib/matching/normalize";

export interface CountryGuide {
  country: string;
  /** True when no country-specific guide exists and general steps are shown. */
  generic: boolean;
  steps: string[];
  sources: { label: string; url: string }[];
}

/**
 * Steps to verify before applying. They are written as questions to check with the official authority,
 * never as a statement of whether the user can work in the country.
 */
const GUIDES: Record<string, Omit<CountryGuide, "country" | "generic">> = {
  canada: {
    steps: [
      "Check whether you need a work permit, and which type, using the official Government of Canada guidance.",
      "Ask the employer whether the role needs a Labour Market Impact Assessment (LMIA) or is LMIA-exempt.",
      "Confirm whether your education needs an Educational Credential Assessment (ECA) for the route you choose.",
      "Check the language test requirements for your route.",
    ],
    sources: [{ label: "Government of Canada — Work in Canada", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html" }],
  },
  germany: {
    steps: [
      "Run the official Make it in Germany Quick-Check to see which visa routes may apply to you.",
      "Check whether your degree is recognised in Germany, or start the recognition process.",
      "Confirm the salary threshold for the EU Blue Card or skilled-worker route with the official source.",
      "Confirm the German language level the employer expects for daily work.",
    ],
    sources: [
      { label: "Make it in Germany — Quick-Check", url: "https://www.make-it-in-germany.com/en/visa-residence/quick-check" },
      { label: "Recognition in Germany", url: "https://www.anerkennung-in-deutschland.de/en/" },
    ],
  },
  netherlands: {
    steps: [
      "Check the residence permit options for work on the official IND website.",
      "Ask whether the employer is a recognised sponsor with the IND (needed for the highly skilled migrant route).",
      "Confirm the salary criterion that applies to your age and route.",
    ],
    sources: [{ label: "IND — Work in the Netherlands", url: "https://ind.nl/en/work" }],
  },
  "united kingdom": {
    steps: [
      "Use the official GOV.UK checker to see whether you need a visa to work in the UK.",
      "Ask whether the employer holds a sponsor licence for the Skilled Worker route.",
      "Confirm the salary and English language requirements for the route.",
    ],
    sources: [{ label: "GOV.UK — Check if you need a UK visa", url: "https://www.gov.uk/check-uk-visa" }],
  },
  singapore: {
    steps: [
      "Review the work pass types on the Ministry of Manpower website.",
      "Ask the employer which pass they would apply for on your behalf (employers apply for most passes).",
      "Check the qualifying salary and assessment criteria for that pass.",
    ],
    sources: [{ label: "Ministry of Manpower — Work passes", url: "https://www.mom.gov.sg/passes-and-permits" }],
  },
  "united arab emirates": {
    steps: [
      "Review the official UAE guidance on work visas and Emirates ID.",
      "Confirm with the employer that they will sponsor your work permit and residence visa.",
      "Check whether your degree certificate must be attested before you travel.",
    ],
    sources: [{ label: "UAE Government — Visa and Emirates ID", url: "https://u.ae/en/information-and-services/visa-and-emirates-id" }],
  },
};

const GENERIC: Omit<CountryGuide, "country" | "generic"> = {
  steps: [
    "Check the official immigration authority of the country for work permit requirements.",
    "Ask the employer whether they sponsor work permits for this role.",
    "Confirm whether your qualifications need formal recognition.",
  ],
  sources: [],
};

export function getCountryGuide(country: string): CountryGuide {
  const guide = GUIDES[normalizeCountry(country)];
  return { country, generic: !guide, ...(guide ?? GENERIC) };
}
