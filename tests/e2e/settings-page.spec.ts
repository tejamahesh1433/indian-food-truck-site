import { test, expect } from "../helpers/admin-auth";

test("site settings page loads", async ({ adminPage }) => {
    await adminPage.goto("/admin/settings");
    // Use heading role selectors to avoid strict-mode errors from repeated text across page sections
    await expect(adminPage.getByRole("heading", { name: /site settings/i })).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByRole("heading", { name: /branding/i })).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByText(/contact/i).first()).toBeVisible({ timeout: 15000 });
});
