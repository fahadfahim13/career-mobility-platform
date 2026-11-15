import { expect, test } from "@playwright/test";

const ROLE = "/opportunities/operations-coordinator-singapore"; // Harbourline Logistics, the demo hirer's organisation

test("candidate applies and the hirer sees the applicant with a match score", async ({ page }, info) => {
  // Candidate side: a fresh account (parallel runs must not share one) with the sample profile.
  const name = `Applicant ${info.project.name} ${Date.now()}`;
  await page.goto("/signup");
  await page.getByLabel("Full name").fill(name);
  await page.getByLabel("Email").fill(`${Date.now()}.${info.project.name}@example.com`);
  await page.getByLabel("Password").fill("applying-2026");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.getByRole("button", { name: "Load sample profile" }).click();
  await page.getByRole("button", { name: "Save profile and view matches" }).click();
  await expect(page).toHaveURL(/\/matches$/);

  await page.goto(ROLE);
  await page.getByRole("button", { name: /Apply for Operations Coordinator/ }).click();
  await expect(page.getByText(/^Applied on/)).toBeVisible();

  // The shortlist tracks the application.
  await page.goto("/shortlist");
  await expect(page.getByText("Operations Coordinator").first()).toBeVisible();

  await page.getByRole("banner").getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("banner").getByRole("link", { name: "Sign in" })).toBeVisible();

  // Employer side: the demo hirer belongs to Harbourline Logistics.
  await page.goto("/signin");
  await page.getByRole("button", { name: /Sign in as hirer/ }).click();
  await expect(page).toHaveURL(/\/employer$/);
  const row = page.getByTestId("applicant-row").filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText("@example.com");
  await expect(row).toContainText(/Strong match|Partial match|Weak match|Critical gap/);

  await row.getByText("Profile and score").click();
  await expect(row.getByText("Right to work in Singapore")).toBeVisible();
});

test("guests are asked to sign in before applying", async ({ page }) => {
  await page.goto(ROLE);
  await expect(page.getByRole("link", { name: "Sign in to apply" })).toBeVisible();
});

test("an employer of another organisation does not see these applicants", async ({ page }, info) => {
  await page.goto("/signup?role=employer");
  await page.getByLabel("Full name").fill("Other Hirer");
  await page.getByLabel("Organisation").selectOption("Open Policy Lab");
  await page.getByLabel("Work email").fill(`other.${info.project.name}.${Date.now()}@openpolicy.example`);
  await page.getByLabel("Password").fill("hiring-2026");
  await page.getByRole("button", { name: "Create employer account" }).click();
  await expect(page.getByText(/Applicants for Research assistant/i)).toBeVisible();
  await expect(page.getByTestId("applicant-row").filter({ hasText: "Applicant " })).toHaveCount(0);
});
