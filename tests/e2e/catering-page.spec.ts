import { test, expect } from "@playwright/test";

test("catering page loads main sections", async ({ page }) => {
    await page.goto("/catering");

    // The main heading is an h1 with "Catering"
    await expect(page.getByRole("heading", { name: /catering/i }).first()).toBeVisible();

    // The quote request form section heading
    await expect(page.getByText(/request a quote/i).first()).toBeVisible();
});

test("catering page has the quote request form", async ({ page }) => {
    await page.goto("/catering");

    // Name and phone fields should be present in the quote form
    await expect(page.getByPlaceholder(/your name/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByPlaceholder(/phone number/i).first()).toBeVisible();
});
