import { expect, type Page } from "@playwright/test";
export async function openBlocksSettings(page: Page) {
  await page.getByRole("button", { name: "Cài đặt cho bố mẹ", exact: true }).click();
  await page.getByRole("button", { name: "Xác nhận không cần giữ" }).click();
  await page.getByLabel("Nhập cụm từ PHỤ HUYNH để tiếp tục").fill("PHỤ HUYNH");
  await page.getByRole("button", { name: "Tiếp tục", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Cài đặt cho bố mẹ" })).toBeFocused();
}
export async function closeBlocksSettings(page: Page) {
  await page.getByRole("button", { name: "Về chơi", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}
