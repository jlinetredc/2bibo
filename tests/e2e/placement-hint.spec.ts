import { expect, test } from "@playwright/test";

test("selected and dragged pieces suggest a complete free footprint without placing automatically", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  const piece = page.getByRole("button", { name: "Khối 1, 2 ô" });
  await piece.click();
  await expect(page.locator("[data-placement-hint]")).toHaveCount(2);
  await expect(page.locator('[data-cell="0"] [data-placement-hint]')).toBeVisible();
  const from = (await piece.boundingBox())!;
  const to = (await page.locator('[data-cell="14"]').boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 8 });
  await expect(page.locator('[data-cell="14"] [data-placement-hint]')).toBeVisible();
  await expect(page.locator('[data-cell="19"] [data-placement-hint]')).toBeVisible();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(0);
  await page.mouse.up();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await expect(page.locator("[data-placement-hint]")).toHaveCount(0);
  await page.getByRole("button", { name: "Lấp hình", exact: true }).click();
  await page.getByRole("button", { name: "Khối 2, 2 ô" }).click();
  await expect(page.locator("[data-placement-hint]")).toHaveCount(2);
  await expect(page.locator('[data-fill-cell="5"] [data-placement-hint]')).toBeVisible();
  await page.getByRole("button", { name: "Ghép kín", exact: true }).click();
  await page.getByRole("button", { name: "Khối 1, 3 ô" }).click();
  await expect(page.locator("[data-placement-hint]")).toHaveCount(3);
});
