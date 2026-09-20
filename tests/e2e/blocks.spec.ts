import { expect, test } from "@playwright/test";

test("Classic supports touch/keyboard placement, rejection, refill, restart and responsive rotation", async ({ page, isMobile }) => {
  await page.goto("/play");
  await page.getByRole("link", { name: "Bibo Blocks" }).click();
  const tray = page.getByRole("group", { name: "Khay khối" });
  const cells = page.locator("[data-cell]");
  await expect(tray.getByRole("button")).toHaveCount(3);
  async function put(index: number) {
    const piece = tray.getByRole("button").first();
    if (isMobile) { await piece.tap(); await cells.nth(index).tap(); }
    else { await piece.focus(); await piece.press("Enter"); await cells.nth(index).focus(); await cells.nth(index).press("Enter"); }
  }
  await put(0);
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await put(0);
  await expect(tray.getByRole("button")).toHaveCount(2);
  await expect(page.getByRole("status")).toContainText("Thử lại nhé!");
  await put(1); await put(10);
  await expect(tray.getByRole("button")).toHaveCount(3);
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768],[768,1024]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole("button").all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    await expect(page.locator('[data-occupied="true"]')).toHaveCount(4);
  }
  await page.getByRole("button", { name: "Chơi lại" }).click();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(0);
  await page.reload(); await expect(tray.getByRole("button")).toHaveCount(3);
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(page).toHaveURL(/\/play$/);
});

test("Classic drag releases outside, cancels cleanly and allows a quick tap afterward", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  const piece = page.getByRole("group", { name: "Khay khối" }).getByRole("button").first();
  const target = page.locator('[data-cell="0"]');
  await expect(piece).toBeVisible();
  for (let i = 0; i < 20; i++) {
    const box = (await piece.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(2, 2, { steps: 3 });
    if (i % 2) await page.keyboard.press("Escape");
    await page.mouse.up();
  }
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(0);
  const box = (await piece.boundingBox())!, cell = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down(); await page.mouse.move(cell.x + cell.width / 2, cell.y + cell.height / 2, { steps: 5 });
  await page.mouse.up();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await piece.click(); await page.locator('[data-cell="1"]').click();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(3);
});

test("Classic touch drag cancels without placing and does not scroll the page", async ({ browser, browserName }) => {
  test.skip(browserName !== "chromium", "Native touch injection requires CDP; WebKit tap and pointer drag are covered separately.");
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3100/play/block-puzzle");
    const piece = page.getByRole("group", { name: "Khay khối" }).getByRole("button").first();
    await expect(piece).toBeVisible();
    await piece.scrollIntoViewIfNeeded();
    const startingScroll = await page.evaluate(() => scrollY);
    const box = (await piece.boundingBox())!, cell = (await page.locator('[data-cell="0"]').boundingBox())!;
    const cdp = await context.newCDPSession(page);
    for (let i = 0; i < 2; i++) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 30, y: box.y + 30 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: cell.x + 25, y: cell.y + 25 + 56 }] });
      expect(await page.evaluate(() => scrollY)).toBe(startingScroll);
      expect(await page.evaluate(() => getSelection()?.toString())).toBe("");
      await cdp.send("Input.dispatchTouchEvent", { type: i ? "touchEnd" : "touchCancel", touchPoints: [] });
      await expect(page.locator('[data-occupied="true"]')).toHaveCount(i ? 2 : 0);
    }
    await piece.tap(); await page.locator('[data-cell="1"]').tap();
    await expect(page.locator('[data-occupied="true"]')).toHaveCount(3);
  } finally { await context.close(); }
});
