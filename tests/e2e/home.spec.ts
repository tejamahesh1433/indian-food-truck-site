import { test, expect } from "@playwright/test";

test("homepage loads", async ({ page }) => {
    await page.goto("/");

    // Use a more flexible text match as "Authentic" and "Indian" might be in different spans
    await expect(page.getByText(/Authentic|Indian|Street/i).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /menu/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /catering/i }).first()).toBeVisible();
});
