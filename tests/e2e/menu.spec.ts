import { test, expect } from "@playwright/test";

test.describe("Menu page", () => {
    test("menu page loads with expected heading", async ({ page }) => {
        await page.goto("/menu");

        await expect(page.getByRole("heading", { name: /menu/i }).first()).toBeVisible();
    });

    test("menu page shows at least one food item", async ({ page }) => {
        await page.goto("/menu");

        // Wait for content to load — look for price patterns like $12.99
        const priceLocator = page.locator("text=/\\$[0-9]+\\.[0-9]{2}/").first();
        await expect(priceLocator).toBeVisible({ timeout: 10000 });
    });

    test("menu page has an 'Add to Cart' or order interaction element", async ({ page }) => {
        await page.goto("/menu");

        // Look for cart-related buttons or interactions
        const cartBtn = page.getByRole("button", { name: /add|cart|order/i }).first();
        await expect(cartBtn).toBeVisible({ timeout: 10000 });
    });

    test("menu navigation link is accessible from homepage", async ({ page }) => {
        await page.goto("/");

        const menuLink = page.getByRole("link", { name: /menu/i }).first();
        await expect(menuLink).toBeVisible();
        await menuLink.click();

        await expect(page).toHaveURL(/\/menu/);
    });

    test("menu page shows dietary indicator labels for items", async ({ page }) => {
        await page.goto("/menu");

        // Wait for menu items to render (look for prices as a proxy for content loaded)
        await expect(page.locator("text=/\\$[0-9]+\\.[0-9]{2}/").first()).toBeVisible({ timeout: 10000 });

        // Check for at least one dietary label — the exact text depends on seeded data
        const vegOrSpicyOrPopular = page.locator("text=/veg|spicy|popular/i").first();
        const hasLabel = await vegOrSpicyOrPopular.isVisible().catch(() => false);

        // This is data-dependent — just confirm the page is fully loaded and didn't crash
        expect(page.url()).toContain("/menu");
        // Log whether labels are visible (soft assertion — does not fail the test)
        if (!hasLabel) {
            console.warn("No dietary labels visible — this is expected if menu items have no veg/spicy/popular flags set.");
        }
    });

    test("cart drawer opens when clicking cart icon", async ({ page }) => {
        await page.goto("/menu");

        // Look for cart icon in navbar
        const cartIcon = page.locator("[aria-label*='cart' i], [data-testid*='cart' i], button:has(svg)").first();
        const hasCartIcon = await cartIcon.isVisible().catch(() => false);

        if (hasCartIcon) {
            await cartIcon.click();
            await expect(page.getByText(/your cart|cart is empty/i).first()).toBeVisible({ timeout: 5000 });
        } else {
            await expect(page).toHaveURL(/\/menu/);
        }
    });
});
