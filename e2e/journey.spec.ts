import { expect, test } from "@playwright/test";

test("profile to shortlist journey", async ({ page }) => {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Load sample profile" }).click();
  await page.getByRole("button", { name: "Save profile and view matches" }).click();

  await expect(page).toHaveURL(/\/matches$/);
  const cards = page.getByTestId("match-card");
  await expect(cards).toHaveCount(12);

  // Strong match ranks first.
  const first = cards.first();
  await expect(first).toContainText("Programme Assistant");
  await expect(first).toContainText("Strong match");
  // A top score must still read as conditional while work authorisation is unknown.
  await expect(first.getByTestId("verify-badge")).toHaveText("Eligibility to verify");
  await expect(first).toContainText("Work authorisation not confirmed — needs verification");

  // Language constraint is surfaced as a critical gap.
  const german = cards.filter({ hasText: "German-speaking Client Associate" });
  await expect(german).toContainText("Critical gap");
  await expect(german).toContainText("Requires German at professional level");

  // Detail view: six-row breakdown and a summary.
  await first.getByRole("link", { name: "View details" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Programme Assistant – International NGO");
  await expect(page.getByTestId("breakdown-row")).toHaveCount(6);
  await expect(page.getByTestId("summary")).toContainText("Strong match");
  await expect(page.getByTestId("summary-source")).toHaveText("Summary generated from the scoring rules.");

  // Shortlist persists across navigation and reload.
  await page.getByRole("button", { name: /Add .* to shortlist/ }).click();
  await expect(page.getByRole("button", { name: /Remove .* from shortlist/ })).toBeVisible();
  await page.goto("/shortlist");
  await expect(page.getByTestId("opportunity-row")).toHaveCount(1);
  await page.reload();
  await expect(page.getByTestId("opportunity-row")).toContainText("Programme Assistant");

  // Removing it empties the list.
  await page.getByRole("button", { name: /Remove .* from shortlist/ }).click();
  await expect(page.getByText("Your shortlist is empty")).toBeVisible();
});

test("filtering matches by band", async ({ page }) => {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Load sample profile" }).click();
  await page.getByRole("button", { name: "Save profile and view matches" }).click();
  await page.getByRole("button", { name: /^Critical gap/ }).click();
  await expect(page.getByTestId("match-card")).toHaveCount(3);
});

test("empty profile form shows inline errors and does not save", async ({ page }) => {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Save profile and view matches" }).click();
  // Filter out Next.js's own (empty) route-announcer alert region.
  const summary = page.getByRole("alert").filter({ hasText: "Please correct" });
  await expect(summary).toContainText("Please correct 5 fields");
  await expect(summary).toContainText("Select your highest level of education.");
  await expect(summary).toContainText("Add at least one skill");
  await expect(page).toHaveURL(/\/profile$/);
});

test("matches page without a profile prompts to create one", async ({ page }) => {
  await page.goto("/matches");
  await expect(page.getByRole("heading", { name: "Create a profile to see your matches" })).toBeVisible();
});

test("unknown opportunity shows not-found page", async ({ page }) => {
  const res = await page.goto("/opportunities/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
});

test("summary API rejects invalid input", async ({ request }) => {
  const bad = await request.post("/api/summary", { data: { opportunityId: "x" } });
  expect(bad.status()).toBe(400);
});

test("landing sample button opens ranked matches", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Hire from abroad");
  await page.getByRole("button", { name: "Try with a sample profile" }).first().click();
  await expect(page).toHaveURL(/\/matches$/);
  await expect(page.getByTestId("match-card")).toHaveCount(12);
});

test("filters, steps to verify and application tracking", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try with a sample profile" }).first().click();
  await page.getByLabel("Country").selectOption("Germany");
  await expect(page.getByTestId("match-card")).toHaveCount(4);
  await page.getByLabel("Right to work").selectOption("clear");
  await expect(page.getByText("No roles match these filters.")).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.getByTestId("match-card")).toHaveCount(12);

  await page.getByTestId("match-card").first().getByRole("link", { name: "View details" }).click();
  await expect(page.getByRole("heading", { name: /Steps to verify before applying in Canada/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Government of Canada/ })).toHaveAttribute("href", /canada\.ca/);
  await expect(page.getByRole("heading", { name: "Improve your match" })).toBeVisible();

  await page.getByRole("button", { name: /Add .* to shortlist/ }).click();
  await page.goto("/shortlist");
  await page.getByLabel("Application stage").selectOption("Applied");
  await page.reload();
  await expect(page.getByLabel("Application stage")).toHaveValue("Applied");
});

test("how matching works lists the weights", async ({ page }) => {
  await page.goto("/how-it-works");
  await expect(page.getByRole("heading", { name: "How matching works" })).toBeVisible();
  await expect(page.getByRole("row", { name: /Skills 30/ })).toBeVisible();
});
