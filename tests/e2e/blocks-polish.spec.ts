import { expect, test } from "@playwright/test";
import { openBlocksSettings, closeBlocksSettings } from "./blocks-settings-helper";

const guestKey = "bibo-play:blocks%3Aguest";

test("restores all modes, tray, undo, chosen board and mute; restart persists", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click();
  await page.locator('[data-cell="0"]').click();
  await openBlocksSettings(page);
  await page.getByRole("button", { name: "Tắt âm thanh" }).click();
  await closeBlocksSettings(page);
  await page.reload();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await expect(page.getByRole("group", { name: "Khay khối" }).getByRole("button")).toHaveCount(2);
  await openBlocksSettings(page);
  await expect(page.getByRole("button", { name: "Tắt âm thanh" })).toHaveAttribute("aria-pressed", "true");
  await closeBlocksSettings(page);
  await page.getByRole("button", { name: "Lấp hình", exact: true }).click();
  await page.getByRole("button", { name: "Cá", exact: true }).click();
  await page.locator('[data-fill-cell="0"]').click();
  await page.reload();
  await expect(page.getByRole("group", { name: "Hình Cá" })).toBeVisible();
  await expect(page.locator('[data-filled="true"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Hoàn tác" }).click();
  await page.reload(); await expect(page.locator('[data-filled="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Ghép kín", exact: true }).click();
  await page.getByRole("button", { name: "Bàn 3", exact: true }).click();
  await page.getByRole("button", { name: "Gợi ý", exact: true }).click();
  await page.locator('[data-puzzle-cell="0"]').click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Bàn 3", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(4);
  await page.getByRole("button", { name: "Xếp khối", exact: true }).click();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
  await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
  await page.reload(); await expect(page.locator('[data-occupied="true"]')).toHaveCount(0);
});

test("keeps guest and two child profiles independent", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click(); await page.locator('[data-cell="0"]').click();
  await page.goto("/profiles");
  for (const name of ["Mít", "Bông"]) {
    await page.getByRole("button", { name: "Thêm bạn" }).click();
    await page.getByLabel("Biệt danh", { exact: true }).fill(name);
    await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
    await page.getByRole("link", { name: "Vào góc chơi" }).click();
    await page.getByRole("link", { name: "Bibo Blocks" }).click();
    await expect(page.locator('[data-occupied="true"]')).toHaveCount(0);
    if (name === "Mít") {
      await page.getByRole("button", { name: "Khối 1, 2 ô" }).click(); await page.locator('[data-cell="1"]').click();
    }
    await page.goto("/profiles");
  }
  await page.getByRole("button", { name: "Chọn Mít", exact: true }).click();
  await page.getByRole("link", { name: "Vào góc chơi" }).click(); await page.getByRole("link", { name: "Bibo Blocks" }).click();
  await expect(page.locator('[data-cell="1"]')).toHaveAttribute("data-occupied", "true");
  await expect(page.locator('[data-cell="0"]')).toHaveAttribute("data-occupied", "false");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).data.classic.board.cells[0], guestKey)).toBe("block-0");
});

for (const saved of ["broken", JSON.stringify({ version: 99, data: {} })]) {
  test(`preserves unreadable progress ${saved.slice(0, 10)}`, async ({ page }) => {
    await page.goto("/"); await page.evaluate(({ key, saved }) => localStorage.setItem(key, saved), { key: guestKey, saved });
    await page.goto("/play/block-puzzle");
    await expect(page.getByRole("note")).toContainText("bản lưu cũ được giữ lại");
    await page.getByRole("button", { name: "Khối 1, 2 ô" }).click(); await page.locator('[data-cell="0"]').click();
    await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
    expect(await page.evaluate((key) => localStorage.getItem(key), guestKey)).toBe(saved);
  });
}

test("denied writes report failure while play continues", async ({ page }) => {
  await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException("Quota", "QuotaExceededError"); }; });
  await page.goto("/play/block-puzzle");
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click(); await page.locator('[data-cell="0"]').click();
  await expect(page.getByRole("note")).toContainText("Chưa lưu được");
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(2);
});

test("unreadable profile selection never writes into the guest slot", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("bibo-play:profiles", "broken"));
  await page.goto("/play/block-puzzle");
  await expect(page.getByRole("note")).toBeVisible();
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click(); await page.locator('[data-cell="0"]').click();
  expect(await page.evaluate((key) => localStorage.getItem(key), guestKey)).toBeNull();
});

test("real placement audio is gesture-only, mute persists and no audio support is safe", async ({ page }) => {
  await page.addInitScript(() => {
    window.audioEvents = [];
    if (typeof AudioBufferSourceNode === "undefined") return;
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) { window.audioEvents.push("start"); return start.apply(this, args); };
  });
  await page.goto("/play/block-puzzle");
  const sound = page.getByRole("button", { name: "Tắt âm thanh" });
  await openBlocksSettings(page);
  await expect(sound).toBeVisible();
  await closeBlocksSettings(page);
  expect(await page.evaluate(() => window.audioEvents)).toEqual([]);
  await page.getByRole("button", { name: "Khối 1, 2 ô" }).click(); await page.locator('[data-cell="0"]').click();
  if (await page.evaluate(() => typeof AudioContext !== "undefined")) {
    await expect.poll(() => page.evaluate(() => window.audioEvents.length)).toBe(1);
  }
  await openBlocksSettings(page); await sound.click(); await closeBlocksSettings(page); await page.reload();
  await openBlocksSettings(page);
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await closeBlocksSettings(page);
  await page.getByRole("group", { name: "Khay khối" }).getByRole("button").first().click(); await page.locator('[data-cell="1"]').click();
  await expect(page.locator('[data-occupied="true"]')).toHaveCount(3);
  expect(await page.evaluate(() => window.audioEvents)).toEqual([]);
});

test("landscape keeps boards and trays visible and rotation cancels lifted preview", async ({ page }) => {
  await page.goto("/play/block-puzzle");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1024, height: 768 });
  for (const mode of ["Xếp khối", "Lấp hình", "Ghép kín"]) {
    await page.getByRole("button", { name: mode, exact: true }).click();
    await expect(page.locator("[data-blocks-board]")).toBeInViewport();
    await expect(page.locator("[data-blocks-tray]")).toBeInViewport();
    const board = (await page.locator("[data-blocks-board]").boundingBox())!;
    const tray = (await page.locator("[data-blocks-tray]").boundingBox())!;
    expect(board.y + board.height).toBeLessThanOrEqual(768); expect(tray.y + tray.height).toBeLessThanOrEqual(768);
  }
  const piece = (await page.locator("[data-blocks-tray] button").first().boundingBox())!;
  await page.mouse.move(piece.x + 25, piece.y + 25); await page.mouse.down();
  await page.mouse.move(piece.x - 80, piece.y - 50, { steps: 3 });
  await expect(page.locator("[data-drag-ghost]")).toBeVisible();
  await page.mouse.move(1022, 100);
  const ghost = (await page.locator("[data-drag-ghost]").boundingBox())!;
  expect(ghost.x + ghost.width).toBeLessThanOrEqual(1024);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator("[data-drag-ghost]")).toHaveCount(0); await page.mouse.up();
  await expect(page.locator('[data-puzzle-filled="true"]')).toHaveCount(0);
});
