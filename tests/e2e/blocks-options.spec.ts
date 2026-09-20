import { expect, test } from "@playwright/test";
import { openBlocksSettings, closeBlocksSettings } from "./blocks-settings-helper";

test("hints toggle persists and large boards keep accurate placement, restart and touch sizes", async ({ page, isMobile }) => {
  await page.goto("/play/block-puzzle");
  const hints = page.getByRole("button", { name: "Gợi ý tự động" });
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click();
  await expect(page.locator("[data-placement-hint]")).toHaveCount(2);
  await openBlocksSettings(page); await hints.click(); await closeBlocksSettings(page);
  await expect(page.locator("[data-placement-hint]")).toHaveCount(0);
  await page.reload();
  await openBlocksSettings(page);
  await expect(hints).toHaveAttribute("aria-pressed", "false");
  await closeBlocksSettings(page);
  await page.getByRole("button", { name: "Lấp hình", exact: true }).click();
  await expect(page.locator("[data-placement-hint]")).toHaveCount(0);
  await openBlocksSettings(page); await hints.click(); await closeBlocksSettings(page);
  await expect(page.locator("[data-placement-hint]")).toHaveCount(1);
  await page.getByRole("button", { name: "Xếp khối", exact: true }).click();
  for (const size of [6, 8, 5]) {
    await openBlocksSettings(page);
    await page.getByLabel("Cách chơi", { exact: true }).selectOption("custom");
    await page.getByLabel("Cỡ bàn", { exact: true }).selectOption(String(size));
    await page.getByRole("button", { name: "Mở bàn mới", exact: true }).click();
    await expect(page.locator("[data-cell]")).toHaveCount(size * size);
    await page.getByRole("button", { name: "Khối 1, 2 ô" }).click();
    const target = page.locator(`[data-cell="${size - 1}"]`);
    if (isMobile) await target.tap(); else await target.click();
    await expect(target).toHaveAttribute("data-occupied", "true");
    await expect(page.locator(`[data-cell="${size * 2 - 1}"]`)).toHaveAttribute("data-occupied", "true");
    await page.reload();
    await expect(page.locator("[data-cell]")).toHaveCount(size * size);
    await expect(target).toHaveAttribute("data-occupied", "true");
    for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768]]) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const box = (await target.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
    await expect(page.locator("[data-cell]")).toHaveCount(size * size);
    await expect(page.locator('[data-occupied="true"]')).toHaveCount(0);
  }
});
