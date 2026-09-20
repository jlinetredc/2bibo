import { describe, expect, it } from "vitest";
import { blockPuzzles } from "../data/puzzles";
import { checkPuzzleSolution, createPuzzleState, definePuzzle, placePuzzlePiece, solvePuzzle, undoPuzzlePiece } from "./puzzle";

describe("Puzzle solver and checker", () => {
  it.each(blockPuzzles)("solves and independently checks $id without changing content", (definition) => {
    const before = JSON.stringify(definition);
    const answer = solvePuzzle(definition);
    expect(answer.status).toBe("solved");
    if (answer.status !== "solved") throw new Error("Missing solution");
    expect(checkPuzzleSolution(definition, answer.placements)).toBe(true);
    expect(checkPuzzleSolution(definition, [...answer.placements].reverse())).toBe(true);
    expect(checkPuzzleSolution(definition, answer.placements.slice(1))).toBe(false);
    expect(solvePuzzle(definition)).toEqual(answer);
    expect(JSON.stringify(definition)).toBe(before);
    let state = createPuzzleState(definition);
    for (const move of answer.placements) state = placePuzzlePiece(state, move.pieceId, move.origin);
    expect(state.board.cells.every(Boolean)).toBe(true);
    expect(checkPuzzleSolution(definition, state.placements)).toBe(true);
    expect(createPuzzleState(definition).board.cells.every((cell) => cell === null)).toBe(true);
  });
  it("rejects overlap, duplicate use, unknown IDs and bounds in candidate answers", () => {
    const definition = blockPuzzles[0];
    for (const moves of [
      [{ pieceId: "missing", origin: { row: 0, column: 0 } }],
      [{ pieceId: "A", origin: { row: -1, column: 0 } }],
      [{ pieceId: "A", origin: { row: 0, column: 0 } }, { pieceId: "A", origin: { row: 1, column: 0 } }],
      [{ pieceId: "A", origin: { row: 0, column: 0 } }, { pieceId: "B", origin: { row: 0, column: 0 } }],
    ]) {
      expect(checkPuzzleSolution(definition, moves)).toBe(false);
      expect(solvePuzzle(definition, moves).status).toBe("invalid");
    }
  });
  it("distinguishes exhausted search from proven impossibility and never presents either", () => {
    expect(solvePuzzle(blockPuzzles[0], [], 1).status).toBe("limit");
    const definition = definePuzzle({ id: "impossible", rows: 2, columns: 3, pieces: ["a","b","c"].map((id) =>
      ({ id, cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }] })) });
    expect(solvePuzzle(definition).status).toBe("unsolvable");
    expect(() => createPuzzleState(definition)).toThrow("verified solution");
    expect(() => solvePuzzle(blockPuzzles[0], [], 0)).toThrow(RangeError);
  });
  it("continues from legal moves, detects a dead end and recovers after undo", () => {
    const start = createPuzzleState(blockPuzzles[0]);
    expect(undoPuzzlePiece(start)).toBe(start);
    const middle = placePuzzlePiece(start, "A", { row: 1, column: 0 });
    expect(middle.board.cells.slice(3, 6)).toEqual(["A","A","A"]); // No line clearing.
    expect(solvePuzzle(middle.definition, middle.placements).status).toBe("unsolvable");
    expect(placePuzzlePiece(middle, "A", { row: 0, column: 0 })).toBe(middle);
    const undone = undoPuzzlePiece(middle);
    expect(undone.board).toEqual(start.board);
    expect(solvePuzzle(undone.definition, undone.placements).status).toBe("solved");
    const first = placePuzzlePiece(start, "A", { row: 0, column: 0 });
    const continued = solvePuzzle(first.definition, first.placements);
    expect(continued.status).toBe("solved");
    if (continued.status === "solved") expect(continued.placements[0]).toEqual(first.placements[0]);
  });
  it("validates content size, area, IDs and offsets and freezes copied data", () => {
    const definition = blockPuzzles[0];
    expect(() => definePuzzle({ ...definition, rows: 6 })).toThrow();
    expect(() => definePuzzle({ ...definition, pieces: definition.pieces.slice(1) })).toThrow();
    expect(() => definePuzzle({ ...definition, pieces: [definition.pieces[0], definition.pieces[0], definition.pieces[0]] })).toThrow();
    expect(() => definePuzzle({ ...definition, pieces: [{ id: "a", cells: [{ row: 99, column: 0 }] }] })).toThrow();
    const copied = definePuzzle(definition);
    expect(copied.pieces).not.toBe(definition.pieces);
    expect(Object.isFrozen(copied.pieces[0].cells[0])).toBe(true);
  });
  it("matches an independent exhaustive oracle for every 2×3 three-domino orientation set", () => {
    for (let bits = 0; bits < 8; bits++) {
      const pieces = [0,1,2].map((id) => ({ id: String(id), cells: [{ row: 0, column: 0 },
        { row: bits & (1 << id) ? 1 : 0, column: bits & (1 << id) ? 0 : 1 }] }));
      function oracle(i: number, occupied: Set<number>): boolean {
        if (i === 3) return occupied.size === 6;
        for (let row = 0; row < 2; row++) for (let column = 0; column < 3; column++) {
          const cells = pieces[i].cells.map((offset) => ({ row: row + offset.row, column: column + offset.column }));
          if (cells.some((cell) => cell.row >= 2 || cell.column >= 3 || occupied.has(cell.row * 3 + cell.column))) continue;
          if (oracle(i + 1, new Set([...occupied, ...cells.map((cell) => cell.row * 3 + cell.column)]))) return true;
        }
        return false;
      }
      const definition = definePuzzle({ id: "oracle", rows: 2, columns: 3, pieces });
      const result = solvePuzzle(definition);
      expect(result.status === "solved").toBe(oracle(0, new Set()));
      if (result.status === "solved") expect(checkPuzzleSolution(definition, result.placements)).toBe(true);
    }
  });
});
