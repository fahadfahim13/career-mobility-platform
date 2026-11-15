import type { Profile } from "../lib/types";

/** Fictional candidate pool for the employer view. No real people. */
export interface Candidate {
  id: string;
  name: string;
  headline: string;
  basedIn: string;
  profile: Profile;
}

const english = { name: "English", level: "professional" as const };

export const candidates: Candidate[] = [
  {
    id: "c-amira",
    name: "Amira Haddad",
    headline: "Operations coordinator, 3 years in logistics",
    basedIn: "Amman, Jordan",
    profile: {
      educationLevel: "bachelor",
      educationField: "Supply chain management",
      yearsExperience: 3,
      experienceSummary: "Warehouse and inventory coordination for a regional distributor",
      skills: ["Excel", "Reporting", "Inventory management", "Process improvement", "Stakeholder communication", "SAP"],
      languages: [{ name: "Arabic", level: "native" }, english],
      preferredCountries: ["Singapore", "United Arab Emirates", "Germany"],
      interests: ["Business operations", "Logistics", "Supply chain"],
      enrolledStudent: false,
      workAuthorisation: { Singapore: "unknown", "United Arab Emirates": "yes", Germany: "unknown" },
    },
  },
  {
    id: "c-rahul",
    name: "Rahul Menon",
    headline: "Data analyst, SQL and Python",
    basedIn: "Bengaluru, India",
    profile: {
      educationLevel: "master",
      educationField: "Statistics",
      yearsExperience: 2,
      experienceSummary: "Dashboards and ad-hoc analysis for an e-commerce team",
      skills: ["SQL", "Python", "Excel", "Data visualisation", "Reporting", "Data analysis"],
      languages: [{ name: "Hindi", level: "native" }, english],
      preferredCountries: ["Netherlands", "Singapore", "Canada"],
      interests: ["Data analysis", "Business operations"],
      enrolledStudent: false,
      workAuthorisation: { Netherlands: "unknown", Singapore: "yes", Canada: "unknown" },
    },
  },
  {
    id: "c-sofia",
    name: "Sofia Almeida",
    headline: "Project coordinator, public infrastructure",
    basedIn: "Lisbon, Portugal",
    profile: {
      educationLevel: "bachelor",
      educationField: "Business Administration",
      yearsExperience: 4,
      experienceSummary: "Scheduling and reporting on transport projects",
      skills: ["Project coordination", "Scheduling", "MS Project", "Reporting", "Stakeholder communication", "Excel"],
      languages: [{ name: "Portuguese", level: "native" }, english, { name: "German", level: "conversational" }],
      preferredCountries: ["Germany", "Canada", "Netherlands"],
      interests: ["Project coordination", "Infrastructure", "Public sector"],
      enrolledStudent: false,
      workAuthorisation: { Germany: "yes", Netherlands: "yes", Canada: "unknown" },
    },
  },
  {
    id: "c-kwame",
    name: "Kwame Mensah",
    headline: "Programme officer, grants and M&E",
    basedIn: "Accra, Ghana",
    profile: {
      educationLevel: "master",
      educationField: "Development studies",
      yearsExperience: 5,
      experienceSummary: "Grant reporting and monitoring for NGO health programmes",
      skills: ["Programme management", "Grant reporting", "Monitoring and evaluation", "Stakeholder communication", "Reporting"],
      languages: [english, { name: "French", level: "conversational" }],
      preferredCountries: ["Germany", "Canada", "United Kingdom"],
      interests: ["Programme support", "Monitoring and evaluation", "Grants"],
      enrolledStudent: false,
      workAuthorisation: { Germany: "unknown", Canada: "unknown", "United Kingdom": "no" },
    },
  },
  {
    id: "c-mei",
    name: "Mei Lin Tan",
    headline: "Operations analyst, process improvement",
    basedIn: "Kuala Lumpur, Malaysia",
    profile: {
      educationLevel: "bachelor",
      educationField: "Business",
      yearsExperience: 2,
      experienceSummary: "Process mapping and reporting for a shared-services centre",
      skills: ["Excel", "Reporting", "Process improvement", "Stakeholder communication"],
      languages: [{ name: "Mandarin", level: "native" }, { name: "Malay", level: "professional" }, english],
      preferredCountries: ["Singapore", "Canada"],
      interests: ["Business operations", "Process improvement"],
      enrolledStudent: false,
      workAuthorisation: { Singapore: "no", Canada: "unknown" },
    },
  },
  {
    id: "c-jonas",
    name: "Jonas Becker",
    headline: "Software engineer, TypeScript and React",
    basedIn: "Hamburg, Germany",
    profile: {
      educationLevel: "bachelor",
      educationField: "Computer science",
      yearsExperience: 5,
      experienceSummary: "Full-stack web development for SaaS products",
      skills: ["TypeScript", "React", "Node.js", "System design", "SQL"],
      languages: [{ name: "German", level: "native" }, english],
      preferredCountries: ["United Kingdom", "Netherlands"],
      interests: ["Engineering", "Web"],
      enrolledStudent: false,
      workAuthorisation: { "United Kingdom": "unknown", Netherlands: "yes" },
    },
  },
  {
    id: "c-fatima",
    name: "Fatima Zahra Idrissi",
    headline: "B2B sales executive, CRM and lead generation",
    basedIn: "Casablanca, Morocco",
    profile: {
      educationLevel: "bachelor",
      educationField: "Marketing",
      yearsExperience: 3,
      experienceSummary: "Account growth for a software reseller",
      skills: ["B2B sales", "Negotiation", "CRM software", "Lead generation", "Stakeholder communication"],
      languages: [{ name: "Arabic", level: "native" }, { name: "French", level: "professional" }, english],
      preferredCountries: ["United Arab Emirates", "Canada"],
      interests: ["Sales", "B2B"],
      enrolledStudent: false,
      workAuthorisation: { "United Arab Emirates": "unknown", Canada: "unknown" },
    },
  },
  {
    id: "c-daniel",
    name: "Daniel Okafor",
    headline: "Graduate, business and research",
    basedIn: "Lagos, Nigeria",
    profile: {
      educationLevel: "bachelor",
      educationField: "Economics",
      yearsExperience: 1,
      experienceSummary: "Research internship and part-time reporting role",
      skills: ["Research", "Excel", "Report writing", "Data analysis"],
      languages: [english],
      preferredCountries: ["United Kingdom", "Canada", "Singapore"],
      interests: ["Research", "Policy", "Business operations"],
      enrolledStudent: false,
      workAuthorisation: { "United Kingdom": "unknown", Canada: "unknown", Singapore: "unknown" },
    },
  },
];

export function getCandidate(id: string): Candidate | undefined {
  return candidates.find((c) => c.id === id);
}
