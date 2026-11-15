import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const RESUME = path.resolve("e2e/fixtures/sample-resume.pdf");

// The AI call is mocked here so the suite is free and deterministic. A live check runs separately.
const FIELDS = {
  educationLevel: "master",
  educationField: "Operations Management",
  yearsExperience: 7.9,
  experienceSummary: "Supply chain analyst in retail logistics. Builds demand forecasts and inventory reports.",
  skills: ["Excel", "SQL", "Power BI", "Inventory management"],
  languages: [{ name: "Tamil", level: "native" }, { name: "English", level: "professional" }],
  interests: ["Logistics"],
  enrolledStudent: false,
};

async function mockResumeApi(page: Page, response: { status: number; body: unknown }) {
  await page.route("**/api/resume", (route) =>
    route.fulfill({ status: response.status, contentType: "application/json", body: JSON.stringify(response.body) }),
  );
}

test("profile: uploading a resume fills the form for review", async ({ page }) => {
  await mockResumeApi(page, { status: 200, body: { fields: FIELDS, stored: true } });
  await page.goto("/profile");
  await page.getByLabel("Upload resume (PDF)").setInputFiles(RESUME);

  await expect(page.getByText(/Filled 8 fields from sample-resume\.pdf/)).toBeVisible();
  await expect(page.getByLabel("Highest level of education")).toHaveValue("master");
  await expect(page.getByLabel("Years of professional experience")).toHaveValue("7.9");
  await expect(page.getByRole("button", { name: /Remove Power BI/i })).toBeVisible();
});

test("profile: a failed read shows a plain message and leaves the form alone", async ({ page }) => {
  await mockResumeApi(page, { status: 502, body: { error: "We could not read this resume. Please fill in the form by hand." } });
  await page.goto("/profile");
  await page.getByLabel("Upload resume (PDF)").setInputFiles(RESUME);
  await expect(page.getByText("We could not read this resume. Please fill in the form by hand.")).toBeVisible();
  await expect(page.getByLabel("Highest level of education")).toHaveValue("");
});

test("profile: a non-PDF file is refused in the browser", async ({ page }) => {
  let called = false;
  await page.route("**/api/resume", (route) => {
    called = true;
    return route.abort();
  });
  await page.goto("/profile");
  await page.getByLabel("Upload resume (PDF)").setInputFiles({ name: "cv.docx", mimeType: "application/msword", buffer: Buffer.from("PK") });
  await expect(page.getByText(/not a PDF/)).toBeVisible();
  expect(called).toBe(false);
});

test("candidate sign-up with a resume opens a pre-filled profile", async ({ page }) => {
  await mockResumeApi(page, { status: 200, body: { fields: FIELDS, stored: true } });
  await page.goto("/signup");
  await page.getByLabel("Full name").fill("Priya Raman");
  await page.getByLabel("Email").fill("priya@example.com");
  await page.getByLabel("Password").fill("resume-2026");
  await page.getByLabel("Upload resume (PDF)").setInputFiles(RESUME);
  await expect(page.getByText(/Filled 8 fields/)).toBeVisible();
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByLabel("Highest level of education")).toHaveValue("master");
  await expect(page.getByLabel("Years of professional experience")).toHaveValue("7.9");
});
