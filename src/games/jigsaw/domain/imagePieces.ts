import { createJigsawState, MAX_JIGSAW_PIECES, type JigsawDefinition } from "./jigsaw";

export interface JigsawImage {
  readonly src: string;
  readonly alt: string;
  /** Decoded source-image dimensions in pixels, not its CSS display size. */
  readonly width: number;
  readonly height: number;
}
export interface ImagePiece {
  readonly id: string;
  readonly targetId: string;
  readonly row: number;
  readonly column: number;
  /** Integer pixel crop. The same rectangle is its solved position in the image. */
  readonly source: Readonly<{ x: number; y: number; width: number; height: number }>;
}
export interface JigsawImagePieces {
  readonly definition: JigsawDefinition;
  readonly image: JigsawImage;
  readonly rows: number;
  readonly columns: number;
  readonly pieces: readonly ImagePiece[];
}

const positiveInteger = (value: number) => Number.isSafeInteger(value) && value > 0;
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

/** Shared integer edges distribute spare pixels to the first rows/columns. */
function edges(size: number, count: number): number[] {
  const base = Math.floor(size / count), remainder = size % count;
  return Array.from({ length: count + 1 }, (_, index) => index * base + Math.min(index, remainder));
}

/** Pure rectangular V1: no decoding, network, raster copies, shuffle or snapping. */
export function generateImagePieces({ id, image, rows, columns }: {
  readonly id: string; readonly image: JigsawImage; readonly rows: number; readonly columns: number;
}): JigsawImagePieces {
  if (!image || !text(image.src) || !text(image.alt) || !positiveInteger(image.width) || !positiveInteger(image.height)) {
    throw new TypeError("An image needs a source, description and positive integer pixel dimensions.");
  }
  if (!positiveInteger(rows) || !positiveInteger(columns) || rows * columns > MAX_JIGSAW_PIECES
    || rows > image.height || columns > image.width) {
    throw new RangeError("The grid must fit the image with at least one pixel per piece.");
  }
  const x = edges(image.width, columns), y = edges(image.height, rows);
  const pieces = Object.freeze(Array.from({ length: rows * columns }, (_, index) => {
    const row = Math.floor(index / columns), column = index % columns;
    const key = `${rows}x${columns}-${row}-${column}`;
    return Object.freeze({ id: `piece-${key}`, targetId: `target-${key}`, row, column,
      source: Object.freeze({ x: x[column], y: y[row], width: x[column + 1] - x[column], height: y[row + 1] - y[row] }),
    });
  }));
  // Use the same validation and logical identity contract as TASK 020.
  const definition = createJigsawState({ id, pieces }).definition;
  return Object.freeze({ definition, image: Object.freeze({ src: image.src, alt: image.alt, width: image.width, height: image.height }), rows, columns, pieces });
}
