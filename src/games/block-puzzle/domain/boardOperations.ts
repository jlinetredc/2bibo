import { createBoard, isWithinBoard, type BlockBoard, type BoardPosition } from "./board";

/** Occupied offsets from the placement origin; no rotation or generation here. */
export interface BlockPiece {
  readonly id: string;
  readonly cells: readonly BoardPosition[];
}

function validId(id: string): boolean { return typeof id === "string" && id.trim().length > 0; }

function placementIndices(board: BlockBoard, piece: BlockPiece, origin: BoardPosition): number[] | null {
  if (!validId(piece.id) || board.cells.includes(piece.id) || !isWithinBoard(board, origin)
    || !Array.isArray(piece.cells) || piece.cells.length === 0 || piece.cells.length > board.cells.length) return null;
  const indices = new Set<number>();
  for (const offset of piece.cells) {
    if (!offset || !Number.isSafeInteger(offset.row) || !Number.isSafeInteger(offset.column)
      || offset.row < 0 || offset.column < 0) return null;
    const position = { row: origin.row + offset.row, column: origin.column + offset.column };
    if (!isWithinBoard(board, position)) return null;
    const index = position.row * board.columns + position.column;
    if (indices.has(index) || board.cells[index] !== null) return null;
    indices.add(index);
  }
  return [...indices];
}

/** False for invalid shape/ID, reused ID, overlap or out-of-bounds placement. */
export function canPlace(board: BlockBoard, piece: BlockPiece, origin: BoardPosition): boolean {
  return placementIndices(board, piece, origin) !== null;
}

/** Atomic placement: a rejected move never changes the source board. */
export function place(board: BlockBoard, piece: BlockPiece, origin: BoardPosition): BlockBoard {
  const indices = placementIndices(board, piece, origin);
  if (indices === null) throw new RangeError("Piece cannot be placed at this position.");
  const cells = [...board.cells];
  for (const index of indices) cells[index] = piece.id;
  return createBoard({ ...board, cells });
}

/** Remove all remaining cells of an instance, including remnants after a clear. */
export function remove(board: BlockBoard, pieceId: string): BlockBoard {
  if (!validId(pieceId)) throw new TypeError("Piece ID must be non-blank.");
  if (!board.cells.includes(pieceId)) return board;
  return createBoard({ ...board, cells: board.cells.map((cell) => cell === pieceId ? null : cell) });
}

export interface ClearResult {
  readonly board: BlockBoard;
  readonly rows: readonly number[];
  readonly columns: readonly number[];
  readonly clearedCells: number;
}

/** Detect all full lines before clearing their union; no gravity or auto-scoring. */
export function clear(board: BlockBoard): ClearResult {
  const rows: number[] = [];
  const columns: number[] = [];
  for (let row = 0; row < board.rows; row++) {
    if (board.cells.slice(row * board.columns, (row + 1) * board.columns).every((cell) => cell !== null)) rows.push(row);
  }
  for (let column = 0; column < board.columns; column++) {
    let full = true;
    for (let row = 0; row < board.rows; row++) {
      if (board.cells[row * board.columns + column] === null) { full = false; break; }
    }
    if (full) columns.push(column);
  }
  const rowSet = new Set(rows); const columnSet = new Set(columns);
  let clearedCells = 0;
  const cells = board.cells.map((cell, index) => {
    if (rowSet.has(Math.floor(index / board.columns)) || columnSet.has(index % board.columns)) {
      clearedCells++; return null;
    }
    return cell;
  });
  return Object.freeze({
    board: clearedCells ? createBoard({ ...board, cells }) : board,
    rows: Object.freeze(rows), columns: Object.freeze(columns), clearedCells,
  });
}

/** Empty the board while preserving its dimensions; does not reset a game session. */
export function reset(board: BlockBoard): BlockBoard {
  return createBoard({ rows: board.rows, columns: board.columns });
}
