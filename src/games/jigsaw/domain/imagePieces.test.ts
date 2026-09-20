// @vitest-environment node
import { expect, it } from "vitest";
import { generateImagePieces, type JigsawImage } from "./imagePieces";
import { createJigsawState, isJigsawComplete, placeJigsawPiece } from "./jigsaw";

const image = { src: "/test-image.png", alt: "Ảnh thử nghiệm", width: 101, height: 67 };

it.each([[2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 6]])("covers every source pixel exactly once for a %ix%i grid", (rows, columns) => {
  const result = generateImagePieces({ id: "picture", image, rows, columns });
  const coverage = new Uint8Array(image.width * image.height);
  expect(result.pieces).toHaveLength(rows * columns);
  let state = createJigsawState(result.definition);
  for (const [index, piece] of result.pieces.entries()) {
    expect(piece.row).toBe(Math.floor(index / columns)); expect(piece.column).toBe(index % columns);
    const { x, y, width, height } = piece.source;
    expect(width).toBeGreaterThan(0); expect(height).toBeGreaterThan(0);
    expect(x + width).toBeLessThanOrEqual(image.width); expect(y + height).toBeLessThanOrEqual(image.height);
    for (let py = y; py < y + height; py++) for (let px = x; px < x + width; px++) coverage[py * image.width + px]++;
    state = placeJigsawPiece(state, piece.id, piece.targetId);
  }
  expect(coverage.every((count) => count === 1)).toBe(true);
  expect(isJigsawComplete(state)).toBe(true);
});

it("keeps deterministic IDs, copied immutable image metadata and exact remainder edges", () => {
  const input = { ...image };
  const args = { id: "picture", image: input, rows: 2, columns: 3 };
  const result = generateImagePieces(args);
  expect(result).toEqual(generateImagePieces(args));
  expect(result.pieces.map((piece) => piece.source)).toEqual([
    { x: 0, y: 0, width: 34, height: 34 }, { x: 34, y: 0, width: 34, height: 34 }, { x: 68, y: 0, width: 33, height: 34 },
    { x: 0, y: 34, width: 34, height: 33 }, { x: 34, y: 34, width: 34, height: 33 }, { x: 68, y: 34, width: 33, height: 33 },
  ]);
  input.src = "changed"; input.width = 2;
  expect(result.image).toEqual(image);
  for (const value of [result, result.image, result.pieces, ...result.pieces, ...result.pieces.map((piece) => piece.source)]) expect(Object.isFrozen(value)).toBe(true);
  expect(JSON.parse(JSON.stringify(result))).toEqual(result);
  const otherGrid = generateImagePieces({ id: "picture", image, rows: 3, columns: 2 });
  expect(otherGrid.pieces.some((piece) => result.pieces.some((old) => old.id === piece.id))).toBe(false);
});

it.each([[1, 1, 1, 1], [1, 8, 1, 8], [8, 1, 8, 1], [16, 16, 16, 16]])("supports tiny sources and single axes (%ix%i pixels)", (width, height, columns, rows) => {
  const result = generateImagePieces({ id: "tiny", image: { ...image, width, height }, rows, columns });
  expect(result.pieces.every((piece) => piece.source.width === 1 && piece.source.height === 1)).toBe(true);
  expect(result.pieces.at(-1)!.source).toEqual({ x: width - 1, y: height - 1, width: 1, height: 1 });
});

it("handles large safe-integer dimensions without overflowing boundary multiplication", () => {
  const size = Number.MAX_SAFE_INTEGER;
  const result = generateImagePieces({ id: "metadata-only", image: { ...image, width: size, height: size }, rows: 7, columns: 5 });
  const last = result.pieces.at(-1)!.source;
  expect(last.x + last.width).toBe(size); expect(last.y + last.height).toBe(size);
  expect(result.pieces.every((piece) => Object.values(piece.source).every(Number.isSafeInteger))).toBe(true);
});

it("rejects grids with invalid dimensions, too many pieces or empty pixel crops", () => {
  for (const [rows, columns] of [[0, 2], [2, -1], [1.5, 2], [NaN, 2], [2, Infinity], [17, 17], [68, 1], [1, 102]]) {
    expect(() => generateImagePieces({ id: "bad", image, rows, columns })).toThrow();
  }
  expect(() => generateImagePieces({ id: " ", image, rows: 2, columns: 2 })).toThrow();
});

it("rejects unknown image size, empty source/description and invalid pixel dimensions", () => {
  const bad: unknown[] = [null, {}, { ...image, src: " " }, { ...image, alt: "" },
    ...[0, -1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].flatMap((value) => [{ ...image, width: value }, { ...image, height: value }])];
  for (const value of bad) expect(() => generateImagePieces({ id: "bad", image: value as JigsawImage, rows: 2, columns: 2 })).toThrow();
});
