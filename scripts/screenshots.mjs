import { chromium } from "@playwright/test";
const out = process.argv[2];
const BASE = process.env.BASE_URL ?? "http://127.0.0.1:3456";
const b = await chromium.launch();
for (const [w, tag] of [[1280, "d"], [390, "m"]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto(`${BASE}/profile`);
  await p.getByRole("button", { name: "Load sample profile" }).click();
  await p.screenshot({ path: `${out}/${tag}-profile.png`, fullPage: true });
  await p.getByRole("button", { name: /Save profile/ }).click();
  await p.waitForURL("**/matches");
  await p.screenshot({ path: `${out}/${tag}-matches.png`, fullPage: false });
  await p.goto(`${BASE}/opportunities/german-client-associate-frankfurt`);
  await p.waitForSelector("[data-testid=breakdown-row]");
  await p.screenshot({ path: `${out}/${tag}-detail.png`, fullPage: true });
}
await b.close();

