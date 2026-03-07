import { test, expect } from "@playwright/test";

test("admin login page loads", async ({ page }) => {
    await page.goto("/admin/login");
    // Check for text that exists in the snapshot: "Admin Login"
    await expect(page.getByRole("heading", { name: /admin login/i })).toBeVisible();
    await expect(page.getByPlaceholder(/admin password/i)).toBeVisible();
});
