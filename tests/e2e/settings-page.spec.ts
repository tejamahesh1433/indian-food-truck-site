import { test, expect } from "../helpers/admin-auth";

test("site settings page loads", async ({ adminPage }) => {
    await adminPage.goto("/admin/settings");
    await expect(adminPage.getByText(/site settings/i)).toBeVisible();
    await expect(adminPage.getByText(/branding/i)).toBeVisible();
    await expect(adminPage.getByText(/contact/i)).toBeVisible();
});
