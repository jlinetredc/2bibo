import { expect, test } from "@playwright/test";

test("creates, selects, edits and restores multiple local profiles", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Chọn hồ sơ" }).click();
  for (const name of ["Mít", "Bông"]) {
    await page.getByRole("button", { name: "Thêm bạn" }).click();
    await page.getByLabel("Biệt danh", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  }
  const first = page.getByRole("button", { name: "Chọn Mít", exact: true });
  if (isMobile) await first.tap(); else await first.click();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Sửa hồ sơ Mít" }).click();
  await page.getByLabel("Biệt danh", { exact: true }).fill("Mít nhỏ");
  await page.getByLabel("Nhóm tuổi").selectOption("5-6");
  await page.getByRole("radio", { name: "Mèo" }).check();
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByRole("button", { name: "Thêm bạn" })).toBeFocused();
  await page.reload();
  await expect(page.getByRole("button", { name: "Chọn Mít nhỏ", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Chọn Bông", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sửa hồ sơ Mít nhỏ" }).click();
  await expect(page.getByLabel("Nhóm tuổi")).toHaveValue("5-6");
  await expect(page.getByRole("radio", { name: "Mèo" })).toBeChecked();
  for (const [width, height] of [[320,568],[375,667],[768,1024],[1024,768]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole("button").all()) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(48);
    }
  }
});

test("preserves unreadable records instead of replacing them", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bibo-play:profiles", "broken"));
  await page.goto("/profiles");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("giữ nguyên");
  await expect(page.getByRole("button", { name: "Thêm bạn" })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem("bibo-play:profiles"))).toBe("broken");
});

test("keeps the draft when saving fails", async ({ page }) => {
  await page.goto("/profiles");
  await page.getByRole("button", { name: "Thêm bạn" }).click();
  await page.getByLabel("Biệt danh", { exact: true }).fill("Mít");
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("Full", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Chưa lưu được");
  await expect(page.getByLabel("Biệt danh", { exact: true })).toHaveValue("Mít");
  await expect(page.getByRole("button", { name: "Chọn Mít", exact: true })).toHaveCount(0);
});

