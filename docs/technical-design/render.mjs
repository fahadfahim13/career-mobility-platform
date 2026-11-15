// Renders technical-design.html to docs/TECHNICAL_DESIGN.pdf and PNG previews of each page.
// Usage: python docs/technical-design/build.py && node docs/technical-design/render.mjs [previewDir]
import { chromium } from "@playwright/test";
import { fileURLToPath, pathToFileURL } from "node:url";

const html = fileURLToPath(new URL("./technical-design.html", import.meta.url));
const pdf = fileURLToPath(new URL("../TECHNICAL_DESIGN.pdf", import.meta.url));
const previews = process.argv[2];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1123, height: 794 } });
await page.goto(pathToFileURL(html).href, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: pdf, format: "A4", landscape: true, printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
if (previews) {
  const n = await page.locator(".page").count();
  for (let i = 0; i < n; i++) await page.locator(".page").nth(i).screenshot({ path: `${previews}/page-${i}.png` });
}
await browser.close();
console.log("wrote", pdf);
