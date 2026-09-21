import { expect, test, type Page } from "@playwright/test";
const url = "http://127.0.0.1:3101/counting.html";
test.use({ hasTouch: true });
async function drag(page: Page, name: string, toDestination: boolean) {
  const item = page.getByRole("button", { name, exact: true });
  const zone = page.getByRole("group", { name: toDestination ? "Ô đếm" : "Các vật để chọn", exact: true });
  await item.scrollIntoViewIfNeeded();
  const from = (await item.boundingBox())!, to = (await zone.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down(); await page.mouse.move(to.x + to.width / 2, to.y + 20, { steps: 8 }); await page.mouse.up();
}
test("tap, keyboard, retry, replay and responsive portrait/landscape", async ({ page }) => {
  for (const [width, height] of [[320, 850], [375, 850], [768, 1024], [1024, 768]]) {
    await page.setViewportSize({ width, height }); await page.goto(url);
    await page.getByRole("button", { name: "Xong rồi" }).tap();
    await expect(page.getByRole("region", { name: "Hoạt động đếm" }).getByRole("status")).toContainText("Gần đúng rồi!");
    for (let i = 1; i <= 4; i++) await page.getByRole("button", { name: `Đặt vào: Hình ${i}`, exact: true }).tap();
    await page.getByRole("button", { name: "Xong rồi" }).tap();
    await expect(page.getByRole("region", { name: "Hoạt động đếm" }).getByRole("status")).toContainText("Gần đúng rồi!");
    await page.getByRole("button", { name: "Lấy ra: Hình 4", exact: true }).focus(); await page.keyboard.press("Enter");
    for (const button of await page.getByRole("button").all()) {
      const box = (await button.boundingBox())!; expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: test.info().outputPath(`counting-${width}.png`), fullPage: true });
    await page.getByRole("button", { name: "Xong rồi" }).tap();
    await expect(page.getByRole("region", { name: "Hoạt động đếm" }).getByRole("status")).toContainText("Con làm được rồi!");
    await expect(page.getByLabel("Completions")).toHaveText("1");
    await page.getByRole("button", { name: "Chơi lại" }).tap(); await expect(page.getByText("Đã đặt: 0")).toBeVisible();
    await page.reload(); await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  }
});
test("repeated drags, outside release, Escape, quick tap and rotation preserve state", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 }); await page.goto(url);
  for (let i = 0; i < 10; i++) {
    await drag(page, "Đặt vào: Hình 1", true); await expect(page.getByText("Đã đặt: 1")).toBeVisible();
    await drag(page, "Lấy ra: Hình 1", false); await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  }
  const item = page.getByRole("button", { name: "Đặt vào: Hình 1", exact: true });
  await item.hover(); await page.mouse.down(); await page.mouse.move(1, 1); await page.mouse.up();
  await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  await item.hover(); await page.mouse.down(); await page.mouse.move(500, 220); await page.keyboard.press("Escape"); await page.mouse.up();
  await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  await item.tap(); await expect(page.getByText("Đã đặt: 1")).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 768 }); await expect(page.getByText("Đã đặt: 1")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Lấy ra: Hình 1", exact: true }).tap();
  await page.goto(`${url}?large`); await expect(page.getByRole("button", { name: /Đặt vào/ })).toHaveCount(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("native touch drag, cancellation and immediate tap do not scroll or double-count", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "CDP touch injection is Chromium-only; tap paths also run in WebKit.");
  await page.setViewportSize({ width: 768, height: 1024 }); await page.goto(url);
  const client = await page.context().newCDPSession(page);
  const button = page.getByRole("button", { name: "Đặt vào: Hình 1", exact: true });
  const from = (await button.boundingBox())!, to = (await page.getByRole("group", { name: "Ô đếm", exact: true }).boundingBox())!;
  const start = { x: from.x + from.width / 2, y: from.y + from.height / 2 };
  const end = { x: to.x + to.width / 2, y: to.y + 24 };
  for (let i = 0; i < 3; i++) {
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
    await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [end] });
    await client.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
    await expect(page.getByText("Đã đặt: 0")).toBeVisible();
  }
  await button.tap(); await expect(page.getByText("Đã đặt: 1")).toBeVisible();
  await page.getByRole("button", { name: "Lấy ra: Hình 1", exact: true }).tap();
  await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [start] });
  await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [end] });
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByText("Đã đặt: 1")).toBeVisible();
  expect(await page.evaluate(() => ({ scroll: scrollY, selection: getSelection()?.toString() }))).toEqual({ scroll: 0, selection: "" });
});

