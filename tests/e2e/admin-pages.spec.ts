import { test, expect } from "../helpers/admin-auth";

test("admin dashboard is reachable after login", async ({ adminPage }) => {
    // adminPage is already logged in and at /admin
    await expect(adminPage.getByText(/admin dashboard/i).first()).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByText(/menu management/i).first()).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByText(/catering requests/i).first()).toBeVisible({ timeout: 15000 });
    await expect(adminPage.getByText(/truck schedule/i).first()).toBeVisible({ timeout: 15000 });
});
