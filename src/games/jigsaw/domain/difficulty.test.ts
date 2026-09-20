// @vitest-environment node
import { expect, it } from "vitest";
import { getDifficulty, type DifficultyProfile } from "../../../game-core/difficulty/difficultyService";
import { generateDifficultyPuzzle, getJigsawDifficulty } from "./difficulty";
import { JIGSAW_DIFFICULTIES, type JigsawDifficulty, type JigsawPieceCount } from "./difficultyPresets";
import { createJigsawState, isJigsawComplete } from "./jigsaw";
import { snapJigsawPiece } from "./snap";

const image = { src: "/fixture.png", alt: "Test", width: 101, height: 67 };
it.each([["3-4", "starter", 4], ["5-6", "easy", 6], ["7+", "standard", 9]] as const)("resolves %s via the central service", (ageBand, level, count) => {
  expect(getJigsawDifficulty({ ageBand })).toEqual(getDifficulty("jigsaw", { ageBand }));
  expect(getJigsawDifficulty({ ageBand }).level).toBe(level);
  expect(generateDifficultyPuzzle({ id: "age", image, profile: { ageBand } }).pieces).toHaveLength(count);
});

it("uses four pieces without a profile and isolates returned settings", () => {
  expect(getJigsawDifficulty()).toEqual(getJigsawDifficulty(null));
  const settings = getJigsawDifficulty();
  (settings.counts as number[]).push(24);
  expect(getJigsawDifficulty().counts).toEqual([4]);
  expect(generateDifficultyPuzzle({ id: "guest", image }).pieces).toHaveLength(4);
  expect(Object.isFrozen(JIGSAW_DIFFICULTIES.advanced.counts)).toBe(true);
});

it.each(Object.values(JIGSAW_DIFFICULTIES))("generates and completes every supported $level count in both image orientations", (config) => {
  for (const count of config.counts) for (const portrait of [false, true]) {
    const source = portrait ? { ...image, width: 67, height: 101 } : image;
    const puzzle = generateDifficultyPuzzle({ id: "all", image: source, level: config.level, pieceCount: count });
    expect(puzzle.pieces).toHaveLength(count);
    expect(portrait ? puzzle.rows >= puzzle.columns : puzzle.columns >= puzzle.rows).toBe(true);
    expect(puzzle.pieces.reduce((area, p) => area + p.source.width * p.source.height, 0)).toBe(101 * 67);
    let state = createJigsawState(puzzle.definition);
    for (const piece of puzzle.pieces) state = snapJigsawPiece(state, { puzzle, pieceId: piece.id,
      board: { x: 0, y: 0, width: source.width, height: source.height }, origin: piece.source, radius: 0 });
    expect(isJigsawComplete(state)).toBe(true);
  }
});

it("requires an explicit advanced choice and never alters an existing puzzle", () => {
  const first = generateDifficultyPuzzle({ id: "first", image, profile: { ageBand: "7+" } });
  const snapshot = JSON.stringify(first);
  const advanced = generateDifficultyPuzzle({ id: "second", image, level: "advanced", pieceCount: 24 });
  expect(advanced.pieces).toHaveLength(24);
  expect(JSON.stringify(first)).toBe(snapshot);
  expect(generateDifficultyPuzzle({ id: "third", image, profile: { ageBand: "7+" } }).pieces).toHaveLength(9);
});

it("rejects unknown levels, invalid age bands, unsupported counts and tiny images", () => {
  for (const level of ["unknown", "__proto__", "toString"]) expect(() => generateDifficultyPuzzle({ id: "bad", image, level: level as JigsawDifficulty })).toThrow();
  for (const pieceCount of [0, 5, 24, NaN]) expect(() => generateDifficultyPuzzle({ id: "bad", image, pieceCount: pieceCount as JigsawPieceCount })).toThrow();
  expect(() => generateDifficultyPuzzle({ id: "bad", image, profile: { ageBand: "8-9" } as unknown as DifficultyProfile })).toThrow();
  expect(() => generateDifficultyPuzzle({ id: "bad", image: { ...image, width: 1 } })).toThrow();
});
