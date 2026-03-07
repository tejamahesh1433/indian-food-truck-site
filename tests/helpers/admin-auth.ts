import { test as base, expect } from "@playwright/test";

// Admin password from .env.test
const ADMIN_PASSWORD = "TejaFoodTruck@2026!";

export const test = base.extend({
    adminPage: async ({ page }, use) => {
        await page.goto("/admin/login");
        await page.getByPlaceholder(/admin password/i).fill(ADMIN_PASSWORD);
        await page.getByRole("button", { name: /sign in/i }).click();
        // Wait for redirect to dashboard
        await expect(page).toHaveURL(/\/admin/);
        await use(page);
    },
});

export { expect };
