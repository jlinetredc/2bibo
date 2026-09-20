import { expect, test } from "@playwright/test";
import { freshBlocksProgress } from "../../src/games/block-puzzle/progress";
import { createClassicGame, playClassicPiece } from "../../src/games/block-puzzle/domain/classic";

test("line bonus, rejected move, reduced motion, restore and restart", async ({ page }) => {
  const progress = { ...freshBlocksProgress(), tutorialSeen: true, classic: createClassicGame() };
  let classic = playClassicPiece(progress.classic, "block-0", { row: 0, column: 0 });
  classic = playClassicPiece(classic, "block-1", { row: 0, column: 1 });
  progress.classic = { ...classic, board: { ...classic.board,
    cells: Array.from({ length: 25 }, (_, i) => i >= 1 && i <= 4 ? "block-0" : null) } };
  await page.addInitScript((saved) => localStorage.setItem("bibo-play:blocks%3Aguest", JSON.stringify({ version: 1, data: saved })), progress);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/play/block-puzzle");
  const score = page.locator("[data-blocks-score] p");
  await expect(score).toHaveText("★ Điểm: 20");
  await page.getByRole("button", { name: "Khối 1, 3 ô" }).click();
  await page.locator('[data-cell="1"]').click();
  await expect(score).toHaveText("★ Điểm: 20");
  await page.locator('[data-cell="0"]').click();
  await expect(score).toHaveText("★ Điểm: 80");
  await expect(page.locator("[data-board-feedback]")).toHaveCount(7);
  await expect(page.locator('[data-cell="4"] [data-board-feedback]')).toHaveText("★");
  expect(await page.locator("[data-board-feedback]").first().evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await expect(page.locator("[data-blocks-celebration]")).toContainText("+50 điểm");
  expect(await page.locator("[data-blocks-celebration] strong").evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await expect(page.locator("[data-blocks-celebration]")).toHaveCount(0);
  await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
  await expect(score).toHaveText("★ Điểm: 0");
});
