import { describe, expect, it } from "vitest";
import { freshBlocksProgress, isBlocksProgress } from "./progress";
import { canPlace } from "./domain/boardOperations";
import { createClassicGame, playClassicPiece } from "./domain/classic";
import { placeShapePiece, undoShapePiece } from "./domain/shapeFill";
import { placePuzzlePiece, solvePuzzle } from "./domain/puzzle";

const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
describe("Blocks progress validation", () => {
  it("defaults new sessions to baby play and keeps legacy sessions unchanged", () => {
    const fresh = freshBlocksProgress();
    expect(fresh.classic.generator.pieceSet).toBe("baby");
    expect(fresh.classic.board.rows).toBe(5);
    expect(fresh.tutorialSeen).toBe(false);
    expect(isBlocksProgress(copy({ ...fresh, tutorialSeen: true }))).toBe(true);
    const legacy = { ...fresh, classic: createClassicGame(), tutorialSeen: undefined };
    expect(isBlocksProgress(copy(legacy))).toBe(true);
    expect(legacy.classic.generator.pieceSet).toBeUndefined();
    expect(isBlocksProgress({ ...fresh, tutorialSeen: "yes" })).toBe(false);
    expect(() => createClassicGame({ size: 8, pieceSet: "baby" })).toThrow();
  });
  it("restores every supported board size and optional hints without breaking old saves", () => {
    expect(isBlocksProgress(freshBlocksProgress())).toBe(true);
    for (const size of [5, 6, 8]) {
      const data = freshBlocksProgress();
      data.hintsEnabled = false;
      data.classic = createClassicGame({ size });
      data.classic = playClassicPiece(data.classic, data.classic.tray[0].id, { row: 0, column: size - 1 });
      expect(data.classic.moves).toBe(1);
      expect(data.classic.board.cells[size - 1]).not.toBeNull();
      expect(isBlocksProgress(copy(data))).toBe(true);
    }
    expect(() => createClassicGame({ size: 7 })).toThrow();
    expect(isBlocksProgress({ ...freshBlocksProgress(), hintsEnabled: "false" })).toBe(false);
  });
  it("round trips all modes including undo, completed puzzles and deterministic Classic continuation", () => {
    const data = freshBlocksProgress();
    data.shape = placeShapePiece(data.shape, "horizontal", { row: 1, column: 0 });
    data.shape = undoShapePiece(data.shape);
    data.shape = placeShapePiece(data.shape, "single", { row: 0, column: 1 });
    const answer = solvePuzzle(data.puzzle.definition);
    if (answer.status !== "solved") throw new Error("Missing solution");
    for (const move of answer.placements) data.puzzle = placePuzzlePiece(data.puzzle, move.pieceId, move.origin);
    expect(isBlocksProgress(copy(data))).toBe(true);
    for (let i = 0; i < 90; i++) {
      const piece = data.classic.tray[0];
      const index = data.classic.board.cells.findIndex((_, index) => canPlace(data.classic.board, piece, { row: Math.floor(index / 5), column: index % 5 }));
      if (index < 0) { data.classic = createClassicGame({ seed: i }); continue; }
      const origin = { row: Math.floor(index / 5), column: index % 5 };
      const restored = copy(data);
      data.classic = playClassicPiece(data.classic, piece.id, origin);
      expect(playClassicPiece(restored.classic, piece.id, origin)).toEqual(data.classic);
      expect(isBlocksProgress(copy(data))).toBe(true);
    }
  });
  it("rejects broken dimensions, generator/tray, masks, history and impossible puzzle state", () => {
    const base = freshBlocksProgress();
    const changes = [
      (data: typeof base) => { (data.classic.board as { rows: number }).rows = 4; },
      (data: typeof base) => { (data.classic.generator as { version: number }).version = 2; },
      (data: typeof base) => { (data.classic.tray[0].cells as { row: number; column: number }[])[0].column = 4; },
      (data: typeof base) => { (data.shape.mask as boolean[])[0] = true; },
      (data: typeof base) => { (data.shape.history as string[]).push("fill-0"); },
      (data: typeof base) => { (data.puzzle.board.cells as (string | null)[])[0] = "A"; },
    ];
    for (const change of changes) { const data = copy(base); change(data); expect(isBlocksProgress(data)).toBe(false); }
    for (const value of [null, {}, [], { variant: "future" }]) expect(isBlocksProgress(value)).toBe(false);
  });
});
