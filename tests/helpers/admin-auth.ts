import { test as base, expect, type Page } from "@playwright/test";

// Admin password from .env.test (or fallback for Dev)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "TejaFoodTruck@2026!";

type AdminFixtures = {
    adminPage: Page;
};

export const test = base.extend<AdminFixtures>({
    adminPage: async ({ page }, use) => {
        await page.goto("/admin/login");
        await page.getByPlaceholder(/admin password/i).fill(ADMIN_PASSWORD);
        await page.getByRole("button", { name: /sign in/i }).click();

        // Wait for redirect to dashboard to confirm login worked
        await expect(page).toHaveURL(/\/admin/);

        await use(page);
    },
});

export { expect };
