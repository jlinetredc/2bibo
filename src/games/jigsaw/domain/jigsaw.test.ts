// @vitest-environment node
import { expect, it } from "vitest";
import { canPlaceJigsawPiece, createJigsawState, isJigsawComplete, MAX_JIGSAW_PIECES,
  placeJigsawPiece, removeJigsawPiece, resetJigsaw, type JigsawDefinition, type JigsawPlacement } from "./jigsaw";

// Supplied logical fixtures, not an image-piece generator.
const definition: JigsawDefinition = { id: "cat", pieces: [
  { id: "ear", targetId: "top-left" }, { id: "eye", targetId: "top-right" },
  { id: "paw", targetId: "bottom-left" }, { id: "tail", targetId: "bottom-right" },
] };

it("starts empty and copies/freezes nested caller data and restored placements", () => {
  const input = { id: "small", pieces: [{ id: "one", targetId: "left" }, { id: "two", targetId: "right" }] };
  const moves = [{ pieceId: "one", targetId: "left" }];
  const state = createJigsawState(input, moves);
  input.pieces[0].targetId = "changed"; input.pieces.push({ id: "extra", targetId: "extra" });
  moves[0].pieceId = "changed"; moves.length = 0;
  expect(state.definition.pieces).toHaveLength(2);
  expect(state.definition.pieces[0].targetId).toBe("left");
  expect(state.placements).toEqual([{ pieceId: "one", targetId: "left" }]);
  for (const value of [state, state.definition, state.definition.pieces, ...state.definition.pieces, state.placements, ...state.placements]) {
    expect(Object.isFrozen(value)).toBe(true);
  }
  const empty = createJigsawState(definition);
  expect(empty.placements).toEqual([]); expect(isJigsawComplete(empty)).toBe(false);
});

it("accepts only a piece's exact target and rejects bad drops atomically", () => {
  const empty = createJigsawState(definition);
  const state = placeJigsawPiece(empty, "ear", "top-left");
  expect(state.placements).toEqual([{ pieceId: "ear", targetId: "top-left" }]);
  expect(empty.placements).toEqual([]);
  for (const [piece, target] of [["ear", "top-left"], ["ear", "top-right"], ["eye", "top-left"], ["eye", "missing"], ["missing", "top-right"], ["", ""], [" eye", "top-right"]]) {
    expect(canPlaceJigsawPiece(state, piece, target)).toBe(false);
    expect(placeJigsawPiece(state, piece, target)).toBe(state);
  }
  expect(canPlaceJigsawPiece(state, "eye", "top-right")).toBe(true);
  const next = placeJigsawPiece(state, "eye", "top-right");
  expect(Object.isFrozen(next.placements[1])).toBe(true);
  expect(state.placements).toHaveLength(1);
});

it("allows removing and replacing a piece, with repeat removal/reset as no-ops", () => {
  const empty = createJigsawState(definition);
  const first = placeJigsawPiece(empty, "ear", "top-left");
  const second = placeJigsawPiece(first, "eye", "top-right");
  const removed = removeJigsawPiece(second, "ear");
  expect(removed.placements).toEqual([{ pieceId: "eye", targetId: "top-right" }]);
  expect(second.placements).toHaveLength(2);
  expect(removeJigsawPiece(removed, "ear")).toBe(removed);
  expect(removeJigsawPiece(removed, "missing")).toBe(removed);
  expect(canPlaceJigsawPiece(removed, "ear", "top-left")).toBe(true);
  const reset = resetJigsaw(second);
  expect(reset.placements).toEqual([]); expect(reset.definition).toBe(second.definition);
  expect(resetJigsaw(reset)).toBe(reset); expect(Object.isFrozen(reset.placements)).toBe(true);
});

function permutations<T>(values: readonly T[]): T[][] {
  return values.length ? values.flatMap((value, index) => permutations(values.filter((_, i) => i !== index)).map((rest) => [value, ...rest])) : [[]];
}
it("completes in every placement order, then supports removal, replay and reset", () => {
  for (const order of permutations(definition.pieces)) {
    let state = createJigsawState(definition);
    for (const [index, piece] of order.entries()) {
      expect(isJigsawComplete(state)).toBe(false);
      state = placeJigsawPiece(state, piece.id, piece.targetId);
      expect(state.placements).toHaveLength(index + 1);
    }
    expect(isJigsawComplete(state)).toBe(true);
    const removed = removeJigsawPiece(state, order[0].id);
    expect(isJigsawComplete(removed)).toBe(false);
    expect(isJigsawComplete(placeJigsawPiece(removed, order[0].id, order[0].targetId))).toBe(true);
    expect(isJigsawComplete(resetJigsaw(state))).toBe(false);
  }
});

it.each([4, 6, 9, 12, 16, 24])("handles a supplied %i-piece definition and resumes JSON checkpoints", (count) => {
  const supplied = { id: `fixture-${count}`, pieces: Array.from({ length: count }, (_, index) => ({ id: `p-${index}`, targetId: `t-${index}` })) };
  let state = createJigsawState(supplied);
  for (const piece of [...supplied.pieces].reverse()) {
    const json = JSON.parse(JSON.stringify(state));
    const restored = createJigsawState(json.definition, json.placements);
    expect(placeJigsawPiece(restored, piece.id, piece.targetId)).toEqual(placeJigsawPiece(state, piece.id, piece.targetId));
    state = placeJigsawPiece(restored, piece.id, piece.targetId);
  }
  expect(isJigsawComplete(state)).toBe(true);
});

it("rejects malformed, ambiguous and sparse definitions before constructing state", () => {
  const bad: unknown[] = [null, {}, { ...definition, id: " " }, { ...definition, id: 1 }, { ...definition, pieces: [] },
    { ...definition, pieces: new Array(2) }, { ...definition, pieces: [null] },
    { ...definition, pieces: [{ id: "a", targetId: "" }] },
    { ...definition, pieces: [{ id: "a", targetId: "x" }, { id: "a", targetId: "y" }] },
    { ...definition, pieces: [{ id: "a", targetId: "x" }, { id: "b", targetId: "x" }] },
    { ...definition, pieces: Array.from({ length: MAX_JIGSAW_PIECES + 1 }, (_, i) => ({ id: `${i}`, targetId: `${i}` })) }];
  for (const input of bad) expect(() => createJigsawState(input as JigsawDefinition)).toThrow();
});

it("rejects corrupt snapshots rather than treating them as completed games", () => {
  const valid = { pieceId: "ear", targetId: "top-left" };
  for (const moves of [null, {}, new Array(1), [null], [valid, valid], [{ pieceId: "ear", targetId: "top-right" }],
    [{ pieceId: "unknown", targetId: "top-left" }], Array(5).fill(valid)]) {
    expect(() => createJigsawState(definition, moves as readonly JigsawPlacement[])).toThrow();
  }
});
