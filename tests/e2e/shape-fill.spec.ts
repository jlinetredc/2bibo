import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/play/block-puzzle");
  await page.getByRole("button", { name: "Lấp hình", exact: true }).click();
});

for (const [name, count] of [["Trái tim",16],["Ngôi sao",14],["Cá",18],["Tên lửa",15],["Ngôi nhà",18]] as const) {
  test(`fills ${name} and restarts the chosen target`, async ({ page, isMobile }) => {
    await page.getByRole("button", { name, exact: true }).click();
    const board = page.getByRole("group", { name: `Hình ${name}` });
    await expect(board.getByRole("button")).toHaveCount(count);
    for (const cell of await board.getByRole("button").all()) {
      if (isMobile) await cell.tap(); else await cell.press("Enter");
    }
    await expect(page.getByRole("status")).toContainText("Tuyệt quá!");
    await expect(page.locator("[data-blocks-score] p")).toHaveText(`★ Điểm: ${count * 10 + 100}`);
    await expect(page.locator('[data-filled="true"]')).toHaveCount(count);
    await expect(page.getByRole("group", { name: "Khối lấp hình" })).toHaveCount(0);
    await expect(page.locator("[data-blocks-celebration]")).toBeVisible();
    await page.reload();
    await expect(page.locator("[data-blocks-celebration]")).toHaveCount(0);
    await expect(page.getByRole("status")).toContainText("Tuyệt quá!");
    await expect(page.locator("[data-blocks-score] p")).toHaveText(`★ Điểm: ${count * 10 + 100}`);
    await expect(page.locator('[data-filled="true"]')).toHaveCount(count);
    await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
    await expect(board).toBeVisible();
    await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
    await expect(page.getByRole("group", { name: "Khối lấp hình" }).getByRole("button")).toHaveCount(3);
  });
}

test("rejects crossing the outline, undoes a full piece, changes target and preserves state on rotation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Khối 2, 2 ô", exact: true }).click();
  await page.getByRole("button", { name: "Hàng 1, cột 2, trống" }).click();
  await expect(page.getByRole("status")).toContainText("Thử lại nhé!");
  await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Hàng 2, cột 1, trống" }).click();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(2);
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768],[768,1024]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole("button").all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    await expect(page.locator('[data-filled="true"]')).toHaveCount(2);
  }
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Hàng 2, cột 1, trống" }).click();
  await page.getByRole("button", { name: "Cá", exact: true }).click();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Xếp khối", exact: true }).click();
  await expect(page.getByRole("group", { name: "Bàn xếp khối" })).toBeVisible();
});

test("repeated drag release and cancellation preserve the reusable palette", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  const piece = page.getByRole("button", { name: "Khối 1, 1 ô", exact: true });
  await piece.scrollIntoViewIfNeeded();
  const box = (await piece.boundingBox())!;
  for (let i = 0; i < 20; i++) {
    await page.mouse.move(box.x + 25, box.y + 25); await page.mouse.down();
    await page.mouse.move(2, 2, { steps: 2 });
    if (i % 2) await page.keyboard.press("Escape");
    await page.mouse.up();
  }
  await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
  const cell = (await page.getByRole("button", { name: "Hàng 1, cột 2, trống" }).boundingBox())!;
  await page.mouse.move(box.x + 25, box.y + 25); await page.mouse.down();
  await page.mouse.move(cell.x + 25, cell.y + 25, { steps: 4 }); await page.mouse.up();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(1);
  await piece.click(); await page.getByRole("button", { name: "Hàng 1, cột 4, trống" }).click();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Lấp lại", exact: true }).click();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
});

test("touch drag cancels and can then place without scrolling or selecting text", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "Native touch injection requires Chromium CDP; WebKit covers taps and pointer dragging.");
  await page.setViewportSize({ width: 375, height: 900 });
  const piece = page.getByRole("button", { name: "Khối 1, 1 ô", exact: true });
  await piece.scrollIntoViewIfNeeded();
  const startingScroll = await page.evaluate(() => scrollY);
  const box = (await piece.boundingBox())!;
  const cell = (await page.getByRole("button", { name: "Hàng 1, cột 2, trống" }).boundingBox())!;
  const cdp = await context.newCDPSession(page);
  for (let i = 0; i < 2; i++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 25, y: box.y + 25 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cell.x + 25, y: cell.y + 25 + 56 }] });
    expect(await page.evaluate(() => scrollY)).toBe(startingScroll);
    expect(await page.evaluate(() => getSelection()?.toString())).toBe("");
    await cdp.send("Input.dispatchTouchEvent", { type: i ? "touchEnd" : "touchCancel", touchPoints: [] });
    await expect(page.locator('[data-filled="true"]')).toHaveCount(i ? 1 : 0);
  }
});
