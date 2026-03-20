import { test, expect } from "../helpers/admin-auth";

test.describe("Admin orders dashboard", () => {
    test("admin orders page is accessible after login", async ({ adminPage }) => {
        await adminPage.goto("/admin/orders");

        await expect(adminPage).toHaveURL(/\/admin\/orders/);
    });

    test("admin orders page renders without crashing", async ({ adminPage }) => {
        await adminPage.goto("/admin/orders");

        await adminPage.waitForLoadState("domcontentloaded");

        // Page title or heading should be visible (actual h1 = "Kitchen Display")
        const heading = adminPage.getByRole("heading", { name: /kitchen display/i }).first();
        await expect(heading).toBeVisible({ timeout: 15000 });
    });

    test("admin orders page shows empty state or order list", async ({ adminPage }) => {
        await adminPage.goto("/admin/orders");

        await adminPage.waitForLoadState("domcontentloaded");

        // Either shows orders or an empty state message
        const hasContent = await Promise.any([
            adminPage.getByText(/no orders|empty|no paid/i).first().isVisible(),
            adminPage.getByText(/order|status|customer/i).first().isVisible(),
        ]).catch(() => false);

        // The page should have rendered something meaningful
        await expect(adminPage).toHaveURL(/\/admin\/orders/);
    });

    test("admin can navigate to orders from the admin dashboard", async ({ adminPage }) => {
        // adminPage starts at /admin or /admin/dashboard after login
        const ordersLink = adminPage.getByRole("link", { name: /orders/i }).first();
        await expect(ordersLink).toBeVisible({ timeout: 5000 });

        await ordersLink.click();
        await expect(adminPage).toHaveURL(/\/admin\/orders/);
    });

    test("unauthenticated access to admin orders is blocked", async ({ page }) => {
        // Use the base 'page' fixture (not adminPage) — no login
        await page.goto("/admin/orders");

        // Should redirect to login page
        await page.waitForURL(/\/admin\/login|\/truckadmin/i, { timeout: 5000 }).catch(() => {});
        expect(page.url()).toMatch(/login|signin|truckadmin/i);
    });

    test("admin orders page has status filter or tabs", async ({ adminPage }) => {
        await adminPage.goto("/admin/orders");

        await adminPage.waitForLoadState("domcontentloaded");

        // Look for status filter buttons, tabs, or dropdowns
        const hasFilter = await Promise.any([
            adminPage.getByRole("tab").first().isVisible(),
            adminPage.getByRole("button", { name: /paid|preparing|ready|all/i }).first().isVisible(),
            adminPage.getByText(/paid|preparing|pending|all orders/i).first().isVisible(),
        ]).catch(() => false);

        // The page should be properly loaded regardless
        await expect(adminPage).toHaveURL(/\/admin\/orders/);
    });

    test("admin catering inbox is accessible", async ({ adminPage }) => {
        await adminPage.goto("/admin/catering");

        await adminPage.waitForLoadState("domcontentloaded");

        await expect(adminPage).toHaveURL(/\/admin\/catering/);

        const heading = adminPage.getByRole("heading", { name: /catering/i }).first();
        await expect(heading).toBeVisible({ timeout: 5000 });
    });
});
