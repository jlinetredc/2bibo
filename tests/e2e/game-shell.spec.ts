import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("http://127.0.0.1:3101");
});

test("controls stay usable across sizes, rotation, and reduced motion", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const sound = page.getByRole("button", { name: "Tắt âm thanh" });
  if (isMobile) await sound.tap();
  else await sound.click();
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    for (const name of ["Quay lại", "Chơi lại", "Tắt âm thanh"]) {
      const button = page.getByRole("button", { name });
      await expect(button).toBeInViewport();
      const bounds = await button.boundingBox();
      expect(bounds!.width).toBeGreaterThanOrEqual(48);
      expect(bounds!.height).toBeGreaterThanOrEqual(48);
    }
    await expect(sound).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const count = page.getByRole("button", { name: "Đếm: 0" });
  if (isMobile) await count.tap();
  else await count.click();
  await expect(page.getByRole("button", { name: "Đếm: 1" })).toBeVisible();
  const restart = page.getByRole("button", { name: "Chơi lại" });
  if (isMobile) await restart.tap();
  else await restart.click();
  await expect(page.getByRole("button", { name: "Đếm: 0" })).toBeVisible();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page.getByRole("status")).toHaveText("Đã quay lại");
  await page.evaluate(() => window.scrollTo(0, 500));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("keyboard controls have visible focus and activate without a pointer", async ({ page }) => {
  const back = page.getByRole("button", { name: "Quay lại" });
  await expect(back).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(back).toBeFocused();
  await expect(back).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("status")).toHaveText("Đã quay lại");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Chơi lại" })).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await expect(page.getByRole("button", { name: "Tắt âm thanh" })).toHaveAttribute("aria-pressed", "true");
});
