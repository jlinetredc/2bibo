import { createBoard, type BlockBoard, type BoardPosition } from "./board";
import { canPlace, place, remove, type BlockPiece } from "./boardOperations";

export const shapeTargets = Object.freeze([
  { id: "heart", name: "Trái tim", icon: "♥", pattern: [".#.#.", "#####", "#####", ".###.", "..#.."] },
  { id: "star", name: "Ngôi sao", icon: "★", pattern: ["..#..", "#####", ".###.", ".###.", ".#.#."] },
  { id: "fish", name: "Cá", icon: "🐟", pattern: ["#.##.", "####.", ".####", "####.", "#.##."] },
  { id: "rocket", name: "Tên lửa", icon: "🚀", pattern: ["..#..", ".###.", ".###.", "#####", "#.#.#"] },
  { id: "house", name: "Ngôi nhà", icon: "⌂", pattern: ["..#..", ".###.", "#####", "#####", "##.##"] },
].map((target) => Object.freeze({ ...target, pattern: Object.freeze(target.pattern) })));

// Reusable palette, not a finite puzzle set. A single cell guarantees every
// remaining silhouette cell can be filled without a solver or random generation.
export const fillPieces: readonly BlockPiece[] = Object.freeze([
  { id: "single", cells: [{ row: 0, column: 0 }] },
  { id: "horizontal", cells: [{ row: 0, column: 0 }, { row: 0, column: 1 }] },
  { id: "vertical", cells: [{ row: 0, column: 0 }, { row: 1, column: 0 }] },
].map((piece) => Object.freeze({ ...piece, cells: Object.freeze(piece.cells.map((cell) => Object.freeze(cell))) })));

export interface ShapeFillConfig { readonly targetId?: string }
export interface ShapeFillResult { readonly targetId: string; readonly filledCells: number }
export interface ShapeFillState {
  readonly targetId: string;
  readonly mask: readonly boolean[];
  readonly board: BlockBoard;
  readonly history: readonly string[];
  readonly nextId: number;
}

export function createShapeFill(targetId = "heart"): ShapeFillState {
  const target = shapeTargets.find((item) => item.id === targetId);
  if (!target) throw new RangeError(`Unknown silhouette: ${targetId}`);
  return Object.freeze({ targetId, mask: Object.freeze(target.pattern.flatMap((row) => [...row].map((cell) => cell === "#"))),
    board: createBoard({ rows: 5, columns: 5 }), history: Object.freeze([]), nextId: 0 });
}

export function isShapeFilled(state: ShapeFillState): boolean {
  return state.mask.every((target, index) => !target || state.board.cells[index] !== null);
}

function instance(state: ShapeFillState, pieceId: string): BlockPiece | undefined {
  const template = fillPieces.find((piece) => piece.id === pieceId);
  return template && { ...template, id: `fill-${state.nextId}` };
}

export function canFillShape(state: ShapeFillState, pieceId: string, origin: BoardPosition): boolean {
  const piece = instance(state, pieceId);
  return !!piece && canPlace(state.board, piece, origin) && piece.cells.every((offset) =>
    state.mask[(origin.row + offset.row) * state.board.columns + origin.column + offset.column]);
}

export function placeShapePiece(state: ShapeFillState, pieceId: string, origin: BoardPosition): ShapeFillState {
  if (!canFillShape(state, pieceId, origin)) return state;
  const piece = instance(state, pieceId)!;
  return Object.freeze({ ...state, board: place(state.board, piece, origin),
    history: Object.freeze([...state.history, piece.id]), nextId: state.nextId + 1 });
}

/** Remove the entire last placement. Full rows remain filled in this mode. */
export function undoShapePiece(state: ShapeFillState): ShapeFillState {
  const last = state.history[state.history.length - 1];
  if (!last) return state;
  return Object.freeze({ ...state, board: remove(state.board, last), history: Object.freeze(state.history.slice(0, -1)) });
}
