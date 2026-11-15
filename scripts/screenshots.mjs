// Captures every page at phone, tablet and desktop widths for visual review, and reports any
// page wider than the viewport (horizontal scroll). Usage: node scripts/screenshots.mjs <outDir>
import { chromium } from "@playwright/test";

const out = process.argv[2];
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3456";
const WIDTHS = [[360, "m360"], [390, "m390"], [768, "t768"], [1280, "d1280"]];
const PAGES = [
  ["home", "/"],
  ["profile", "/profile"],
  ["matches", "/matches"],
  ["detail", "/opportunities/german-client-associate-frankfurt"],
  ["opportunities", "/opportunities"],
  ["shortlist", "/shortlist"],
  ["how", "/how-it-works"],
  ["detail2", "/opportunities/programme-assistant-ngo"],
  ["notfound", "/opportunities/does-not-exist"],
  ["signup", "/signup?role=employer"],
  ["signin", "/signin"],
  ["employer", "/employer"],
  ["legal", "/legal"],
  ["404", "/no-such-page"],
];

const b = await chromium.launch();
const overflow = [];
for (const [w, tag] of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, isMobile: w < 768, hasTouch: w < 768 });
  const p = await ctx.newPage();
  // Seed a profile and a shortlist so every page has content.
  await p.goto(`${BASE}/profile`);
  await p.getByRole("button", { name: "Load sample profile" }).click();
  await p.getByRole("button", { name: /Save profile/ }).click();
  await p.waitForURL("**/matches");
  await p.getByRole("button", { name: /Add .* to shortlist/ }).first().click();
  for (const [name, path] of PAGES) {
    await p.goto(`${BASE}${path}`);
    await p.waitForLoadState("load");
    // Scroll through the page so lazy images load before the full-page capture.
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForTimeout(500);
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    if (sw > w) overflow.push(`${tag} ${name}: scrollWidth ${sw} > ${w}`);
    await p.screenshot({ path: `${out}/${tag}-${name}.png`, fullPage: true });
  }
  await ctx.close();
}
await b.close();
console.log(overflow.length ? `HORIZONTAL OVERFLOW:\n${overflow.join("\n")}` : "No horizontal overflow at any width.");
