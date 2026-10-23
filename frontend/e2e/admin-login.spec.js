import { test, expect } from "@playwright/test";
test.describe("Admin Login", () => {
  test("admin login page renders", async ({ page }) => {
    await page.goto("/");
    const adminButton = page.locator('button:has-text("Admin")');
    await adminButton.click();
    const loginHeading = page.locator('h2:has-text("Admin Login")');
    await expect(loginHeading).toBeVisible();
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
    await expect(page.locator("text=Back to site")).toBeVisible();
  });
  test("login form has required attributes", async ({ page }) => {
    await page.goto("/");
    await page.locator('button:has-text("Admin")').click();
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(passwordInput).toHaveAttribute("required", "");
  });
});
