import { createBoard, type BoardPosition } from "./board";
import type { BlockPiece } from "./boardOperations";

// Version-1 order is part of the replay contract. Each orientation is an entry.
const shapes = [
  [[0, 0]],
  [[0, 0], [0, 1]],
  [[0, 0], [1, 0]],
  [[0, 0], [0, 1], [0, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 0], [1, 0], [1, 1]],
  [[0, 1], [1, 0], [1, 1]],
  [[0, 0], [0, 1], [1, 0]],
  [[0, 0], [0, 1], [1, 1]],
  [[0, 0], [0, 1], [1, 0], [1, 1]],
].map((shape) => Object.freeze(shape.map(([row, column]) => Object.freeze({ row, column }))));
const catalogue: readonly (readonly BoardPosition[])[] = Object.freeze(shapes);

export interface PieceGeneratorState {
  readonly version: 1;
  readonly rows: number;
  readonly columns: number;
  readonly randomState: number;
  readonly nextId: number;
  readonly pieceSet?: "baby";
}

function validate(state: PieceGeneratorState) {
  if (state.pieceSet !== undefined && state.pieceSet !== "baby") throw new RangeError("Unsupported piece set.");
  if (state.version !== 1) throw new RangeError("Unsupported piece generator version.");
  if (!Number.isInteger(state.randomState) || state.randomState < 0 || state.randomState > 0xffffffff) {
    throw new RangeError("Generator seed/state must be an unsigned 32-bit integer.");
  }
  if (!Number.isSafeInteger(state.nextId) || state.nextId < 0) throw new RangeError("Invalid next piece ID.");
  createBoard({ rows: state.rows, columns: state.columns });
}

/** One stream per board/session. Seed zero is valid; no clock or global random source. */
export function createPieceGenerator(seed: number, dimensions: { readonly rows: number; readonly columns: number }, pieceSet?: "baby"): PieceGeneratorState {
  const state = { version: 1 as const, rows: dimensions.rows, columns: dimensions.columns, randomState: seed, nextId: 0, ...(pieceSet ? { pieceSet } : {}) };
  validate(state);
  return Object.freeze(state);
}

/** Pure transition. Fit means board dimensions, not current occupancy or solvability. */
export function nextPiece(state: PieceGeneratorState): Readonly<{ piece: BlockPiece; state: PieceGeneratorState }> {
  validate(state);
  if (state.nextId === Number.MAX_SAFE_INTEGER) throw new RangeError("Piece ID sequence exhausted.");
  const source = state.pieceSet === "baby" ? [catalogue[2], catalogue[0], catalogue[1]] : catalogue;
  const eligible = source.filter((shape) => shape.every(({ row, column }) => row < state.rows && column < state.columns));
  // 32-bit LCG; fixed arithmetic and catalogue order keep version-1 replays stable.
  const randomState = (Math.imul(1664525, state.randomState) + 1013904223) >>> 0;
  const cells = eligible[Math.floor((randomState / 0x100000000) * eligible.length)];
  const piece = Object.freeze({ id: `block-${state.nextId}`, cells });
  const following = Object.freeze({ ...state, randomState, nextId: state.nextId + 1 });
  return Object.freeze({ piece, state: following });
}
