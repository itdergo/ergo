import { test, expect } from "@playwright/test";

test.describe("Admin Login", () => {
  test("admin login page renders", async ({ page }) => {
    await page.goto("/");

    // Click the floating Admin button
    const adminButton = page.locator('button:has-text("Admin")');
    await adminButton.click();

    // Login page should be visible
    const loginHeading = page.locator('h2:has-text("Admin Login")');
    await expect(loginHeading).toBeVisible();

    // Email and password fields should be present
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Login button should be present
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();

    // Back to site link should be present
    await expect(page.locator("text=Back to site")).toBeVisible();
  });

  test("login form has required attributes", async ({ page }) => {
    await page.goto("/");

    // Navigate to admin login
    await page.locator('button:has-text("Admin")').click();

    // Email and password should be required
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(passwordInput).toHaveAttribute("required", "");
  });
});
