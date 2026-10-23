import { test, expect } from "@playwright/test";
test.describe("Home Page", () => {
  test("loads with hero section", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("section.hero");
    await expect(hero).toBeVisible();
    const heading = hero.locator("h1");
    await expect(heading).toContainText("Spaces That Work.");
    await expect(heading).toContainText("Furniture That Inspires.");
    await expect(hero.locator(".hero-copy")).toBeVisible();
    await expect(hero.locator("text=Get a Free Consultation")).toBeVisible();
    await expect(hero.locator("text=Explore Products")).toBeVisible();
  });
  test("renders navigation header", async ({ page }) => {
    await page.goto("/");
    const header = page.locator("header.site-header");
    await expect(header).toBeVisible();
    await expect(header.locator(".brand-logo")).toBeVisible();
    const nav = header.locator("nav");
    await expect(nav.getByText("Home", { exact: true })).toBeVisible();
    await expect(nav.getByText("Products", { exact: true })).toBeVisible();
    await expect(nav.getByText("Contact", { exact: true })).toBeVisible();
  });
  test("renders footer", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer.site-footer");
    await expect(footer).toBeVisible();
    await expect(footer.locator("text=Ergo Contracts Philippines")).toBeVisible();
  });
  test("skip link is the first focusable element and moves focus to main", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator(".skip-link");
    await expect(skipLink).toHaveCount(1);
    await page.keyboard.press("Tab");
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main-content")).toBeFocused();
  });
  test("FAQ section exposes a visible heading", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("section#faq");
    await expect(faq).toBeVisible();
    const heading = faq.locator("h2.section-heading");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveText(/Expert answers/);
  });
  test("FAQ accordion exposes expanded state and toggles answers", async ({ page }) => {
    await page.goto("/");
    const faq = page.locator("section#faq");
    const firstQuestion = faq.locator("button.faq-question").first();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "false");
    const controls = await firstQuestion.getAttribute("aria-controls");
    expect(controls).toBeTruthy();
    await expect(faq.locator(`#${controls}`)).toHaveCount(1);
    await firstQuestion.click();
    await expect(firstQuestion).toHaveAttribute("aria-expanded", "true");
  });
  test("FAQ category headings are not nested inside their toggle button", async ({ page }) => {
    await page.goto("/");
    const headingInsideButton = page.locator("section#faq button.faq-category-head h3");
    await expect(headingInsideButton).toHaveCount(0);
    const wrapped = page.locator("section#faq h3.faq-category-heading button.faq-category-head");
    await expect(wrapped.first()).toBeVisible();
  });
});
