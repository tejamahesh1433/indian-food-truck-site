/**
 * Playwright global setup — runs ONCE before all tests.
 *
 * Logs into the admin panel (PIN + password) and saves the resulting auth
 * cookie to .auth-state.json.  Every adminPage fixture then loads that file
 * instead of logging in fresh, so we only ever hit the rate-limiter once per
 * test run regardless of how many admin tests execute in parallel.
 */
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";

// ── Env loading ────────────────────────────────────────────────────────────
// globalSetup runs in a separate Node process and does NOT inherit the
// .env.test parsing from playwright.config.ts, so we repeat it here.
function loadEnvTest() {
    try {
        const content = readFileSync(resolve(process.cwd(), ".env.test"), "utf-8");
        for (const line of content.split("\n")) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eqIdx = trimmed.indexOf("=");
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            let value = trimmed.slice(eqIdx + 1).trim();
            if (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            ) {
                value = value.slice(1, -1);
            }
            if (!process.env[key]) process.env[key] = value;
        }
    } catch {
        // .env.test not present — rely on existing env vars
    }
}

loadEnvTest();

// ── Constants ──────────────────────────────────────────────────────────────
const ADMIN_PIN = process.env.ADMIN_ACCESS_PIN || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TejaFoodTruck@2026!";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000";
export const AUTH_STATE_PATH = resolve(process.cwd(), "tests/helpers/.auth-state.json");

// ── Setup ──────────────────────────────────────────────────────────────────
export default async function globalSetup() {
    if (!ADMIN_PIN || ADMIN_PIN.length !== 6) {
        console.warn(
            "\n[global-setup] ⚠  ADMIN_ACCESS_PIN not set or not 6 digits — " +
            "admin E2E tests will fail.  Add it to .env.test.\n"
        );
        // Write an empty state file so the fixture can detect this gracefully
        mkdirSync(dirname(AUTH_STATE_PATH), { recursive: true });
        writeFileSync(AUTH_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }));
        return;
    }

    console.log("[global-setup] Performing one-time admin login…");

    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        await page.goto(`${BASE_URL}/truckadmin/login`);

        // ── Step 1: PIN ────────────────────────────────────────────────────
        // Click the first input then keyboard.type so React's auto-advance
        // moves focus correctly and state commits between each character.
        await page.locator('input[inputmode="numeric"]').first().click();
        await page.keyboard.type(ADMIN_PIN, { delay: 150 });

        // Wait for the verify-pin API call to resolve
        await page.waitForTimeout(1000);

        // Fallback: press Enter on the last digit input if auto-submit didn't fire
        const passwordVisible = await page
            .getByPlaceholder(/admin password/i)
            .isVisible()
            .catch(() => false);
        if (!passwordVisible) {
            await page.locator('input[inputmode="numeric"]').nth(5).press("Enter");
        }

        // Wait for the password step
        await page
            .getByPlaceholder(/admin password/i)
            .waitFor({ state: "visible", timeout: 20000 });

        // ── Step 2: Password ───────────────────────────────────────────────
        await page.getByPlaceholder(/admin password/i).fill(ADMIN_PASSWORD);
        await page.getByRole("button", { name: /sign in/i }).click();

        // Wait for redirect to the admin dashboard
        await page.waitForURL(/\/admin(?!.*login)/, { timeout: 15000 });

        // Save the auth cookie so all adminPage fixtures can reuse it
        mkdirSync(dirname(AUTH_STATE_PATH), { recursive: true });
        await page.context().storageState({ path: AUTH_STATE_PATH });

        console.log("[global-setup] ✓ Admin auth state saved to", AUTH_STATE_PATH);
    } catch (err) {
        console.error("[global-setup] ✗ Admin login failed:", err);
        // Write empty state so tests fail clearly rather than hanging
        writeFileSync(AUTH_STATE_PATH, JSON.stringify({ cookies: [], origins: [] }));
    } finally {
        await browser.close();
    }
}
