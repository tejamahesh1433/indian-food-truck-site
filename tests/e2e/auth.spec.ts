import { test, expect } from "@playwright/test";

// Customer auth lives at /login — a single page with Sign In / Sign Up tabs

test.describe("Customer authentication", () => {
    test("login page is accessible and shows sign-in form by default", async ({ page }) => {
        await page.goto("/login");

        // Default mode is Sign In — email and password fields should be visible
        await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
        await expect(page.getByPlaceholder(/•+/)).toBeVisible();
    });

    test("login page has a Sign Up tab to switch modes", async ({ page }) => {
        await page.goto("/login");

        // Sign Up tab button should be present
        const signUpTab = page.getByRole("button", { name: /sign up/i });
        await expect(signUpTab).toBeVisible();

        // Clicking it reveals the name field for registration
        await signUpTab.click();
        await expect(page.getByPlaceholder(/john doe/i)).toBeVisible({ timeout: 3000 });
    });

    test("sign-in with wrong credentials shows an error", async ({ page }) => {
        await page.goto("/login");

        await page.getByPlaceholder(/you@example\.com/i).fill("invalid@doesnotexist.com");
        await page.getByPlaceholder(/•+/).fill("wrongpassword");
        await page.getByRole("button", { name: /sign in/i }).click();

        // Should show an error message without leaving the page
        await expect(page.getByText(/invalid|incorrect|error|wrong/i).first()).toBeVisible({ timeout: 5000 });
        await expect(page).toHaveURL(/\/login/);
    });

    test("sign-up form shows required fields", async ({ page }) => {
        await page.goto("/login");

        // Switch to sign-up mode
        await page.getByRole("button", { name: /sign up/i }).click();

        // Name, email, and password fields should all be visible
        await expect(page.getByPlaceholder(/john doe/i)).toBeVisible({ timeout: 3000 });
        await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
        await expect(page.getByPlaceholder(/•+/)).toBeVisible();
    });

    test("register button is visible in sign-up mode", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: /sign up/i }).click();

        // Submit button changes to "Register" in sign-up mode
        await expect(page.getByRole("button", { name: /register/i })).toBeVisible({ timeout: 3000 });
    });

    test("profile page redirects unauthenticated users to login", async ({ page }) => {
        await page.goto("/profile");

        // Should redirect to /login
        await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {});
        expect(page.url()).toMatch(/login/i);
    });

    test("navbar shows a link to sign in when not authenticated", async ({ page }) => {
        await page.goto("/");

        // Navbar shows a "Login" link when unauthenticated
        const authLink = page.getByRole("link", { name: /login/i }).first();
        await expect(authLink).toBeVisible({ timeout: 5000 });
    });
});
