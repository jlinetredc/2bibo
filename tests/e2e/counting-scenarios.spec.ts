import { expect, test } from "@playwright/test";
import { COUNTING_SCENARIOS } from "../../src/games/counting-adventure/data/scenarios";
test.use({ hasTouch: true });
test("hub entry and all five scenarios at phone/tablet sizes", async ({ page }) => {
  test.setTimeout(90000);
  await page.goto("/play"); await page.getByRole("link", { name: "Cùng Bibo đếm", exact: true }).tap();
  await expect(page).toHaveURL(/\/play\/counting-adventure$/);
  for (const [width, height] of [[320, 850], [375, 850], [768, 1024], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    for (const scenario of COUNTING_SCENARIOS) {
      await page.getByRole("button", { name: scenario.name, exact: true }).tap();
      const game = page.getByRole("region", { name: "Hoạt động đếm" });
      await game.getByRole("button", { name: "Lượt mới", exact: true }).tap();
      const target = Number((await game.getByRole("heading", { level: 2 }).innerText()).match(/\d+/)![0]);
      await expect(game.getByRole("heading", { name: scenario.instruction.replace("{count}", String(target)), exact: true })).toBeVisible();
      expect(target).toBeGreaterThanOrEqual(1); expect(target).toBeLessThanOrEqual(5);
      await game.getByRole("button", { name: "Xong rồi" }).tap(); await expect(game.getByRole("status")).toContainText("Gần đúng rồi!");
      const item = game.getByRole("button", { name: `Đặt vào: ${scenario.itemLabel} 1`, exact: true });
      await expect(item).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(item).toHaveCSS("border-top-width", "0px");
      for (let i = 1; i <= target; i++) await game.getByRole("button", { name: `Đặt vào: ${scenario.itemLabel} ${i}`, exact: true }).tap();
      await game.getByRole("button", { name: "Xong rồi" }).tap(); await expect(game.getByRole("status")).toContainText("Con làm được rồi!");
      await expect(game.getByRole("button", { name: "Chơi tiếp", exact: true })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      for (const button of await page.getByRole("button").all()) {
        const rect = (await button.boundingBox())!; expect(rect.width).toBeGreaterThanOrEqual(48); expect(rect.height).toBeGreaterThanOrEqual(48);
      }
    }
    await page.screenshot({ path: test.info().outputPath(`scenarios-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Chơi tiếp", exact: true }).tap();
    await expect(page.getByText("Đã đặt: 0")).toBeVisible();
    await page.getByRole("button", { name: "Chơi lại", exact: true }).first().tap();
    await expect(page.getByRole("button", { name: "Xếp sao", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  }
  await page.reload(); await expect(page.getByRole("heading", { name: "Cho thỏ 3 củ cà rốt." })).toBeVisible();
  await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).tap(); await expect(page).toHaveURL(/\/play$/);
});

test("active profile controls new rounds after reload without changing stored profile", async ({ page }) => {
  await page.goto("/profiles");
  await page.getByRole("button", { name: "Thêm bạn" }).click();
  await page.getByLabel("Biệt danh", { exact: true }).fill("Mít");
  await page.getByLabel("Nhóm tuổi").selectOption("5-6");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByRole("button", { name: "Chọn Mít", exact: true })).toBeVisible();
  const saved = await page.evaluate(() => localStorage.getItem("bibo-play:profiles"));
  await page.goto("/play/counting-adventure");
  await expect(page.getByRole("heading", { name: "Cho thỏ 5 củ cà rốt." })).toBeVisible();
  await expect(page.getByRole("button", { name: /Đặt vào: Cà rốt/ })).toHaveCount(7);
  await page.getByRole("button", { name: "Đặt vào: Cà rốt 1", exact: true }).tap();
  await page.reload(); await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cho thỏ 5 củ cà rốt." })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("bibo-play:profiles"))).toBe(saved);
});

test("unreadable profile falls back safely and remains untouched", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bibo-play:profiles", "broken"));
  await page.goto("/play/counting-adventure");
  await expect(page.getByRole("note")).toContainText("Chưa mở được hồ sơ");
  await expect(page.getByRole("heading", { name: "Cho thỏ 3 củ cà rốt." })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("bibo-play:profiles"))).toBe("broken");
});
