import { test, expect } from '@playwright/test';

test.describe('Products Page', () => {
  test('loads with product grid', async ({ page }) => {
    await page.goto('/products');

    // Page hero should be visible
    const pageHero = page.locator('.page-hero');
    await expect(pageHero).toBeVisible();
    await expect(pageHero.locator('h1')).toContainText('A complete furniture ecosystem.');

    // Product grid should be visible
    const grid = page.locator('.product-grid');
    await expect(grid).toBeVisible();

    // At least one product card should be rendered
    const cards = grid.locator('.product-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('product cards have required elements', async ({ page }) => {
    await page.goto('/products');

    const firstCard = page.locator('.product-card').first();
    await expect(firstCard).toBeVisible();

    // Each card should have a title
    await expect(firstCard.locator('.card-title')).toBeVisible();

    // Each card should have a "View Details" link
    await expect(firstCard.locator('text=View Details')).toBeVisible();
  });

  test('search filter is present', async ({ page }) => {
    await page.goto('/products');

    const searchInput = page.locator('.search-box input');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', 'Search products...');
  });
});
