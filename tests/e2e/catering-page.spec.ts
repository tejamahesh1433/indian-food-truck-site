import { test, expect } from "@playwright/test";

test("catering page loads main sections", async ({ page }) => {
    await page.goto("/catering");

    // Use h2 for the title as we changed it for SEO
    await expect(page.locator("h2").getByText(/the catering menu/i)).toBeVisible();
    await expect(page.getByText(/request a quote/i)).toBeVisible();
    await expect(page.getByText(/packages/i).first()).toBeVisible();
    await expect(page.getByText(/curries/i).first()).toBeVisible();
});
