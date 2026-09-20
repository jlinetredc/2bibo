/** Null is empty; an occupied cell stores a non-blank block/piece identifier. */
export type BlockCell = string | null;

export interface BoardPosition {
  readonly row: number;
  readonly column: number;
}

export interface BlockBoard {
  readonly rows: number;
  readonly columns: number;
  /** Row-major order: index = row * columns + column. */
  readonly cells: readonly BlockCell[];
}

/** Allocation guard, not a gameplay size or age-based difficulty rule. */
export const MAX_BOARD_CELLS = 4096;

export interface BoardInput {
  readonly rows: number;
  readonly columns: number;
  /** Optional initial snapshot; omitted means an empty rectangular board. */
  readonly cells?: readonly BlockCell[];
}

/** Pure construction; copies and freezes state without retaining caller arrays. */
export function createBoard({ rows, columns, cells }: BoardInput): BlockBoard {
  if (!Number.isSafeInteger(rows) || !Number.isSafeInteger(columns) || rows < 1 || columns < 1) {
    throw new RangeError("Board dimensions must be positive safe integers.");
  }
  const count = rows * columns;
  if (!Number.isSafeInteger(count) || count > MAX_BOARD_CELLS) {
    throw new RangeError(`Board must contain at most ${MAX_BOARD_CELLS} cells.`);
  }
  if (cells !== undefined && (!Array.isArray(cells) || cells.length !== count)) {
    throw new RangeError("Initial cells must match the board dimensions.");
  }
  const snapshot = cells === undefined ? Array<BlockCell>(count).fill(null) : Array.from(cells);
  for (const cell of snapshot) {
    if (cell !== null && (typeof cell !== "string" || cell.trim().length === 0)) {
      throw new TypeError("A board cell must be null or a non-blank identifier.");
    }
  }
  return Object.freeze({ rows, columns, cells: Object.freeze(snapshot) });
}

/** Coordinates are zero-based; fractions and non-finite values are outside. */
export function isWithinBoard(board: BlockBoard, { row, column }: BoardPosition): boolean {
  return Number.isInteger(row) && Number.isInteger(column)
    && row >= 0 && row < board.rows && column >= 0 && column < board.columns;
}

/** Out-of-bounds is an error, never an empty cell. Accepts a constructed board. */
export function getCell(board: BlockBoard, position: BoardPosition): BlockCell {
  if (!isWithinBoard(board, position)) throw new RangeError("Position is outside the board.");
  return board.cells[position.row * board.columns + position.column];
}
