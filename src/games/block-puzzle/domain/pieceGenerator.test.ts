import { expect, it, vi } from "vitest";
import { createBoard } from "./board";
import { canPlace, place } from "./boardOperations";
import { createPieceGenerator, nextPiece, type PieceGeneratorState } from "./pieceGenerator";

function sequence(seed: number, count = 30) {
  let state = createPieceGenerator(seed, { rows: 8, columns: 8 });
  return Array.from({ length: count }, () => {
    const result = nextPiece(state); state = result.state; return result.piece;
  });
}

it("keeps baby streams small, deterministic and resumable without altering legacy streams", () => {
  let state = createPieceGenerator(1, { rows: 5, columns: 5 }, "baby");
  const counts = new Set<number>();
  for (let i = 0; i < 120; i++) {
    const next = nextPiece(state);
    expect(next).toEqual(nextPiece(JSON.parse(JSON.stringify(state))));
    expect(next.piece.cells.length).toBeLessThanOrEqual(2);
    counts.add(next.piece.cells.length); state = next.state;
    expect(state.pieceSet).toBe("baby");
  }
  expect(counts).toEqual(new Set([1, 2]));
  expect(() => nextPiece({ ...state, pieceSet: "unknown" } as unknown as PieceGeneratorState)).toThrow();
});

it("replays identical seeds and yields different sequences for distinct seeds", () => {
  expect(sequence(123)).toEqual(sequence(123));
  expect(sequence(123).map((p) => p.cells)).not.toEqual(sequence(456).map((p) => p.cells));
});

it("locks the version-1 seed-1 replay vector", () => {
  expect(sequence(1, 5).map((piece) => piece.cells.map(({ row, column }) => [row, column]))).toEqual([
    [[0, 0], [1, 0]],
    [[0, 0], [0, 1], [0, 2]],
    [[0, 0], [1, 0], [1, 1]],
    [[0, 0], [0, 1], [1, 0]],
    [[0, 0]],
  ]);
});

it("resumes exactly from a JSON checkpoint without changing its source", () => {
  const initial = createPieceGenerator(42, { rows: 3, columns: 5 });
  const checkpoint = nextPiece(initial).state;
  expect(nextPiece(JSON.parse(JSON.stringify(checkpoint)))).toEqual(nextPiece(checkpoint));
  expect(initial.nextId).toBe(0); expect(initial.randomState).toBe(42);
  expect(Object.isFrozen(checkpoint)).toBe(true);
  const result = nextPiece(checkpoint);
  expect(Object.isFrozen(result.piece.cells)).toBe(true);
  expect(result.piece.cells.every(Object.isFrozen)).toBe(true);
});

it.each([[1, 1], [1, 4], [4, 1], [2, 3], [3, 2], [8, 8]])("generates valid connected pieces fitting %ix%i", (rows, columns) => {
  const board = createBoard({ rows, columns });
  let state = createPieceGenerator(0, board);
  const ids = new Set<string>();
  for (let i = 0; i < 200; i++) {
    const result = nextPiece(state); state = result.state;
    const { piece } = result;
    expect(canPlace(board, piece, { row: 0, column: 0 })).toBe(true);
    expect(ids.has(piece.id)).toBe(false); ids.add(piece.id);
    const reached = new Set([0]);
    for (let pass = 0; pass < piece.cells.length; pass++) {
      piece.cells.forEach((cell, index) => {
        if (piece.cells.some((other, j) => reached.has(j) && Math.abs(cell.row - other.row) + Math.abs(cell.column - other.column) === 1)) reached.add(index);
      });
    }
    expect(reached.size).toBe(piece.cells.length);
  }
});

it("produces distinct live IDs accepted by board placement", () => {
  let board = createBoard({ rows: 1, columns: 2 });
  let state = createPieceGenerator(0, { rows: 1, columns: 1 });
  for (let column = 0; column < 2; column++) {
    const result = nextPiece(state); state = result.state;
    board = place(board, result.piece, { row: 0, column });
  }
  expect(board.cells).toEqual(["block-0", "block-1"]);
});

it("does not depend on Math.random or the clock", () => {
  const random = vi.spyOn(Math, "random").mockImplementation(() => { throw new Error("Unexpected randomness"); });
  const clock = vi.spyOn(Date, "now").mockImplementation(() => { throw new Error("Unexpected clock"); });
  try { expect(sequence(0xffffffff, 3)).toHaveLength(3); }
  finally { random.mockRestore(); clock.mockRestore(); }
});

it.each([-1, 0x100000000, 1.5, NaN, Infinity])("rejects invalid seed %s", (seed) => {
  expect(() => createPieceGenerator(seed, { rows: 3, columns: 3 })).toThrow(RangeError);
});

it("validates restored state, dimensions and ID exhaustion before generation", () => {
  const initial = createPieceGenerator(0, { rows: 3, columns: 3 });
  for (const patch of [{ version: 2 }, { randomState: -1 }, { rows: 0 }, { columns: 1.5 }, { rows: 4097 }, { nextId: -1 }, { nextId: 1.5 }, { nextId: Number.MAX_SAFE_INTEGER }]) {
    expect(() => nextPiece({ ...initial, ...patch } as PieceGeneratorState)).toThrow(RangeError);
  }
  expect(nextPiece({ ...initial, nextId: Number.MAX_SAFE_INTEGER - 1 }).piece.id).toBe(`block-${Number.MAX_SAFE_INTEGER - 1}`);
});
