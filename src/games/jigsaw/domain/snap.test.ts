// @vitest-environment node
import { expect, it } from "vitest";
import { generateImagePieces } from "./imagePieces";
import { createJigsawState, isJigsawComplete, placeJigsawPiece, resetJigsaw } from "./jigsaw";
import { findJigsawSnap, snapJigsawPiece, type JigsawSnapInput } from "./snap";

const puzzle = generateImagePieces({ id: "snap", image: { src: "/fixture.png", alt: "Test", width: 101, height: 67 }, rows: 2, columns: 3 });
const initial = createJigsawState(puzzle.definition);
const input: JigsawSnapInput = { puzzle, pieceId: puzzle.pieces[0].id,
  board: { x: 30, y: 80, width: 303, height: 201 }, origin: { x: 30, y: 80 }, radius: 20 };

it("previews exact geometry without committing and freezes the result", () => {
  const preview = findJigsawSnap(initial, input)!;
  expect(preview.destination).toEqual({ x: 30, y: 80, width: 102, height: 102 });
  expect(preview.targetId).toBe(puzzle.pieces[0].targetId);
  expect(Object.isFrozen(preview)).toBe(true);
  expect(Object.isFrozen(preview.destination)).toBe(true);
  expect(initial.placements).toEqual([]);
});

it("uses an inclusive circular radius, not a square or pointer hit test", () => {
  expect(findJigsawSnap(initial, { ...input, origin: { x: 42, y: 96 } })).not.toBeNull();
  expect(findJigsawSnap(initial, { ...input, origin: { x: 42, y: 96.001 } })).toBeNull();
  expect(findJigsawSnap(initial, { ...input, origin: { x: 49, y: 99 } })).toBeNull();
  expect(findJigsawSnap(initial, { ...input, origin: { x: 10, y: 80 } })).not.toBeNull();
});

it("allows exact alignment with zero radius", () => {
  expect(snapJigsawPiece(initial, { ...input, radius: 0 }).placements).toHaveLength(1);
  expect(snapJigsawPiece(initial, { ...input, radius: 0, origin: { x: 30.001, y: 80 } })).toBe(initial);
});

it("never snaps a piece to a nearby wrong target or consumes a rejected piece", () => {
  const wrong = { ...input, origin: { x: 132, y: 80 } };
  expect(findJigsawSnap(initial, wrong)).toBeNull();
  expect(snapJigsawPiece(initial, wrong)).toBe(initial);
  expect(snapJigsawPiece(initial, input).placements).toHaveLength(1);
  expect(snapJigsawPiece(initial, { ...input, pieceId: "unknown" })).toBe(initial);
});

it("revalidates occupancy on release and supports reset without stale reservations", () => {
  expect(findJigsawSnap(initial, input)).not.toBeNull();
  const placed = placeJigsawPiece(initial, input.pieceId, puzzle.pieces[0].targetId);
  expect(findJigsawSnap(placed, input)).toBeNull();
  expect(snapJigsawPiece(placed, input)).toBe(placed);
  expect(findJigsawSnap(resetJigsaw(placed), input)).not.toBeNull();
});

it.each([320, 375, 768, 1024])("completes an odd-pixel image at viewport width %i with translated board bounds", (viewportWidth) => {
  const width = viewportWidth - 32, height = width * 67 / 101;
  const board = { x: -7.5, y: 41.25, width, height };
  let state = initial;
  for (const piece of [...puzzle.pieces].reverse()) {
    const origin = { x: board.x + piece.source.x / 101 * width, y: board.y + piece.source.y / 67 * height };
    const nextInput = { puzzle, pieceId: piece.id, board, origin, radius: 0 };
    const preview = findJigsawSnap(state, nextInput)!;
    expect(preview.destination.width).toBeCloseTo(piece.source.width / 101 * width);
    expect(preview.destination.height).toBeCloseTo(piece.source.height / 67 * height);
    state = snapJigsawPiece(state, nextInput);
  }
  expect(isJigsawComplete(state)).toBe(true);
  expect(initial.placements).toEqual([]);
});

it("uses current layout after rotation/scroll and preserves a CSS-pixel radius", () => {
  const moved = { ...input, board: { x: 150, y: -20, width: 606, height: 402 } };
  expect(findJigsawSnap(initial, moved)).toBeNull();
  expect(findJigsawSnap(initial, { ...moved, origin: { x: 170, y: -20 } })).not.toBeNull();
  expect(findJigsawSnap(initial, { ...moved, origin: { x: 171, y: -20 } })).toBeNull();
});

it("rejects a stale puzzle or incompatible definition despite shared piece IDs", () => {
  const other = createJigsawState({ ...puzzle.definition, id: "other" });
  expect(snapJigsawPiece(other, input)).toBe(other);
  const changed = createJigsawState({ id: puzzle.definition.id, pieces: puzzle.definition.pieces.map((p, i) => ({ ...p, targetId: `changed-${i}` })) });
  expect(snapJigsawPiece(changed, input)).toBe(changed);
  const smaller = createJigsawState({ ...puzzle.definition, pieces: [puzzle.pieces[0]] });
  expect(snapJigsawPiece(smaller, input)).toBe(smaller);
});

it("fails closed for non-finite, empty, negative or overflowing geometry", () => {
  for (const value of [NaN, Infinity, -Infinity]) {
    for (const key of ["x", "y", "width", "height"] as const)
      expect(snapJigsawPiece(initial, { ...input, board: { ...input.board, [key]: value } })).toBe(initial);
    for (const key of ["x", "y"] as const)
      expect(snapJigsawPiece(initial, { ...input, origin: { ...input.origin, [key]: value } })).toBe(initial);
  }
  for (const radius of [-1, NaN, Infinity]) expect(findJigsawSnap(initial, { ...input, radius })).toBeNull();
  for (const value of [0, -1]) for (const key of ["width", "height"] as const)
    expect(findJigsawSnap(initial, { ...input, board: { ...input.board, [key]: value } })).toBeNull();
  expect(findJigsawSnap(initial, { ...input, pieceId: puzzle.pieces[2].id,
    board: { x: Number.MAX_VALUE, y: 0, width: Number.MAX_VALUE, height: 100 } })).toBeNull();
});
