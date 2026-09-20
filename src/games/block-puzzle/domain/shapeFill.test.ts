import { describe, expect, it } from "vitest";
import { canFillShape, createShapeFill, fillPieces, isShapeFilled, placeShapePiece, shapeTargets, undoShapePiece } from "./shapeFill";

describe("Shape Fill", () => {
  it.each(shapeTargets)("$id has a connected, non-rectangular mask that can be completed", (target) => {
    let state = createShapeFill(target.id);
    expect(state.mask).toHaveLength(25);
    expect(state.mask.some((cell) => !cell)).toBe(true);
    const visited = new Set<number>();
    const pending = [state.mask.indexOf(true)];
    while (pending.length) {
      const index = pending.pop()!;
      if (visited.has(index)) continue;
      visited.add(index);
      const row = Math.floor(index / 5), col = index % 5;
      for (const [r, c] of [[row - 1,col],[row + 1,col],[row,col - 1],[row,col + 1]]) {
        if (r >= 0 && r < 5 && c >= 0 && c < 5 && state.mask[r * 5 + c]) pending.push(r * 5 + c);
      }
    }
    expect(visited.size).toBe(state.mask.filter(Boolean).length);
    expect(isShapeFilled(state)).toBe(false);
    for (const index of visited) state = placeShapePiece(state, "single", { row: Math.floor(index / 5), column: index % 5 });
    expect(isShapeFilled(state)).toBe(true);
    expect(state.board.cells.filter(Boolean)).toHaveLength(visited.size);
  });
  it("rejects unknown target and piece IDs, bounds, overlaps and silhouette holes atomically", () => {
    expect(() => createShapeFill("unknown")).toThrow(RangeError);
    const state = createShapeFill();
    for (const [id, origin] of [["single", { row: 0, column: 0 }], ["horizontal", { row: 0, column: 1 }],
      ["horizontal", { row: 1, column: 4 }], ["single", { row: -1, column: 1 }],
      ["unknown", { row: 1, column: 1 }]] as const) {
      expect(canFillShape(state, id, origin)).toBe(false);
      expect(placeShapePiece(state, id, origin)).toBe(state);
    }
    const next = placeShapePiece(state, "single", { row: 0, column: 1 });
    expect(placeShapePiece(next, "vertical", { row: 0, column: 1 })).toBe(next);
    expect(state.history).toHaveLength(0);
  });
  it("reuses palette pieces with unique placement IDs and undoes entire pieces", () => {
    let state = createShapeFill();
    expect(undoShapePiece(state)).toBe(state);
    state = placeShapePiece(state, "horizontal", { row: 1, column: 0 });
    const first = state;
    state = placeShapePiece(state, "horizontal", { row: 2, column: 0 });
    expect(new Set(state.board.cells.filter(Boolean)).size).toBe(2);
    const undo = undoShapePiece(state);
    expect(undo.board).toEqual(first.board);
    expect(state.board.cells.filter(Boolean)).toHaveLength(4);
    expect(fillPieces).toHaveLength(3);
  });
  it("does not clear full rows and permits singles after arbitrary legal larger placements", () => {
    let state = placeShapePiece(createShapeFill(), "horizontal", { row: 1, column: 0 });
    state = placeShapePiece(state, "vertical", { row: 1, column: 4 });
    for (let index = 0; index < 25; index++) {
      if (state.mask[index] && state.board.cells[index] === null) {
        expect(canFillShape(state, "single", { row: Math.floor(index / 5), column: index % 5 })).toBe(true);
        state = placeShapePiece(state, "single", { row: Math.floor(index / 5), column: index % 5 });
      }
    }
    expect(state.board.cells.slice(5, 10).every(Boolean)).toBe(true);
    expect(isShapeFilled(state)).toBe(true);
    expect(createShapeFill().board.cells.every((cell) => cell === null)).toBe(true);
  });
});
