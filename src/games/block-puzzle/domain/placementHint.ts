import type { BlockBoard, BoardPosition } from "./board";
import { canPlace, type BlockPiece } from "./boardOperations";

/** One nearby complete footprint, never a partial or overlapping placement. */
export function placementHint(board: BlockBoard, piece: BlockPiece | undefined, near?: BoardPosition,
  allowed: (origin: BoardPosition) => boolean = (origin) => !!piece && canPlace(board, piece, origin)): number[] {
  if (!piece) return [];
  const positions = board.cells.map((_, index) => ({ row: Math.floor(index / board.columns), column: index % board.columns }));
  if (near) positions.sort((a, b) => Math.abs(a.row - near.row) + Math.abs(a.column - near.column)
    - Math.abs(b.row - near.row) - Math.abs(b.column - near.column));
  const origin = positions.find(allowed);
  return origin ? piece.cells.map((cell) => (origin.row + cell.row) * board.columns + origin.column + cell.column) : [];
}
