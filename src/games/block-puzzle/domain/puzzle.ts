import { createBoard, type BlockBoard, type BoardPosition } from "./board";
import { canPlace, place, remove, type BlockPiece } from "./boardOperations";

export interface PuzzleDefinition {
  readonly id: string; readonly rows: number; readonly columns: number;
  readonly pieces: readonly BlockPiece[];
}
export interface PuzzlePlacement { readonly pieceId: string; readonly origin: BoardPosition }
export interface PuzzleState {
  readonly definition: PuzzleDefinition; readonly board: BlockBoard;
  readonly placements: readonly PuzzlePlacement[];
}
export type PuzzleSolveResult =
  | { readonly status: "solved"; readonly placements: readonly PuzzlePlacement[] }
  | { readonly status: "unsolvable" | "limit" | "invalid" };

/** Small fixed-orientation puzzles only. Copy and freeze content at its boundary. */
export function definePuzzle(input: PuzzleDefinition): PuzzleDefinition {
  const board = createBoard(input);
  if (!input.id.trim() || board.rows > 5 || board.columns > 5 || input.pieces.length < 1 || input.pieces.length > 8) {
    throw new RangeError("Puzzle requires an ID, at most 5×5 cells and 1–8 pieces.");
  }
  const ids = new Set<string>();
  const pieces = input.pieces.map((piece) => {
    if (ids.has(piece.id) || !canPlace(board, piece, { row: 0, column: 0 })) throw new RangeError("Invalid puzzle piece.");
    ids.add(piece.id);
    return Object.freeze({ id: piece.id, cells: Object.freeze(piece.cells.map((cell) => Object.freeze({ ...cell }))) });
  });
  if (pieces.reduce((total, piece) => total + piece.cells.length, 0) !== board.cells.length) {
    throw new RangeError("Puzzle pieces must cover exactly the board area.");
  }
  return Object.freeze({ id: input.id, rows: board.rows, columns: board.columns, pieces: Object.freeze(pieces) });
}

function replay(definition: PuzzleDefinition, placements: readonly PuzzlePlacement[]): BlockBoard | null {
  let board = createBoard(definition);
  for (const move of placements) {
    const piece = definition.pieces.find((item) => item.id === move.pieceId);
    if (!piece || !canPlace(board, piece, move.origin)) return null;
    board = place(board, piece, move.origin);
  }
  return board;
}

/** Independent of the solver: checks any complete legal arrangement, not one answer. */
export function checkPuzzleSolution(definition: PuzzleDefinition, placements: readonly PuzzlePlacement[]): boolean {
  const board = replay(definition, placements);
  return placements.length === definition.pieces.length && !!board && board.cells.every((cell) => cell !== null);
}

/** Exact-cover search: cover the first empty cell, backtrack, preserve prior moves.
 * A bounded search returns `limit`, never a false claim of impossibility. */
export function solvePuzzle(definition: PuzzleDefinition, placements: readonly PuzzlePlacement[] = [], maxNodes = 10000): PuzzleSolveResult {
  definition = definePuzzle(definition);
  if (!Number.isSafeInteger(maxNodes) || maxNodes < 1 || maxNodes > 10000) throw new RangeError("Invalid search budget.");
  const board = replay(definition, placements);
  if (!board) return { status: "invalid" };
  let nodes = 0, limited = false;
  const dead = new Set<string>();
  function search(current: BlockBoard, remaining: readonly BlockPiece[]): PuzzlePlacement[] | null {
    if (++nodes > maxNodes) { limited = true; return null; }
    const index = current.cells.indexOf(null);
    if (index === -1) return remaining.length === 0 ? [] : null;
    const key = `${current.cells.map((cell) => cell === null ? "0" : "1").join("")}:${JSON.stringify(remaining.map((piece) => piece.id))}`;
    if (dead.has(key)) return null;
    const row = Math.floor(index / current.columns), column = index % current.columns;
    for (const piece of remaining) {
      for (const offset of piece.cells) {
        const origin = { row: row - offset.row, column: column - offset.column };
        if (!canPlace(current, piece, origin)) continue;
        const rest = search(place(current, piece, origin), remaining.filter((item) => item.id !== piece.id));
        if (rest) return [{ pieceId: piece.id, origin }, ...rest];
        if (limited) return null;
      }
    }
    dead.add(key); return null;
  }
  const used = new Set(placements.map((move) => move.pieceId));
  const answer = search(board, definition.pieces.filter((piece) => !used.has(piece.id)));
  return answer ? { status: "solved", placements: Object.freeze([...placements, ...answer].map((move) =>
    Object.freeze({ pieceId: move.pieceId, origin: Object.freeze({ ...move.origin }) }))) }
    : { status: limited ? "limit" : "unsolvable" };
}

/** Never present content that has not been proven solvable. */
export function createPuzzleState(input: PuzzleDefinition): PuzzleState {
  const definition = definePuzzle(input);
  if (solvePuzzle(definition).status !== "solved") throw new RangeError("Puzzle has no verified solution.");
  return Object.freeze({ definition, board: createBoard(definition), placements: Object.freeze([]) });
}

export function placePuzzlePiece(state: PuzzleState, pieceId: string, origin: BoardPosition): PuzzleState {
  const piece = state.definition.pieces.find((item) => item.id === pieceId);
  if (!piece || !canPlace(state.board, piece, origin)) return state;
  return Object.freeze({ ...state, board: place(state.board, piece, origin), placements: Object.freeze([
    ...state.placements, Object.freeze({ pieceId, origin: Object.freeze({ ...origin }) }),
  ]) });
}

export function undoPuzzlePiece(state: PuzzleState): PuzzleState {
  const last = state.placements[state.placements.length - 1];
  return last ? Object.freeze({ ...state, board: remove(state.board, last.pieceId),
    placements: Object.freeze(state.placements.slice(0, -1)) }) : state;
}
