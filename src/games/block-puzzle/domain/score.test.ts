import { describe, expect, it } from "vitest";
import { classicScore, fillScore } from "./score";
import { createClassicGame, playClassicPiece } from "./classic";
import { createShapeFill, placeShapePiece, undoShapePiece } from "./shapeFill";

describe("round scores", () => {
  it("rewards moves and simultaneous lines without rewarding rejected moves", () => {
    const state = createClassicGame();
    expect(classicScore(state)).toBe(0);
    const placed = playClassicPiece(state, state.tray[0].id, { row: 0, column: 0 });
    expect(classicScore(placed)).toBe(10);
    expect(classicScore(playClassicPiece(placed, placed.tray[0].id, { row: 0, column: 0 }))).toBe(10);
    expect(classicScore({ moves: 3, lines: 2 })).toBe(130);
    expect(classicScore(JSON.parse(JSON.stringify(placed)))).toBe(10);
  });
  it("undo and replacement do not farm points; completion awards one bonus", () => {
    const initial = createShapeFill();
    const placed = placeShapePiece(initial, "single", { row: 0, column: 1 });
    expect(fillScore(placed.board, false)).toBe(10);
    const undone = undoShapePiece(placed);
    expect(fillScore(undone.board, false)).toBe(0);
    expect(fillScore(placeShapePiece(undone, "single", { row: 0, column: 1 }).board, false)).toBe(10);
    expect(fillScore({ rows: 1, columns: 2, cells: ["a", "b"] }, true)).toBe(120);
  });
});
