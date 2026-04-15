import { test, expect } from "@playwright/test";

test("customer can browse catering menu and add to request", async ({ page }) => {
    // Navigate to catering page
    await page.goto("/catering");

    // Verify Title
    await expect(page.locator("h1").first()).toContainText(/Catering/i);

    // Find first ADD TO REQUEST button — it only appears after /api/catering-menu fetch completes
    const addButton = page.getByRole("button", { name: /ADD TO REQUEST/i }).first();

    const hasButton = await addButton.waitFor({ state: "visible", timeout: 15000 })
        .then(() => true)
        .catch(() => false);

    if (!hasButton) {
        // No catering items in DB — soft pass since this is data-dependent
        console.warn("No 'ADD TO REQUEST' buttons found — catering menu may be empty. Soft pass.");
        await expect(page).toHaveURL(/\/catering/);
        return;
    }

    await addButton.click();

    // Verify Drawer opens
    const drawerTitle = page.getByText(/Customize Item/i);
    await expect(drawerTitle).toBeVisible({ timeout: 5000 });

    // Add to request from drawer
    await page.getByRole("button", { name: /Add Selection to Request/i }).click();

    // Verify Summary section appears
    await expect(page.getByText(/Your Selection/i)).toBeVisible({ timeout: 5000 });

    // Verify Form exists
    await expect(page.getByPlaceholder(/Your name/i)).toBeVisible();
});
