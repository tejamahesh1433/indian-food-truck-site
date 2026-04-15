import { test, expect } from "../helpers/admin-auth";

test("site settings page loads", async ({ adminPage }) => {
    await adminPage.goto("/admin/settings");
    // Wait for the loading state to clear and the page content to render.
    // The heading only appears once the /api/admin/settings fetch completes.
    await expect(adminPage.getByRole("heading", { name: /site settings/i })).toBeVisible({ timeout: 30000 });
    // Use heading role selectors to avoid strict-mode errors from repeated text across page sections
    await expect(adminPage.getByRole("heading", { name: /branding/i })).toBeVisible({ timeout: 5000 });
    await expect(adminPage.getByText(/contact/i).first()).toBeVisible({ timeout: 5000 });
});
