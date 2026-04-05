import { test, expect } from "../helpers/admin-auth";

test("admin dashboard is reachable after login", async ({ adminPage }) => {
    // adminPage is already logged in and at /admin
    // Check nav links that actually exist in the AdminLayoutClient sidebar
    await expect(adminPage.getByRole("link", { name: /menu management/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByRole("link", { name: /catering/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByRole("link", { name: /truck schedule/i }).first()).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByText(/orders control center/i).first()).toBeVisible({ timeout: 15000 });
});
