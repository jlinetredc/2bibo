import { expect, test } from "@playwright/test";

test("repeated captured drags, outside release, cancellation, keyboard alternative, and layouts", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/pointer.html");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const handle = page.getByRole("button", { name: "Tay cầm kéo" });
  await expect(handle).toHaveCSS("touch-action", "none");
  await expect(page.locator("body")).toHaveCSS("touch-action", "auto");
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    await expect(handle).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const box = (await handle.boundingBox())!;
  const x = box.x + 30;
  const y = box.y + 30;
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + 180, y + 120, { steps: 3 });
    await page.mouse.up();
    await expect(page.getByTestId("ends")).toHaveText(String(i));
  }
  await expect(page.getByTestId("position")).toHaveText("180, 120");
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe("");
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.getByRole("status")).toHaveText("Đã hủy");
  await expect(page.getByTestId("ends")).toHaveText("20");
  await handle.click();
  await expect(page.getByTestId("ends")).toHaveText("21");
  await page.getByRole("button", { name: "Dịch sang phải" }).press("Enter");
  await expect(page.getByTestId("position")).toHaveText("20, 0");
  await page.evaluate(() => scrollTo(0, 400));
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
});

test("native touch dragging blocks scroll only on the handle and recovers from cancellation", async ({ browser, browserName }) => {
  test.skip(browserName !== "chromium", "Native touch drag injection uses Chromium CDP; WebKit capture is covered by mouse and unit tests.");
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 812 } });
  try {
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3101/pointer.html");
    const cdp = await context.newCDPSession(page);
    const box = (await page.getByRole("button", { name: "Tay cầm kéo" }).boundingBox())!;
    const x = box.x + 30;
    const y = box.y + 30;
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + 140, y: y + 180 }] });
    await expect(page.getByRole("status")).toHaveText("Đang kéo");
    expect(await page.evaluate(() => scrollY)).toBe(0);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await expect(page.getByRole("status")).toHaveText("Đã hủy");
    await page.getByRole("button", { name: "Tay cầm kéo" }).tap();
    await expect(page.getByTestId("ends")).toHaveText("1");
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 280, y: 600 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 280, y: 300 }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
  } finally {
    await context.close();
  }
});
