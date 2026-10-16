import { test, expect } from '@playwright/test';

test.describe('Contact Form', () => {
  test('loads contact page with form', async ({ page }) => {
    await page.goto('/contact');

    // Page hero should be visible
    const pageHero = page.locator('.page-hero');
    await expect(pageHero).toBeVisible();
    await expect(pageHero.locator('h1')).toContainText('Request a Consultation');

    // Contact form should be present
    const form = page.locator('form.contact-form');
    await expect(form).toBeVisible();

    // Required fields should be present
    await expect(page.locator('#consult-name')).toBeVisible();
    await expect(page.locator('#consult-email')).toBeVisible();
    await expect(page.locator('#consult-message')).toBeVisible();
  });

  test('submit without filling required fields shows validation errors', async ({ page }) => {
    await page.goto('/contact');

    // Click submit without filling any fields
    const submitButton = page.locator('button.submit-button');
    await submitButton.click();

    // HTML5 validation should prevent submission and show error states
    // The form should not have submitted (URL should still be /contact)
    await expect(page).toHaveURL(/\/contact/);

    // Required fields should have validation messages
    const nameInput = page.locator('#consult-name');
    const emailInput = page.locator('#consult-email');
    const messageInput = page.locator('#consult-message');

    // Check that fields are marked as required (browser shows validation UI)
    await expect(nameInput).toHaveAttribute('required', '');
    await expect(emailInput).toHaveAttribute('required', '');
    await expect(messageInput).toHaveAttribute('required', '');

    // The form should still be visible (not submitted)
    await expect(page.locator('form.contact-form')).toBeVisible();
  });

  test('contact details are displayed', async ({ page }) => {
    await page.goto('/contact');

    // Contact information section should be visible
    const details = page.locator('.contact-details');
    await expect(details).toBeVisible();

    // Phone, email, office should be present
    await expect(details.locator('text=+63 2 8843 1177')).toBeVisible();
    await expect(details.locator('text=sales_ergo@ergo.com.ph')).toBeVisible();
    await expect(details.locator('text=Makati City')).toBeVisible();
  });
});
