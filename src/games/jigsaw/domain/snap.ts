import type { JigsawImagePieces } from "./imagePieces";
import { canPlaceJigsawPiece, placeJigsawPiece, type JigsawState } from "./jigsaw";

export interface SnapPoint { readonly x: number; readonly y: number }
export interface SnapBoard extends SnapPoint { readonly width: number; readonly height: number }
export interface JigsawSnap {
  readonly pieceId: string;
  readonly targetId: string;
  /** Exact rendered top-left and size, in the same CSS coordinate space as the board. */
  readonly destination: SnapBoard;
}
export interface JigsawSnapInput {
  readonly puzzle: JigsawImagePieces;
  readonly pieceId: string;
  /** Bounds of the rendered image itself, excluding borders/padding. */
  readonly board: SnapBoard;
  /** Rendered piece top-left, NOT the pointer; subtract the original grab offset. */
  readonly origin: SnapPoint;
  /** Inclusive Euclidean radius in CSS pixels. Zero requires exact alignment. */
  readonly radius: number;
}

const finitePoint = (point: SnapPoint) => point && Number.isFinite(point.x) && Number.isFinite(point.y);

/** Pure preview query. Use generated puzzles and constructor-produced states.
 * Invalid transient geometry, stale puzzles and illegal drops fail closed.
 * Recompute with current board bounds after scroll/resize; do not cache a preview as a move.
 */
export function findJigsawSnap(state: JigsawState, input: JigsawSnapInput): JigsawSnap | null {
  const { puzzle, pieceId, board, origin, radius } = input;
  if (!finitePoint(board) || !finitePoint(origin) || !Number.isFinite(board.width) || board.width <= 0
    || !Number.isFinite(board.height) || board.height <= 0 || !Number.isFinite(radius) || radius < 0) return null;
  if (state.definition.id !== puzzle.definition.id || state.definition.pieces.length !== puzzle.pieces.length
    || !puzzle.pieces.every((piece) => state.definition.pieces.some((logical) => logical.id === piece.id && logical.targetId === piece.targetId))) return null;
  const piece = puzzle.pieces.find((candidate) => candidate.id === pieceId);
  if (!piece || !canPlaceJigsawPiece(state, pieceId, piece.targetId)) return null;
  const source = piece.source;
  const destination = {
    x: board.x + (source.x / puzzle.image.width) * board.width,
    y: board.y + (source.y / puzzle.image.height) * board.height,
    width: (source.width / puzzle.image.width) * board.width,
    height: (source.height / puzzle.image.height) * board.height,
  };
  if (!finitePoint(destination) || !Number.isFinite(destination.width) || !Number.isFinite(destination.height)
    || destination.width <= 0 || destination.height <= 0
    || Math.hypot(origin.x - destination.x, origin.y - destination.y) > radius) return null;
  return Object.freeze({ pieceId, targetId: piece.targetId, destination: Object.freeze(destination) });
}

/** Commit only on release, using current state/geometry. Rejection preserves identity.
 * On pointer cancellation the host must discard its preview without calling this.
 * Tap/keyboard alternatives can use the exact-target domain placement API directly.
 */
export function snapJigsawPiece(state: JigsawState, input: JigsawSnapInput): JigsawState {
  const snap = findJigsawSnap(state, input);
  return snap ? placeJigsawPiece(state, snap.pieceId, snap.targetId) : state;
}
