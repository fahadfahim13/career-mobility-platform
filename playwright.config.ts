import { defineConfig, devices } from "@playwright/test";

const PORT = 3456;
// Point BASE_URL at a deployed URL to run the same journey against production.
const BASE_URL = process.env.BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  reporter: [["list"]],
  use: { baseURL: BASE_URL, trace: "retain-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: `npm run build && npx next start -H 127.0.0.1 -p ${PORT}`,
        url: BASE_URL,
        timeout: 180_000,
        reuseExistingServer: false,
        // Mock mode: no API key, so summaries are deterministic.
        env: { ANTHROPIC_API_KEY: "" },
      },
});
