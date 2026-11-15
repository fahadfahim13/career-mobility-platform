import { expect, test } from "@playwright/test";

test("unknown route shows the branded 404 with a way back", async ({ page }) => {
  const res = await page.goto("/no-such-page");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Page not found");
  await page.getByRole("link", { name: "Back to home" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("footer links to privacy and terms", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Terms" }).click();
  await expect(page.getByRole("heading", { name: "Terms", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Privacy", exact: true })).toBeVisible();
});

test("share image and icon are served", async ({ page, request }) => {
  await page.goto("/");
  const og = await page.locator('meta[property="og:image"]').getAttribute("content");
  expect(og).toBeTruthy();
  const img = await request.get(new URL(og!).pathname);
  expect(img.status()).toBe(200);
  expect(img.headers()["content-type"]).toContain("image/png");
  const icon = await page.locator('link[rel="icon"]').first().getAttribute("href");
  expect((await request.get(icon!)).status()).toBe(200);
});

test("landing shows photos and diagrams", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: /Score weights/ })).toBeVisible();
  await expect(page.getByRole("figure", { name: "How right to work is decided" })).toBeVisible();
  await expect(page.getByRole("img", { name: "Frankfurt skyline" })).toBeVisible();
});
