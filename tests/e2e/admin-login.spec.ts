import { test, expect } from "@playwright/test";

test("admin login page loads PIN step", async ({ page }) => {
    await page.goto("/truckadmin/login");

    // The page always starts on the PIN step ("Restricted Area")
    await expect(page.getByRole("heading", { name: /restricted area/i })).toBeVisible();
    await expect(page.locator('input[inputmode="numeric"]').first()).toBeVisible();
});

test("admin login redirects unauthenticated visits to /admin", async ({ page }) => {
    await page.goto("/admin");

    // Should redirect to the truckadmin login page
    await page.waitForURL(/\/truckadmin\/login/, { timeout: 5000 });
    await expect(page).toHaveURL(/\/truckadmin\/login/);
});
