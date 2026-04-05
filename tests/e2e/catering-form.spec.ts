import { test, expect } from "@playwright/test";

test("customer can submit catering request", async ({ page }) => {
    await page.goto("/catering");

    // Use placeholder-based selectors to avoid honeypot fields.
    // .first() guards against strict mode errors if the form renders duplicate fields.
    await page.getByPlaceholder(/your name/i).first().fill("Test Customer");
    await page.getByPlaceholder(/phone number/i).first().fill("2035550111");
    await page.getByPlaceholder(/email address/i).first().fill("test@gmail.com");
    await page.locator('input[name="date"]').first().focus();
    await page.locator('input[name="date"]').first().fill("2026-06-20");
    await page.getByPlaceholder(/number of guests/i).first().fill("50");
    await page.getByPlaceholder(/event location/i).first().fill("New Haven, CT");
    await page.getByPlaceholder(/tell us more/i).first().fill("Need catering for office lunch.");

    await page.getByRole("button", { name: /submit quote request/i }).click();

    // After submission the button text changes or a success message appears
    await expect(
        page.getByText(/thank|received|submitted|sending|opening discussion/i).first()
    ).toBeVisible({ timeout: 10000 });
});
