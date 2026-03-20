import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.test so Playwright tests get ADMIN_ACCESS_PIN, ADMIN_PASSWORD, etc.
try {
    const content = readFileSync(resolve(__dirname, ".env.test"), "utf-8");
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        let value = trimmed.slice(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
    }
} catch { /* .env.test not present */ }

export default defineConfig({
    testDir: "./tests/e2e",
    globalSetup: "./tests/helpers/global-setup",
    timeout: 60_000,
    fullyParallel: false,
    retries: 1,
    use: {
        baseURL: "http://127.0.0.1:3000",
        headless: true,
        screenshot: "only-on-failure",
        video: "retain-on-failure",
        trace: "on-first-retry"
    },
    webServer: {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: true,
        timeout: 120_000
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] }
        }
    ]
});
