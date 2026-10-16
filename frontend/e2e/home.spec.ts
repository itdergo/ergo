import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads with hero section', async ({ page }) => {
    await page.goto('/');

    // Hero section should be visible
    const hero = page.locator('section.hero');
    await expect(hero).toBeVisible();

    // Hero heading should contain the main tagline
    const heading = hero.locator('h1');
    await expect(heading).toContainText('Spaces That Work.');
    await expect(heading).toContainText('Furniture That Inspires.');

    // Hero copy should be present
    await expect(hero.locator('.hero-copy')).toBeVisible();

    // CTA buttons should be present
    await expect(hero.locator('text=Get a Free Quote')).toBeVisible();
    await expect(hero.locator('text=Explore Products')).toBeVisible();
  });

  test('renders navigation header', async ({ page }) => {
    await page.goto('/');

    // Header should be visible
    const header = page.locator('header.site-header');
    await expect(header).toBeVisible();

    // Brand logo should be present
    await expect(header.locator('.brand-logo')).toBeVisible();

    // Key nav links should be present
    await expect(header.locator('nav >> text=Home')).toBeVisible();
    await expect(header.locator('nav >> text=Products')).toBeVisible();
    await expect(header.locator('nav >> text=Contact')).toBeVisible();
  });

  test('renders footer', async ({ page }) => {
    await page.goto('/');

    const footer = page.locator('footer.site-footer');
    await expect(footer).toBeVisible();
    await expect(footer.locator('text=Ergo Contracts Philippines')).toBeVisible();
  });
});
