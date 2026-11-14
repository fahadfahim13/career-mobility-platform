import type { Profile } from "../lib/types";

/** The fictional candidate from the assessment brief, section 04. Work authorisation is left unknown. */
export const sampleProfile: Profile = {
  educationLevel: "bachelor",
  educationField: "Business Administration",
  yearsExperience: 2,
  experienceSummary: "2 years in business operations and project support",
  skills: ["Excel", "Research", "Stakeholder communication", "Reporting", "Project coordination"],
  languages: [
    { name: "Bengali", level: "native" },
    { name: "English", level: "professional" },
  ],
  preferredCountries: ["Germany", "Canada", "Singapore"],
  interests: ["Programme support", "Business operations", "Project coordination"],
  enrolledStudent: false,
  workAuthorisation: {},
};
