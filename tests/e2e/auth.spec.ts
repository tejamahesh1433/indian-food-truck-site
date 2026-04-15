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
        // Use waitForFunction for reliable animation completion detection
        await page.waitForFunction(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            return inputs.some(el => el.placeholder.toLowerCase().includes('john'));
        }, { timeout: 10000 });
        await expect(page.getByPlaceholder(/john doe/i)).toBeVisible();
    });

    test("sign-in with wrong credentials shows an error", async ({ page }) => {
        await page.goto("/login");

        // Use a valid-domain email with a wrong password so we bypass the domain check
        // and get an actual credentials error from NextAuth
        await page.getByPlaceholder(/you@example\.com/i).fill("invalid-user@gmail.com");
        await page.getByPlaceholder(/•+/).fill("wrongpassword");
        await page.getByRole("button", { name: /sign in/i }).click();

        // Should show "Invalid email or password" error without leaving the page
        // NextAuth credential errors can take a moment to process
        await expect(
            page.getByText(/invalid email or password|please use a well-recognized|wrong credentials/i).first()
        ).toBeVisible({ timeout: 20000 });
        await expect(page).toHaveURL(/\/login/);
    });

    test("sign-up form shows required fields", async ({ page }) => {
        await page.goto("/login");

        // Switch to sign-up mode
        await page.getByRole("button", { name: /sign up/i }).click();

        // Name, email, and password fields should all be visible
        await page.waitForFunction(() => {
            const inputs = Array.from(document.querySelectorAll('input'));
            return inputs.some(el => el.placeholder.toLowerCase().includes('john'));
        }, { timeout: 10000 });
        await expect(page.getByPlaceholder(/john doe/i)).toBeVisible();
        await expect(page.getByPlaceholder(/you@example\.com/i)).toBeVisible();
        await expect(page.getByPlaceholder(/•+/)).toBeVisible();
    });

    test("register button is visible in sign-up mode", async ({ page }) => {
        await page.goto("/login");
        await page.getByRole("button", { name: /sign up/i }).click();

        // Submit button changes to "Create Account" in sign-up mode
        await expect(page.getByRole("button", { name: /create account/i })).toBeVisible({ timeout: 8000 });
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
