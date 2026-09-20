import { createBoard, type BlockBoard, type BoardPosition } from "./board";
import { canPlace, clear, place, type BlockPiece } from "./boardOperations";
import { createPieceGenerator, nextPiece, type PieceGeneratorState } from "./pieceGenerator";

export const classicSizes = [5, 6, 8] as const;
export interface ClassicConfig { readonly seed?: number; readonly size?: number; readonly pieceSet?: "baby" }
export interface ClassicState {
  readonly board: BlockBoard;
  readonly tray: readonly BlockPiece[];
  readonly generator: PieceGeneratorState;
  readonly moves: number;
  readonly lines: number;
}

function deal(generator: PieceGeneratorState) {
  const tray: BlockPiece[] = [];
  for (let i = 0; i < 3; i++) {
    const next = nextPiece(generator);
    tray.push(next.piece); generator = next.state;
  }
  return { tray: Object.freeze(tray), generator };
}

/** Five is the compact default; larger boards retain the same placement rules. */
export function createClassicGame(config: ClassicConfig = {}): ClassicState {
  const size = config.size ?? 5;
  if (config.pieceSet === "baby" && size !== 5) throw new RangeError("Baby mode uses a 5 by 5 board");
  if (!classicSizes.some((value) => value === size)) throw new RangeError("Unsupported Classic size");
  const board = createBoard({ rows: size, columns: size });
  return Object.freeze({ board, ...deal(createPieceGenerator(config.seed ?? 1, board, config.pieceSet)), moves: 0, lines: 0 });
}

/** A rejected placement consumes neither the piece nor the random stream. */
export function playClassicPiece(state: ClassicState, id: string, origin: BoardPosition): ClassicState {
  const piece = state.tray.find((item) => item.id === id);
  if (!piece || !canPlace(state.board, piece, origin)) return state;
  const cleared = clear(place(state.board, piece, origin));
  const tray = Object.freeze(state.tray.filter((item) => item.id !== id));
  return Object.freeze({
    board: cleared.board,
    ...(tray.length ? { tray, generator: state.generator } : deal(state.generator)),
    moves: state.moves + 1, lines: state.lines + cleared.rows.length + cleared.columns.length,
  });
}

export function hasClassicMove(state: ClassicState): boolean {
  return state.tray.some((piece) => state.board.cells.some((_, index) =>
    canPlace(state.board, piece, { row: Math.floor(index / state.board.columns), column: index % state.board.columns })));
}
