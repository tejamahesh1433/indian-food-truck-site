import { test, expect } from "../helpers/admin-auth";

test("schedule manager page loads", async ({ adminPage }) => {
    await adminPage.goto("/admin/locations");
    // Wait for the loading state to clear and the page content to render.
    // The heading only appears once the /api/admin/settings fetch completes.
    await expect(adminPage.getByRole("heading", { name: /truck status/i })).toBeVisible({ timeout: 30000 });
    // "Today" label is in a div inside the sidebar preview
    await expect(adminPage.getByText("Today", { exact: true }).first()).toBeVisible({ timeout: 5000 });
});
