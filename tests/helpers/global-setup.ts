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
import { resetDatabase, seedBasicData } from "./db";

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
const ADMIN_PIN = process.env.ADMIN_ACCESS_PIN || "229494";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TejaFoodTruck@2026!";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
export const AUTH_STATE_PATH = resolve(process.cwd(), "tests/helpers/.auth-state.json");

// ── Setup ──────────────────────────────────────────────────────────────────
export default async function globalSetup() {
    console.log("[global-setup] Resetting and seeding fresh database for E2E tests...");
    try {
        await resetDatabase();
        await seedBasicData();
    } catch (dbErr) {
        console.error("[global-setup] ✗ Database initialization failed:", dbErr);
    }

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

        // Navigate to /truckadmin/login so the browser context has the correct origin for API calls
        await page.goto(`${BASE_URL}/truckadmin/login`);
        await page.waitForLoadState("domcontentloaded");

        // ── Step 1: Verify PIN via API (runs inside browser context so cookies persist) ──────
        console.log("[global-setup] Step 1: Verifying PIN via API...");
        const pinResult = await page.evaluate(async (pin) => {
            // Clear any existing rate limits first
            await fetch("/api/verify-pin/clear", { method: "POST" }).catch(() => {});

            const res = await fetch("/api/verify-pin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pin }),
            });
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, data };
        }, ADMIN_PIN);

        if (!pinResult.ok) {
            throw new Error(
                `PIN verification failed (HTTP ${pinResult.status}): ` +
                JSON.stringify(pinResult.data)
            );
        }
        console.log("[global-setup] ✓ PIN verified");

        // ── Step 2: Admin login via API (pin cookie is now set in browser context) ────────────
        console.log("[global-setup] Step 2: Logging in via password API...");
        const loginResult = await page.evaluate(async (password) => {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // Include Origin header to satisfy CSRF guard
                    "Origin": window.location.origin,
                },
                body: JSON.stringify({ password }),
            });
            const data = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, data };
        }, ADMIN_PASSWORD);

        if (!loginResult.ok) {
            throw new Error(
                `Admin login failed (HTTP ${loginResult.status}): ` +
                JSON.stringify(loginResult.data)
            );
        }
        console.log("[global-setup] ✓ Admin password accepted");

        // ── Step 3: Navigate to /admin to confirm the cookie works ────────────────────────────
        await page.goto(`${BASE_URL}/admin`);
        await page.waitForLoadState("domcontentloaded");

        // If redirected back to login, something went wrong with the cookie
        if (/login|truckadmin/.test(page.url())) {
            throw new Error(
                `Admin cookie not accepted — redirected to ${page.url()} after login.`
            );
        }

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
