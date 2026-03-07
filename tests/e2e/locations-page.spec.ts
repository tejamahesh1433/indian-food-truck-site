import { test, expect } from "../helpers/admin-auth";

test("schedule manager page loads", async ({ adminPage }) => {
    await adminPage.goto("/admin/locations");
    await expect(adminPage.getByText(/schedule manager/i)).toBeVisible();
    await expect(adminPage.getByText(/today/i)).toBeVisible();
});
