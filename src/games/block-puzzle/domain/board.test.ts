import { expect, it } from "vitest";
import { createBoard, getCell, isWithinBoard, MAX_BOARD_CELLS, type BlockCell } from "./board";

it.each([[1, 1], [1, 8], [8, 1], [3, 5], [5, 3], [8, 8]])("creates an empty %i by %i board", (rows, columns) => {
  const board = createBoard({ rows, columns });
  expect(board.cells).toHaveLength(rows * columns);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) expect(getCell(board, { row, column })).toBeNull();
  }
});

it("reads a rectangular snapshot in row-major order without transposing axes", () => {
  const board = createBoard({ rows: 2, columns: 3, cells: ["a", null, "b", "c", "d", "e"] });
  expect(getCell(board, { row: 0, column: 2 })).toBe("b");
  expect(getCell(board, { row: 1, column: 0 })).toBe("c");
  expect(getCell(board, { row: 1, column: 2 })).toBe("e");
  expect(isWithinBoard(board, { row: 0, column: 0 })).toBe(true);
  expect(isWithinBoard(board, { row: 1, column: 2 })).toBe(true);
});

it.each([[0, 3], [3, 0], [-1, 3], [3, -1], [1.5, 2], [2, 1.5], [NaN, 2], [2, Infinity], [Number.MAX_SAFE_INTEGER + 1, 1]])(
  "rejects invalid dimensions %s by %s", (rows, columns) => {
    expect(() => createBoard({ rows, columns })).toThrow(RangeError);
  },
);

it("checks allocation limits before allocating and accepts the exact limit", () => {
  expect(createBoard({ rows: 1, columns: MAX_BOARD_CELLS }).cells).toHaveLength(MAX_BOARD_CELLS);
  expect(() => createBoard({ rows: 1, columns: MAX_BOARD_CELLS + 1 })).toThrow(RangeError);
  expect(() => createBoard({ rows: Number.MAX_SAFE_INTEGER, columns: 2 })).toThrow(RangeError);
});

it.each([[-1, 0], [0, -1], [2, 0], [0, 3], [0.5, 1], [1, 0.5], [NaN, 1], [1, Infinity]])(
  "distinguishes invalid position (%s, %s) from an empty cell", (row, column) => {
    const board = createBoard({ rows: 2, columns: 3 });
    expect(isWithinBoard(board, { row, column })).toBe(false);
    expect(() => getCell(board, { row, column })).toThrow(RangeError);
  },
);

it("rejects inconsistent, sparse and invalid initial snapshots", () => {
  for (const cells of [[], [null], [null, null, null], ["", null], ["  ", null], [1, null], [undefined, null], new Array(2), null]) {
    expect(() => createBoard({ rows: 1, columns: 2, cells: cells as readonly BlockCell[] })).toThrow();
  }
});

it("isolates boards from source mutation and freezes exposed state", () => {
  const cells: BlockCell[] = ["piece-a", null];
  const board = createBoard({ rows: 1, columns: 2, cells });
  cells[0] = "changed";
  expect(getCell(board, { row: 0, column: 0 })).toBe("piece-a");
  expect(Object.isFrozen(board)).toBe(true);
  expect(Object.isFrozen(board.cells)).toBe(true);
  expect(createBoard({ rows: 1, columns: 2 }).cells).not.toBe(board.cells);
});

it("reconstructs a serializable snapshot without browser APIs", () => {
  const board = createBoard({ rows: 2, columns: 1, cells: [null, "piece-a"] });
  const restored = createBoard(JSON.parse(JSON.stringify(board)));
  expect(restored).toEqual(board);
  expect(restored.cells).not.toBe(board.cells);
});
