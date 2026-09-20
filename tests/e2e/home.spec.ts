import { expect, test } from "@playwright/test";

test("serves the styled Vietnamese welcome page across screen sizes", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Bibo Play");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("link", { name: "Vào góc chơi" })).toBeVisible();

  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: width >= 1024 ? 768 : 1024 });
    await expect(page.getByRole("heading", { name: "Bibo Play" })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    for (const link of await page.getByRole("main").getByRole("link").all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(52);
      await expect(link).toBeInViewport();
    }
  }
});
