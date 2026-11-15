// Builds the fictional test resume used by the e2e upload test and the live extraction check.
// Usage: node e2e/fixtures/make-resume.mjs
import { chromium } from "@playwright/test";
import { fileURLToPath } from "node:url";

const out = fileURLToPath(new URL("./sample-resume.pdf", import.meta.url));
const html = `<!doctype html><html><body style="font-family:Arial;margin:40px;font-size:12px">
<h1 style="margin:0">Priya Raman</h1><p>Chennai, India · priya.raman@example.com</p>
<h2>Summary</h2><p>Supply chain analyst with five years in retail logistics. Builds demand forecasts and inventory reports.</p>
<h2>Experience</h2>
<p><b>Supply Chain Analyst</b>, Coastline Retail (fictional), Chennai — Jan 2022 to present<br>
Weekly demand forecasts in Excel and SQL; inventory dashboards in Power BI; cut stock-outs by 12%.</p>
<p><b>Logistics Coordinator</b>, Harbour Freight Services (fictional), Chennai — Jan 2019 to Dec 2021<br>
Coordinated shipments and supplier communication; process improvement for warehouse picking.</p>
<h2>Education</h2><p>MBA, Operations Management — Anna University, 2018<br>BCom — University of Madras, 2016</p>
<h2>Skills</h2><p>Excel, SQL, Power BI, Demand forecasting, Inventory management, Stakeholder communication, Process improvement</p>
<h2>Languages</h2><p>Tamil (native), English (professional), German (basic, A2)</p>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html);
await page.pdf({ path: out, format: "A4" });
await browser.close();
console.log("wrote", out);
