import { expect, it } from "vitest";
import { createBoard } from "./board";
import { canPlace, place, remove, clear, reset, type BlockPiece } from "./boardOperations";

const origin = { row: 0, column: 0 };
const domino: BlockPiece = { id: "a", cells: [origin, { row: 0, column: 1 }] };

it("places a shape at a rectangular board edge without changing its inputs", () => {
  const board = createBoard({ rows: 2, columns: 3 });
  const at = { row: 1, column: 1 };
  expect(canPlace(board, domino, at)).toBe(true);
  const next = place(board, domino, at);
  expect(next.cells).toEqual([null, null, null, null, "a", "a"]);
  expect(board.cells.every((cell) => cell === null)).toBe(true);
  expect(Object.isFrozen(next.cells)).toBe(true);
  expect(domino.cells).toEqual([origin, { row: 0, column: 1 }]);
});

it("checks only occupied offsets, allowing another piece in a shape's hole", () => {
  const board = createBoard({ rows: 2, columns: 2, cells: [null, "other", null, null] });
  const shape = { id: "a", cells: [origin, { row: 1, column: 0 }, { row: 1, column: 1 }] };
  expect(place(board, shape, origin).cells).toEqual(["a", "other", "a", "a"]);
});

it.each([{ row: 0, column: 2 }, { row: 2, column: 0 }, { row: -1, column: 0 }, { row: 0.5, column: 0 }, { row: NaN, column: 0 }])(
  "rejects off-board or invalid origin %j atomically", (at) => {
    const board = createBoard({ rows: 2, columns: 3 });
    expect(canPlace(board, domino, at)).toBe(false);
    expect(() => place(board, domino, at)).toThrow(RangeError);
    expect(board.cells).toEqual(Array(6).fill(null));
  },
);

it("rejects overlap and reused instance IDs, even in a disjoint position", () => {
  const board = createBoard({ rows: 2, columns: 3, cells: [null, "b", null, "a", null, null] });
  expect(canPlace(board, { ...domino, id: "new" }, origin)).toBe(false);
  expect(canPlace(board, domino, { row: 1, column: 1 })).toBe(false);
  expect(() => place(board, domino, origin)).toThrow();
  expect(board.cells).toEqual([null, "b", null, "a", null, null]);
});

it("rejects malformed shapes without claiming they fit", () => {
  const board = createBoard({ rows: 3, columns: 3 });
  for (const cells of [[], [origin, origin], [{ row: -1, column: 0 }], [{ row: 0, column: 0.5 }], [{ row: Infinity, column: 0 }], new Array(2)]) {
    const piece = { id: "a", cells } as BlockPiece;
    expect(canPlace(board, piece, origin)).toBe(false);
    expect(() => place(board, piece, origin)).toThrow();
  }
  expect(canPlace(board, { ...domino, id: " " }, origin)).toBe(false);
});

it("removes only the named instance and permits re-placement", () => {
  const board = createBoard({ rows: 2, columns: 3, cells: ["a", "b", null, "a", null, null] });
  const next = remove(board, "a");
  expect(next.cells).toEqual([null, "b", null, null, null, null]);
  expect(place(next, domino, { row: 1, column: 1 }).cells).toEqual([null, "b", null, null, "a", "a"]);
  expect(remove(next, "missing")).toBe(next);
  expect(() => remove(board, " ")).toThrow(TypeError);
  expect(board.cells[0]).toBe("a");
});

it("clears crossing lines simultaneously and counts their intersection once", () => {
  const board = createBoard({ rows: 3, columns: 4, cells: [
    null, "a", null, null,
    "b", "a", "b", "b",
    null, "a", null, "keep",
  ] });
  const result = clear(board);
  expect(result.rows).toEqual([1]); expect(result.columns).toEqual([1]);
  expect(result.clearedCells).toBe(6);
  expect(result.board.cells).toEqual([null, null, null, null, null, null, null, null, null, null, null, "keep"]);
  expect(board.cells[5]).toBe("a");
  expect(Object.isFrozen(result.rows)).toBe(true);
  expect(clear(result.board).board).toBe(result.board);
});

it("clears all completed lines across every occupancy pattern of a 2x3 board", () => {
  for (let mask = 0; mask < 64; mask++) {
    const cells = Array.from({ length: 6 }, (_, i) => mask & (1 << i) ? "a" : null);
    const fullRows = [[0, 1, 2], [3, 4, 5]].filter((line) => line.every((i) => cells[i] !== null));
    const fullColumns = [[0, 3], [1, 4], [2, 5]].filter((line) => line.every((i) => cells[i] !== null));
    const removed = new Set([...fullRows.flat(), ...fullColumns.flat()]);
    const result = clear(createBoard({ rows: 2, columns: 3, cells }));
    expect(result.clearedCells).toBe(removed.size);
    expect(result.board.cells).toEqual(cells.map((cell, i) => removed.has(i) ? null : cell));
  }
});

it.each([[1, 1], [1, 4], [4, 1]])("handles full single-axis boards %ix%i", (rows, columns) => {
  const result = clear(createBoard({ rows, columns, cells: Array(rows * columns).fill("a") }));
  expect(result.rows).toHaveLength(rows); expect(result.columns).toHaveLength(columns);
  expect(result.clearedCells).toBe(rows * columns);
});

it("placement does not auto-clear; removal handles remnants after a line clear", () => {
  const board = createBoard({ rows: 2, columns: 3, cells: ["a", "a", null, "a", null, null] });
  const placed = place(board, { id: "b", cells: [origin] }, { row: 0, column: 2 });
  expect(placed.cells.slice(0, 3)).toEqual(["a", "a", "b"]);
  // Both row 0 and column 0 clear, leaving no 'a' in this snapshot.
  expect(clear(placed).board.cells).toEqual(Array(6).fill(null));
  const remnant = clear(createBoard({ rows: 3, columns: 3, cells: ["a", "a", "b", "a", null, null, null, null, null] })).board;
  expect(remnant.cells[3]).toBe("a");
  expect(remove(remnant, "a").cells).toEqual(Array(9).fill(null));
});

it("reset empties a fresh snapshot with the same rectangular dimensions", () => {
  const board = place(createBoard({ rows: 2, columns: 3 }), domino, origin);
  const next = reset(board);
  expect(next).toEqual(createBoard({ rows: 2, columns: 3 }));
  expect(next).not.toBe(board); expect(Object.isFrozen(next.cells)).toBe(true);
  expect(board.cells.slice(0, 2)).toEqual(["a", "a"]);
});
