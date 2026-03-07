import { test, expect } from "@playwright/test";

test("customer can submit catering request", async ({ page }) => {
    await page.goto("/catering");

    await page.locator('input[type="text"]').first().fill("Test Customer");
    await page.locator('input[type="tel"]').fill("+1 203-555-0111");
    await page.locator('input[type="email"]').fill("test@example.com");
    await page.locator('input[type="date"]').fill("2026-03-20");

    const textInputs = page.locator('input[type="text"]');
    await textInputs.nth(1).fill("50");
    await textInputs.nth(2).fill("New Haven");

    await page.locator("textarea").fill("Need catering for office lunch.");
    await page.getByRole("button", { name: /submit quote request/i }).click();

    await expect(page.getByText(/thank|received|submitted|quote/i)).toBeVisible();
});
