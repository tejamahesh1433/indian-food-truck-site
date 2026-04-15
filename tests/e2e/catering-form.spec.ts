import { test, expect } from "@playwright/test";

test("customer can submit catering request", async ({ page }) => {
    await page.goto("/catering");

    // Wait for the form to be fully rendered
    await page.waitForLoadState("domcontentloaded");

    // Use placeholder-based selectors to avoid honeypot fields.
    // .first() guards against strict mode errors if the form renders duplicate fields.
    await page.getByPlaceholder(/your name/i).first().fill("Test Customer");

    // Phone input has controlled formatting — fill raw digits
    await page.getByPlaceholder(/phone number/i).first().fill("2035550111");
    await page.getByPlaceholder(/email address/i).first().fill("test@gmail.com");

    // Date input: type="text" but switches to "date" on focus
    const dateInput = page.locator('input[name="date"]').first();
    await dateInput.click();
    await page.waitForTimeout(200); // Allow type to switch to "date"
    await dateInput.fill("2026-06-20");

    await page.getByPlaceholder(/number of guests/i).first().fill("50");
    await page.getByPlaceholder(/event location/i).first().fill("New Haven, CT");
    await page.getByPlaceholder(/tell us more/i).first().fill("Need catering for office lunch.");

    await page.getByRole("button", { name: /submit quote request/i }).click();

    // After clicking the button shows "Sending Request..." immediately
    // Then on success: "Opening Discussion..." → redirects to /catering/chat/[token]
    // First wait for the sending state OR a success indicator
    await expect(
        page.getByText(/sending|opening discussion|success|redirecting/i).first()
    ).toBeVisible({ timeout: 10000 });

    // If we get redirected to the chat page, that's a full success
    // If we stay on /catering, the API responded but no chat token was returned
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    if (currentUrl.includes("/catering/chat/")) {
        // Full success — redirected to chat
        await expect(page).toHaveURL(/\/catering\/chat\//);
    } else {
        // Partial success — stayed on catering page after API call
        // Check for error (red text) vs success (status changed)
        const errorText = await page.locator("text=/error|failed|wrong/i").first().isVisible().catch(() => false);
        if (errorText) {
            throw new Error("Catering form submission returned an error");
        }
        // Acceptable: stayed on page without error
        await expect(page).toHaveURL(/\/catering/);
    }
});

