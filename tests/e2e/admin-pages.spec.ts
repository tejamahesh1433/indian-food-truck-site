import { test, expect } from "../helpers/admin-auth";

test("admin dashboard is reachable after login", async ({ adminPage }) => {
    // adminPage is already logged in and at /admin
    await expect(adminPage.getByText(/admin dashboard/i)).toBeVisible();
    await expect(adminPage.getByText(/menu management/i)).toBeVisible();
    await expect(adminPage.getByText(/catering requests/i)).toBeVisible();
    await expect(adminPage.getByText(/truck schedule/i)).toBeVisible();
});
