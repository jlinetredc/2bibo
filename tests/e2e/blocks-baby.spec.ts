import { expect, test } from "@playwright/test";
import { openBlocksSettings, closeBlocksSettings } from "./blocks-settings-helper";

test("baby defaults, first-play guide, protected settings and replay preserve progress", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  await expect(page.locator("[data-first-play-guide]")).toBeVisible();
  await expect(page.locator("[data-cell]")).toHaveCount(25);
  for (const button of await page.getByRole("group", { name: "Khay khối" }).getByRole("button").all()) {
    await expect(button).toHaveAttribute("aria-label", /[12] ô$/);
  }
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(await page.locator('[data-first-play-guide] > span').evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click();
  await expect(page.locator("[data-first-play-guide]")).toHaveCount(0);
  await page.locator('[data-cell="0"]').click();
  await page.reload();
  await expect(page.locator("[data-first-play-guide]")).toHaveCount(0);
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await expect(page.getByLabel("Cỡ bàn", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Tắt âm thanh" })).toHaveCount(0);
  await page.getByRole("button", { name: "Cài đặt cho bố mẹ" }).click();
  await expect(page.getByLabel("Cỡ bàn", { exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Cài đặt cho bố mẹ" })).toBeFocused();
  await openBlocksSettings(page);
  await expect(page.getByLabel("Cách chơi", { exact: true })).toHaveValue("baby");
  await expect(page.getByLabel("Cỡ bàn", { exact: true })).toBeDisabled();
  await page.getByLabel("Cách chơi", { exact: true }).selectOption("custom");
  await page.getByLabel("Cỡ bàn", { exact: true }).selectOption("8");
  // Draft choices are harmless until the parent explicitly starts a new board.
  await closeBlocksSettings(page);
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await expect(page.locator("[data-cell]")).toHaveCount(25);
  await openBlocksSettings(page);
  await page.getByRole("button", { name: "Xem cách chơi" }).click();
  await expect(page.locator("[data-first-play-guide]")).toBeVisible();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Đóng hướng dẫn" }).click();
  await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
  await page.reload(); await openBlocksSettings(page);
  await expect(page.getByLabel("Cách chơi", { exact: true })).toHaveValue("baby");
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: 768 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page.getByRole("dialog").locator("button, select").all()) {
      expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    }
  }
  await closeBlocksSettings(page);
});

test("near-edge release snaps locally and dropping far away cancels", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  const piece = page.getByRole("button", { name: "Khối 1, 2 ô" });
  await piece.click(); await piece.scrollIntoViewIfNeeded();
  const from = (await piece.boundingBox())!, cell = (await page.locator('[data-cell="0"]').boundingBox())!;
  await page.mouse.move(from.x + 30, from.y + 30); await page.mouse.down();
  await page.mouse.move(cell.x - 10, cell.y + 25, { steps: 5 });
  await expect(page.locator('[data-cell="0"]')).toContainText("+");
  await page.mouse.up();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  const next = page.getByRole("group", { name: "Khay khối" }).getByRole("button").first();
  const box = (await next.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down(); await page.mouse.move(2, 2); await page.mouse.up();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
});
