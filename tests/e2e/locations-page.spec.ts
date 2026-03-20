import { test, expect } from "../helpers/admin-auth";

test("schedule manager page loads", async ({ adminPage }) => {
    await adminPage.goto("/admin/locations");
    await expect(adminPage.getByRole("heading", { name: /truck status/i })).toBeVisible({ timeout: 15000 });
    // getByText with exact:true avoids matching hidden <option> elements like "Closed Today"
    await expect(adminPage.getByText("Today", { exact: true }).first()).toBeVisible({ timeout: 10000 });
});
