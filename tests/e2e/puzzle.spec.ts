import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/play/block-puzzle");
  await page.getByRole("button", { name: "Ghép kín", exact: true }).click();
});

for (const number of [1, 2, 3]) {
  test(`solver hints complete finite puzzle ${number} and shell restart keeps its selection`, async ({ page, isMobile }) => {
    await page.getByRole("button", { name: `Bàn ${number}`, exact: true }).click();
    const tray = page.getByRole("group", { name: "Khối Puzzle" });
    const count = number === 3 ? 4 : 3;
    await expect(tray.getByRole("button")).toHaveCount(count);
    for (let i = 0; i < count; i++) {
      await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
      const message = (await page.getByRole("status").textContent())!;
      const match = message.match(/Khối (\d+) → hàng (\d+), cột (\d+)/)!;
      expect(match).not.toBeNull();
      const cell = page.getByRole("button", { name: new RegExp(`^Hàng ${match[2]}, cột ${match[3]},`) });
      if (isMobile) await cell.tap(); else await cell.press("Enter");
      if (i < count - 1) await expect(tray.getByRole("button")).toHaveCount(count - i - 1);
    }
    await expect(page.getByRole("status")).toContainText("Tuyệt quá!");
    await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(number === 1 ? 9 : number === 2 ? 12 : 16);
    await expect(tray).toHaveCount(0);
    await expect(page.locator("[data-blocks-score] p")).toHaveText(`★ Điểm: ${(number === 1 ? 9 : number === 2 ? 12 : 16) * 10 + 100}`);
    await page.reload();
    await expect(page.getByRole("status")).toContainText("Tuyệt quá!");
    await expect(tray).toHaveCount(0);
    await expect(page.locator("[data-blocks-score] p")).toHaveText(`★ Điểm: ${(number === 1 ? 9 : number === 2 ? 12 : 16) * 10 + 100}`);
    await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
    await expect(page.getByRole("button", { name: `Bàn ${number}`, exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(0);
    await expect(tray.getByRole("button")).toHaveCount(count);
  });
}

test("dead-end recovery, rejection, layout, rotation and mode changes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Khối 1, 3 ô" }).click();
  await page.getByRole("button", { name: "Hàng 1, cột 2, trống" }).click();
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Thử lại nhé!");
  await page.getByRole("button", { name: "Hàng 2, cột 1, trống" }).click();
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("hoàn tác");
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768],[768,1024]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole("button").all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(3);
  }
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(page.getByRole("button", { name: "Khối 1, 3 ô" })).toBeVisible();
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Khối 1 → hàng 1, cột 1.");
  await page.getByRole("button", { name: "Hàng 1, cột 1, trống" }).click();
  await page.getByRole("button", { name: "Ghép lại" }).click();
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Lấp hình", exact: true }).click();
  await expect(page.getByRole("group", { name: "Hình Trái tim" })).toBeVisible();
});

test("repeated pointer cancellation/outside release, drag and quick subsequent selection", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  const piece = page.getByRole("button", { name: "Khối 1, 3 ô" });
  const box = (await piece.boundingBox())!;
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(box.x + 25, box.y + 25); await page.mouse.down();
    await page.mouse.move(2, 2, { steps: 2 });
    if (i % 2) await page.keyboard.press("Escape");
    await page.mouse.up();
  }
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(0);
  const cell = (await page.getByRole("button", { name: "Hàng 1, cột 1, trống" }).boundingBox())!;
  await page.mouse.move(box.x + 25, box.y + 25); await page.mouse.down();
  await page.mouse.move(cell.x + 25, cell.y + 25, { steps: 4 }); await page.mouse.up();
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(3);
  await page.getByRole("button", { name: "Khối 2, 3 ô" }).click();
  await page.getByRole("button", { name: "Hàng 2, cột 1, trống" }).click();
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(6);
});

test("native touch cancellation consumes no piece and drag does not scroll/select text", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Touch injection requires CDP; WebKit covers taps and pointer dragging.");
  await page.setViewportSize({ width: 375, height: 900 });
  const piece = page.getByRole("button", { name: "Khối 1, 3 ô" });
  const box = (await piece.boundingBox())!;
  const cell = (await page.getByRole("button", { name: "Hàng 1, cột 1, trống" }).boundingBox())!;
  const cdp = await context.newCDPSession(page);
  for (let i = 0; i < 2; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 25, y: box.y + 25 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cell.x + 25, y: cell.y + 25 + 56 }] });
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => getSelection()?.toString())).toBe("");
    await cdp.send("Input.dispatchTouchEvent", { type: i ? "touchEnd" : "touchCancel", touchPoints: [] });
    await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(i ? 3 : 0);
  }
});
