import { test, expect } from "@playwright/test";
test.describe("Contact Form", () => {
  test("loads contact page with form", async ({ page }) => {
    await page.goto("/contact");
    const pageHero = page.locator(".page-hero");
    await expect(pageHero).toBeVisible();
    await expect(pageHero.locator("h1")).toContainText("Get a Free Consultation");
    const form = page.locator("form.contact-form");
    await expect(form).toBeVisible();
    await expect(page.locator("#consult-name")).toBeVisible();
    await expect(page.locator("#consult-email")).toBeVisible();
    await expect(page.locator("#consult-message")).toBeVisible();
  });
  test("submit without filling required fields shows validation errors", async ({ page }) => {
    await page.goto("/contact");
    const submitButton = page.locator("button.submit-button");
    await submitButton.click();
    await expect(page).toHaveURL(/\/contact/);
    const nameInput = page.locator("#consult-name");
    const emailInput = page.locator("#consult-email");
    const messageInput = page.locator("#consult-message");
    await expect(nameInput).toHaveAttribute("required", "");
    await expect(emailInput).toHaveAttribute("required", "");
    await expect(messageInput).toHaveAttribute("required", "");
    await expect(page.locator("form.contact-form")).toBeVisible();
  });
  test("contact details are displayed", async ({ page }) => {
    await page.goto("/contact");
    const details = page.locator(".contact-details");
    await expect(details).toBeVisible();
    await expect(details.locator("text=+63 2 8843 1177")).toBeVisible();
    await expect(details.locator("text=sales_ergo@ergo.com.ph")).toBeVisible();
    await expect(details.locator("text=Makati City")).toBeVisible();
  });
});
