import { expect, test } from "@playwright/test";
import { freshBlocksProgress } from "../../src/games/block-puzzle/progress";
import { createClassicGame, playClassicPiece, hasClassicMove } from "../../src/games/block-puzzle/domain/classic";

test("no-move round clearly explains the result and offers touch/keyboard restart", async ({ page, isMobile }, testInfo) => {
  const progress = { ...freshBlocksProgress(), tutorialSeen: true, classic: createClassicGame() };
  let classic = playClassicPiece(progress.classic, "block-0", { row: 0, column: 0 });
  classic = playClassicPiece(classic, "block-1", { row: 0, column: 1 });
  progress.classic = { ...classic, board: { ...classic.board,
    cells: Array.from({ length: 25 }, (_, index) => (Math.floor(index / 5) + index % 5) % 2 ? "block-0" : null) } };
  expect(hasClassicMove(progress.classic)).toBe(false);
  await page.addInitScript((saved) => {
    if (!localStorage.getItem("bibo-play:blocks%3Aguest")) localStorage.setItem("bibo-play:blocks%3Aguest", JSON.stringify({ version: 1, data: saved }));
  }, progress);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/play/block-puzzle");
  const end = page.locator("[data-blocks-round-end]");
  await expect(end).toContainText("😔");
  await expect(end).toContainText("20 điểm");
  await expect(page.getByRole("heading", { name: "Không còn chỗ đặt khối" })).toBeFocused();
  await expect(page.getByRole("group", { name: "Khay khối" })).toHaveCount(0);
  await expect(page.locator("[data-cell]:enabled")).toHaveCount(0);
  const restart = page.getByRole("button", { name: "Chơi bàn mới" });
  for (const [width, height] of [[320,568], [375,667], [768,1024], [1024,768]]) {
    await page.setViewportSize({ width, height });
    await restart.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 320) await page.screenshot({ path: testInfo.outputPath("round-end-320.png"), fullPage: true });
    const box = (await restart.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
  }
  await page.reload();
  await expect(end).toBeVisible();
  if (isMobile) await restart.tap(); else { await restart.focus(); await restart.press("Enter"); }
  await expect(end).toHaveCount(0);
  await expect(page.locator("[data-blocks-score] p")).toHaveText("★ Điểm: 0");
  await expect(page.getByRole("group", { name: "Khay khối" }).getByRole("button")).toHaveCount(3);
  await page.reload();
  await expect(end).toHaveCount(0);
});
