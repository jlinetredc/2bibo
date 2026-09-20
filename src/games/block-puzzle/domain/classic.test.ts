import { describe, expect, it } from "vitest";
import { createBoard } from "./board";
import { createClassicGame, hasClassicMove, playClassicPiece } from "./classic";

describe("Classic", () => {
  it("replays a seed with an empty board and three pieces", () => {
    const state = createClassicGame();
    expect(state).toEqual(createClassicGame());
    expect(state.tray).toHaveLength(3);
    expect(state.board.cells.every((cell) => cell === null)).toBe(true);
    expect(hasClassicMove(state)).toBe(true);
  });
  it("rejects unknown, overlapping and out-of-bounds placements without consuming anything", () => {
    const start = createClassicGame();
    expect(playClassicPiece(start, "missing", { row: 0, column: 0 })).toBe(start);
    expect(playClassicPiece(start, start.tray[0].id, { row: 4, column: 0 })).toBe(start);
    const next = playClassicPiece(start, start.tray[0].id, { row: 0, column: 0 });
    expect(playClassicPiece(next, next.tray[0].id, { row: 0, column: 0 })).toBe(next);
    expect(start.board.cells.every((cell) => cell === null)).toBe(true);
  });
  it("refills only after all three pieces have been used", () => {
    let state = createClassicGame();
    const generator = state.generator;
    state = playClassicPiece(state, state.tray[0].id, { row: 0, column: 0 });
    expect(state.tray).toHaveLength(2); expect(state.generator).toBe(generator);
    state = playClassicPiece(state, state.tray[0].id, { row: 0, column: 1 });
    state = playClassicPiece(state, state.tray[0].id, { row: 2, column: 0 });
    expect(state.tray.map((piece) => piece.id)).toEqual(["block-3", "block-4", "block-5"]);
    expect(state.moves).toBe(3);
  });
  it("clears a completed row and column simultaneously", () => {
    const state = createClassicGame();
    const cells = Array.from({ length: 25 }, (_, i) => i > 0 && (i < 5 || i % 5 === 0) ? "old" : null);
    const setup = { ...state, board: createBoard({ rows: 5, columns: 5, cells }), tray: [{ id: "single", cells: [{ row: 0, column: 0 }] }] };
    const next = playClassicPiece(setup, "single", { row: 0, column: 0 });
    expect(next.lines).toBe(2);
    expect(next.board.cells.every((cell) => cell === null)).toBe(true);
    expect(next.tray).toHaveLength(3);
  });
  it("detects no legal move even when there are empty cells", () => {
    const state = createClassicGame();
    const board = createBoard({ rows: 5, columns: 5, cells: Array.from({ length: 25 }, (_, i) => i % 2 ? "old" : null) });
    expect(hasClassicMove({ ...state, board })).toBe(false);
    expect(hasClassicMove({ ...state, board, tray: [{ id: "single", cells: [{ row: 0, column: 0 }] }] })).toBe(true);
  });
});
