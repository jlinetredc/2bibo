import { expect, it } from "vitest";
import { createBoard } from "./board";
import { placementHint } from "./placementHint";
import { canFillShape, createShapeFill, fillPieces } from "./shapeFill";

it("suggests a whole nearby legal footprint and avoids occupied cells and edges", () => {
  const board = createBoard({ rows: 2, columns: 3, cells: ["old", null, null, null, null, null] });
  const piece = { id: "new", cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }] };
  expect(placementHint(board, piece)).toEqual([1, 2]);
  expect(placementHint(board, piece, { row: 1, column: 2 })).toEqual([4, 5]);
  expect(placementHint(board, undefined)).toEqual([]);
  expect(placementHint(board, piece, undefined, () => false)).toEqual([]);
});
it("respects silhouette masks", () => {
  const state = createShapeFill();
  const piece = fillPieces[1];
  const hint = placementHint(state.board, piece, { row: 0, column: 0 }, (origin) => canFillShape(state, piece.id, origin));
  expect(hint).toEqual([5, 6]);
  expect(hint.every((index) => state.mask[index])).toBe(true);
});
