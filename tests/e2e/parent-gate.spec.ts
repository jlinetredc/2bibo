import { expect, test } from "@playwright/test";
const url = "http://127.0.0.1:3101/parent.html";

test("hold cancellation, completion and a fresh gate on reentry", async ({ page }) => {
  await page.goto(url);
  const open = page.getByRole("button", { name: "Mở cổng phụ huynh" });
  await open.click();
  const hold = page.getByRole("button", { name: "Giữ để tiếp tục" });
  await hold.click();
  await expect(page.getByText("Lần xác nhận: 0")).toBeVisible();
  const box = (await hold.boundingBox())!;
  await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down();
  await expect(page.getByText("Đang giữ…")).toBeVisible();
  await page.mouse.move(box.x - 5, box.y);
  await expect(page.getByText("Đang giữ…")).toHaveCount(0); await page.mouse.up();
  await page.mouse.move(box.x + 20, box.y + 20); await page.mouse.down();
  await expect(page.getByText("Lần xác nhận: 1")).toBeVisible({ timeout: 5000 }); await page.mouse.up();
  await expect(open).toBeFocused(); await open.click();
  await expect(hold).toBeVisible();
  await page.getByRole("button", { name: "Quay lại" }).click();
  await expect(hold).toHaveCount(0);
});

test("accessible alternative, responsive controls and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" }); await page.goto(url);
  await page.getByRole("button", { name: "Mở cổng phụ huynh" }).click();
  await page.getByRole("button", { name: "Giữ để tiếp tục" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("textbox")).toBeFocused();
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.locator("section button").all()) expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
  await page.getByRole("textbox").fill("PHỤ HUYNH"); await page.keyboard.press("Enter");
  await expect(page.getByText("Lần xác nhận: 1")).toBeVisible();
});

test("touch hold uses pointer capture and touch cancellation remains closed", async ({ page, browserName, context }) => {
  test.skip(browserName !== "chromium", "Native touch injection requires Chromium CDP.");
  await page.goto(url); await page.getByRole("button", { name: "Mở cổng phụ huynh" }).click();
  const box = (await page.getByRole("button", { name: "Giữ để tiếp tục" }).boundingBox())!;
  const cdp = await context.newCDPSession(page);
  const touchPoints = [{ x: box.x + 30, y: box.y + 30 }];
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints });
  await expect(page.getByText("Đang giữ…")).toBeVisible();
  await cdp.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await expect(page.getByText("Đang giữ…")).toHaveCount(0);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints });
  await expect(page.getByText("Lần xác nhận: 1")).toBeVisible({ timeout: 5000 });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
});
