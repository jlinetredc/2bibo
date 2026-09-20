import { createLocalStorageStore } from "@/game-core/persistence/localStorage";
import { createVersionedStore } from "@/game-core/persistence/store";
import { createBoard } from "./domain/board";
import { canPlace, clear } from "./domain/boardOperations";
import { classicSizes, createClassicGame, type ClassicState } from "./domain/classic";
import { nextPiece } from "./domain/pieceGenerator";
import { createShapeFill, type ShapeFillState } from "./domain/shapeFill";
import { createPuzzleState, placePuzzlePiece, type PuzzleState } from "./domain/puzzle";
import { getBlockPuzzle } from "./data/puzzles";

export type BlocksVariant = "classic" | "shape-fill" | "puzzle";
export interface BlocksProgress {
  hintsEnabled?: boolean;
  tutorialSeen?: boolean;
  variant: BlocksVariant;
  classic: ClassicState;
  shape: ShapeFillState;
  puzzle: PuzzleState;
}
export interface SessionProps<T> {
  hintsEnabled?: boolean;
  initialState?: T;
  onStateChange?: (state: T) => void;
  onFeedback?: (kind: "place" | "celebrate") => void;
}
export function freshBlocksProgress(): BlocksProgress {
  return { variant: "classic", tutorialSeen: false, classic: createClassicGame({ pieceSet: "baby" }), shape: createShapeFill(), puzzle: createPuzzleState(getBlockPuzzle()) };
}

const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const integer = (value: number) => Number.isSafeInteger(value) && value >= 0;
function validClassic(state: ClassicState): boolean {
  if (!state || !classicSizes.some((size) => size === state.board.rows) || state.board.columns !== state.board.rows
    || state.generator.rows !== state.board.rows || state.generator.columns !== state.board.columns
    || !integer(state.moves) || !integer(state.lines) || !Array.isArray(state.tray) || state.tray.length < 1 || state.tray.length > 3) return false;
  const board = createBoard(state.board);
  nextPiece(state.generator); // Validate version, seed and sequence bounds.
  if (state.generator.pieceSet === "baby" && board.rows !== 5) return false;
  const count = state.generator.nextId;
  if (count < 3 || count % 3 || state.moves !== count - state.tray.length || state.lines > state.moves * 10 || clear(board).clearedCells) return false;
  const ids = new Set<string>();
  // Reconstruct the last three generated pieces from the invertible version-1
  // LCG, so a tampered tray cannot change the continuation after reload.
  let priorRandom = state.generator.randomState;
  for (let i = 0; i < 3; i++) priorRandom = Math.imul(4276115653, priorRandom - 1013904223) >>> 0;
  let prior = { ...state.generator, randomState: priorRandom, nextId: count - 3 };
  const batch = [];
  for (let i = 0; i < 3; i++) { const next = nextPiece(prior); batch.push(next.piece); prior = next.state; }
  for (const piece of state.tray) {
    const id = Number(piece.id.slice(6));
    if (piece.id !== `block-${id}` || !integer(id) || id < count - 3 || id >= count || ids.has(piece.id)
      || !canPlace(createBoard({ rows: board.rows, columns: board.columns }), piece, { row: 0, column: 0 })
      || !equal(piece, batch.find((item) => item.id === piece.id))) return false;
    ids.add(piece.id);
  }
  return board.cells.every((cell) => {
    if (cell === null) return true;
    const id = Number(cell.slice(6));
    return cell === `block-${id}` && integer(id) && id < count && !ids.has(cell);
  });
}
function validShape(state: ShapeFillState): boolean {
  const empty = createShapeFill(state.targetId);
  const board = createBoard(state.board);
  if (board.rows !== 5 || board.columns !== 5 || !equal(empty.mask, state.mask) || !integer(state.nextId)
    || !Array.isArray(state.history) || state.history.length > 25 || new Set(state.history).size !== state.history.length) return false;
  let previous = -1;
  for (const id of state.history) {
    const sequence = Number(id.slice(5));
    if (id !== `fill-${sequence}` || !integer(sequence) || sequence <= previous || sequence >= state.nextId) return false;
    previous = sequence;
    const indices = board.cells.flatMap((cell, index) => cell === id ? [index] : []);
    if (indices.length < 1 || indices.length > 2) return false;
    if (indices.length === 2 && !(indices[1] - indices[0] === 5
      || (indices[1] - indices[0] === 1 && Math.floor(indices[0] / 5) === Math.floor(indices[1] / 5)))) return false;
  }
  return board.cells.every((cell, index) => cell === null || (empty.mask[index] && state.history.includes(cell)));
}
function validPuzzle(state: PuzzleState): boolean {
  const definition = getBlockPuzzle(state.definition.id);
  if (!equal(state.definition, definition) || !Array.isArray(state.placements) || state.placements.length > definition.pieces.length) return false;
  let restored = createPuzzleState(definition);
  for (const move of state.placements) {
    const next = placePuzzlePiece(restored, move.pieceId, move.origin);
    if (next === restored) return false;
    restored = next;
  }
  return equal(restored.board, state.board);
}
export function isBlocksProgress(value: unknown): value is BlocksProgress {
  try {
    const data = value as BlocksProgress;
    return !!data && (data.hintsEnabled === undefined || typeof data.hintsEnabled === "boolean")
      && (data.tutorialSeen === undefined || typeof data.tutorialSeen === "boolean") && ["classic", "shape-fill", "puzzle"].includes(data.variant)
      && validClassic(data.classic) && validShape(data.shape) && validPuzzle(data.puzzle);
  } catch { return false; }
}
const store = createVersionedStore(createLocalStorageStore(), { version: 1, validate: isBlocksProgress });
/** Guest and each local profile have independent small snapshots, never nicknames. */
export const blocksProgressKey = (profileId: string | null) => profileId === null ? "blocks:guest" : `blocks:profile:${profileId}`;
export const loadBlocksProgress = (profileId: string | null) => store.get(blocksProgressKey(profileId));
export const saveBlocksProgress = (profileId: string | null, data: BlocksProgress) => store.set(blocksProgressKey(profileId), data);
