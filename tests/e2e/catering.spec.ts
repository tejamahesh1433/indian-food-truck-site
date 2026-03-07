import { test, expect } from "@playwright/test";

test("customer can browse catering menu and add to request", async ({ page }) => {
    // Navigate to catering page
    await page.goto("/catering");

    // Verify Title
    await expect(page.locator("h1").first()).toContainText(/Catering/i);

    // Find first ADD TO REQUEST button and click it
    // Using simple text match as we know the button text
    const addButton = page.getByRole("button", { name: /ADD TO REQUEST/i }).first();
    await addButton.click();

    // Verify Drawer opens
    const drawerTitle = page.getByText(/Customize Item/i);
    await expect(drawerTitle).toBeVisible();

    // Add to request from drawer
    await page.getByRole("button", { name: /Add Selection to Request/i }).click();

    // Verify Summary section appears
    await expect(page.getByText(/Your Selection/i)).toBeVisible();

    // Verify Form exists
    await expect(page.getByPlaceholder(/Your name/i)).toBeVisible();
});
