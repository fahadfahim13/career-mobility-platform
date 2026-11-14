import { z } from "zod";

export const EDUCATION_LEVELS = ["none", "secondary", "diploma", "bachelor", "master", "phd"] as const;
export const LANGUAGE_LEVELS = ["basic", "conversational", "professional", "native"] as const;
export const WORK_AUTH = ["yes", "no", "unknown"] as const;

export const educationLevelSchema = z.enum(EDUCATION_LEVELS);
export const languageLevelSchema = z.enum(LANGUAGE_LEVELS);
export const workAuthSchema = z.enum(WORK_AUTH);

const trimmed = z.string().trim();

export const languageSchema = z.object({
  name: trimmed.min(1, "Language name is required").max(40),
  level: languageLevelSchema,
});

/**
 * Shape of a candidate profile. Nullable fields mean "not provided"; the matching engine treats
 * them as unknown rather than satisfied.
 */
export const profileSchema = z.object({
  educationLevel: educationLevelSchema.nullable(),
  educationField: trimmed.max(100),
  yearsExperience: z.number().min(0, "Cannot be negative").max(50, "Must be 50 or less").nullable(),
  experienceSummary: trimmed.max(500),
  skills: z.array(trimmed.min(1).max(60)).max(40),
  languages: z.array(languageSchema).max(10),
  preferredCountries: z.array(trimmed.min(1).max(60)).max(15),
  interests: z.array(trimmed.min(1).max(60)).max(15),
  enrolledStudent: z.boolean().nullable(),
  workAuthorisation: z.record(z.string(), workAuthSchema),
});

/** Stricter rules applied when the user submits the form (storage accepts partial profiles). */
export const profileFormSchema = profileSchema.extend({
  educationLevel: educationLevelSchema,
  yearsExperience: z.number().min(0, "Cannot be negative").max(50, "Must be 50 or less"),
  skills: profileSchema.shape.skills.min(1, "Add at least one skill"),
  languages: profileSchema.shape.languages.min(1, "Add at least one language"),
  preferredCountries: profileSchema.shape.preferredCountries.min(1, "Add at least one preferred country"),
});

export const opportunitySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  organisation: z.string().min(1),
  country: z.string().min(1),
  city: z.string().min(1),
  remote: z.boolean(),
  type: z.enum(["job", "internship"]),
  category: z.string().min(1),
  tags: z.array(z.string()),
  description: z.string().min(1),
  requiredSkills: z.array(z.string()).min(1),
  niceToHaveSkills: z.array(z.string()),
  minYears: z.number().min(0),
  maxYears: z.number().min(0).nullable(),
  education: z
    .object({ minLevel: educationLevelSchema, relevantFields: z.array(z.string()) })
    .nullable(),
  languages: z.array(languageSchema),
  enrolledStudentRequired: z.boolean(),
  localWorkAuthRequired: z.boolean(),
});

export const opportunitiesSchema = z.array(opportunitySchema).min(1);
