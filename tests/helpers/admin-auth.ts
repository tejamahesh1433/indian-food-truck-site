/**
 * Playwright fixture that provides a pre-authenticated admin page.
 *
 * Authentication is handled ONCE in global-setup.ts (before all tests run).
 * That script logs in via the PIN + password flow and saves the resulting
 * auth cookie to .auth-state.json.  Every adminPage fixture here simply
 * creates a new browser context loaded with that saved cookie — no live
 * login UI interaction, no rate-limiter hits, no concurrent interference.
 */
import { test as base, expect, type Page } from "@playwright/test";
import { existsSync } from "fs";
import { AUTH_STATE_PATH } from "./global-setup";

type AdminFixtures = {
    adminPage: Page;
};

export const test = base.extend<AdminFixtures>({
    adminPage: async ({ browser }, use) => {
        if (!existsSync(AUTH_STATE_PATH)) {
            throw new Error(
                "Admin auth state file not found at " + AUTH_STATE_PATH + ". " +
                "Make sure globalSetup ran successfully (check playwright.config.ts)."
            );
        }

        // Create a fresh browser context pre-loaded with the saved auth cookie.
        // This is equivalent to being logged in without any API calls.
        const context = await browser.newContext({
            baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000",
            storageState: AUTH_STATE_PATH,
        });

        const page = await context.newPage();

        // Navigate to admin to confirm the cookie is valid
        await page.goto("/admin");
        await page.waitForLoadState("domcontentloaded");

        // If we ended up on the login page the cookie expired — helpful error
        if (/login|truckadmin/.test(page.url())) {
            await context.close();
            throw new Error(
                "Admin auth cookie is invalid or expired. " +
                "Delete tests/helpers/.auth-state.json and re-run the tests to re-authenticate."
            );
        }

        // eslint-disable-next-line react-hooks/rules-of-hooks
        await use(page);
        await context.close();
    },
});

export { expect };
