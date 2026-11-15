import { expect, test } from "@playwright/test";

test("employer signs up and sees candidates ranked by fit", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "I’m hiring" }).first().click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await page.getByLabel("Full name").fill("Lena Vogel");
  await page.getByLabel("Organisation").fill("Northwind Logistics");
  await page.getByLabel("Work email").fill("lena@northwind.example");
  await page.getByLabel("Password").fill("hiring-2026");
  await page.getByRole("button", { name: "Create employer account" }).click();

  await expect(page.getByRole("heading", { name: "Candidates", level: 1 })).toBeVisible();
  const rows = page.getByTestId("candidate-row");
  await expect(rows).toHaveCount(8);
  await page.getByLabel("Open role").selectOption("operations-coordinator-singapore");
  await expect(rows.first()).toContainText("Amira Haddad");
  await expect(rows.first()).toContainText("Strong match");

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("banner").getByRole("link", { name: "Sign in" })).toBeVisible();
});

test("sign-in rejects a wrong password and the demo candidate lands on matches", async ({ page }) => {
  await page.goto("/signin");
  await page.getByLabel("Email").fill("nobody@example.com");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "incorrect" })).toHaveText("Email or password is incorrect.");

  await page.getByRole("button", { name: /Sign in as candidate/ }).click();
  await expect(page).toHaveURL(/\/matches$/);
  await expect(page.getByTestId("match-card")).toHaveCount(12);
  await expect(page.getByRole("link", { name: "Your profile" })).toBeVisible();
});

test("one-click hirer sign-in opens the candidates page", async ({ page }) => {
  await page.goto("/signin");
  await page.getByRole("button", { name: /Sign in as hirer/ }).click();
  await expect(page).toHaveURL(/\/employer$/);
  await expect(page.getByRole("heading", { name: "Candidates", level: 1 })).toBeVisible();
  await expect(page.getByTestId("candidate-row").first()).toBeVisible();
});

test("employer page asks guests to sign in", async ({ page }) => {
  await page.goto("/employer");
  await expect(page.getByRole("heading", { name: "Find qualified international candidates" })).toBeVisible();
});
