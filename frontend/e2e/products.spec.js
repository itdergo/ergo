import { test, expect } from "@playwright/test";
test.describe("Products Page", () => {
  test("loads with product grid", async ({ page }) => {
    await page.goto("/products");
    const pageHero = page.locator(".page-hero");
    await expect(pageHero).toBeVisible();
    await expect(pageHero.locator("h1")).toContainText("A complete furniture ecosystem.");
    const grid = page.locator(".product-grid");
    await expect(grid).toBeVisible();
    const cards = grid.locator(".product-card");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });
  test("product cards have required elements", async ({ page }) => {
    await page.goto("/products");
    const firstCard = page.locator(".product-card").first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator(".card-title")).toBeVisible();
    await expect(firstCard.locator("text=View Details")).toBeVisible();
  });
  test("search filter is present", async ({ page }) => {
    await page.goto("/products");
    const searchInput = page.locator(".search-box input");
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute("placeholder", "Search products...");
  });
  test("wishlist button toggles state and announces it", async ({ page }) => {
    await page.goto("/products");
    const wishlist = page.locator(".product-wishlist").first();
    await expect(wishlist).toBeVisible();
    await expect(wishlist).toHaveAttribute("aria-pressed", "false");
    await wishlist.click();
    await expect(wishlist).toHaveAttribute("aria-pressed", "true");
    await expect(wishlist).toHaveAttribute("aria-label", /Remove from wishlist/);
    await wishlist.click();
    await expect(wishlist).toHaveAttribute("aria-pressed", "false");
    await expect(wishlist).toHaveAttribute("aria-label", /Add to wishlist/);
  });
  test("wishlist button does not trigger the card's links", async ({ page }) => {
    await page.goto("/products");
    await page.locator(".product-wishlist").first().click();
    await expect(page).toHaveURL(/\/products$/);
  });
  test("product card exposes independent View Details and Request Quote actions", async ({
    page
  }) => {
    await page.goto("/products");
    const firstCard = page.locator(".product-card").first();
    const viewDetails = firstCard.locator("a.product-cta", { hasText: "View Details" });
    const requestQuote = firstCard.locator("a.product-cta-quote", { hasText: "Request Quote" });
    await expect(viewDetails).toBeVisible();
    await expect(requestQuote).toBeVisible();
    await expect(viewDetails).toHaveAttribute("href", /\/products\//);
    await expect(requestQuote).toHaveAttribute("href", "#contact");
  });
  test("product title is a link so the card is keyboard reachable", async ({ page }) => {
    await page.goto("/products");
    const titleLink = page.locator(".product-card .card-title-link").first();
    await expect(titleLink).toBeVisible();
    await expect(titleLink).toHaveAttribute("href", /\/products\//);
  });
  test("View Details navigates to the product detail page", async ({ page }) => {
    await page.goto("/products");
    const viewDetails = page.locator(".product-card a.product-cta", {
      hasText: "View Details"
    }).first();
    await viewDetails.click();
    await expect(page).toHaveURL(/\/products\/[a-z0-9-]+/);
    await expect(page.locator(".product-detail")).toBeVisible();
  });
});
