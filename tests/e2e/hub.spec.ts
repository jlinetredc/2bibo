import { expect, test } from "@playwright/test";

test("hub is reachable directly, from home and from profiles without requiring a profile", async ({ page, isMobile }) => {
  await page.goto("/");
  const entry = page.getByRole("link", { name: "Vào góc chơi" });
  if (isMobile) await entry.tap(); else await entry.click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByRole("link", { name: "Bibo Blocks" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Trò chơi" })).toHaveCount(1);
  await page.getByRole("link", { name: "Chọn hồ sơ" }).click();
  await page.getByRole("link", { name: "Vào góc chơi" }).click();
  await expect(page).toHaveURL(/\/play$/);
  await expect(page.getByRole("heading", { name: "Góc chơi của con" })).toBeVisible();
  await page.reload();
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768]]) {
    await page.setViewportSize({ width, height });
    await expect(page.getByRole("heading", { name: "Góc chơi của con" })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const link of await page.getByRole("link").all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
});

test("populated registry cards support responsive layout, keyboard, touch and scrolling", async ({ page, isMobile }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:3101/hub.html");
  await expect(page.getByRole("link")).toHaveCount(9);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.getByRole("link").last().scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const card = page.getByRole("link").first();
    expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  }
  const first = page.getByRole("link", { name: "Thẻ thử 1", exact: true });
  await first.focus(); await expect(first).toHaveCSS("outline-style", "solid");
  await page.route("**/play/fixture-0", (route) => route.fulfill({ contentType: "text/html; charset=utf-8", body: '<!doctype html><meta charset="utf-8"><h1>Đích thử nghiệm</h1>' }));
  if (isMobile) await first.tap(); else await first.press("Enter");
  await expect(page.getByRole("heading", { name: "Đích thử nghiệm" })).toBeVisible();
});
