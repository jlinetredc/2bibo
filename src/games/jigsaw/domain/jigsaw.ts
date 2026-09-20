/** Logical identity only. Image crops and snap geometry belong to later tasks. */
export interface JigsawPiece {
  readonly id: string;
  readonly targetId: string;
}

export interface JigsawDefinition {
  readonly id: string;
  readonly pieces: readonly JigsawPiece[];
}

export interface JigsawPlacement {
  readonly pieceId: string;
  readonly targetId: string;
}

export interface JigsawState {
  readonly definition: JigsawDefinition;
  /** Only committed correct placements; a lifted/dragging piece is UI state. */
  readonly placements: readonly JigsawPlacement[];
}

/** Allocation guard, not an age preset or a selected gameplay piece count. */
export const MAX_JIGSAW_PIECES = 256;
const validId = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.trim() === value;

/** Copies and freezes caller-owned definitions/snapshots. Invalid input throws. */
export function createJigsawState(definition: JigsawDefinition, placements: readonly JigsawPlacement[] = []): JigsawState {
  if (!definition || !validId(definition.id) || !Array.isArray(definition.pieces)
    || definition.pieces.length < 1 || definition.pieces.length > MAX_JIGSAW_PIECES) {
    throw new RangeError("A jigsaw needs an ID and a non-empty bounded piece list.");
  }
  const pieceIds = new Set<string>(), targetIds = new Set<string>();
  // Array.from exposes sparse entries so missing pieces cannot slip validation.
  const pieces = Array.from(definition.pieces, (piece) => {
    if (!piece || !validId(piece.id) || !validId(piece.targetId) || pieceIds.has(piece.id) || targetIds.has(piece.targetId)) {
      throw new TypeError("Each piece and its target must have a unique non-blank ID.");
    }
    pieceIds.add(piece.id); targetIds.add(piece.targetId);
    return Object.freeze({ id: piece.id, targetId: piece.targetId });
  });
  if (!Array.isArray(placements) || placements.length > pieces.length) throw new RangeError("Invalid placement list.");
  const placed = new Set<string>();
  const snapshot = Array.from(placements, (move) => {
    if (!move || !pieces.some((piece) => piece.id === move.pieceId && piece.targetId === move.targetId) || placed.has(move.pieceId)) {
      throw new TypeError("Placements must match distinct pieces and their own targets.");
    }
    placed.add(move.pieceId);
    return Object.freeze({ pieceId: move.pieceId, targetId: move.targetId });
  });
  return Object.freeze({
    definition: Object.freeze({ id: definition.id, pieces: Object.freeze(pieces) }),
    placements: Object.freeze(snapshot),
  });
}

/** Queries/transitions accept states produced by this module. No proximity test. */
export function canPlaceJigsawPiece(state: JigsawState, pieceId: string, targetId: string): boolean {
  return state.definition.pieces.some((piece) => piece.id === pieceId && piece.targetId === targetId)
    && !state.placements.some((move) => move.pieceId === pieceId || move.targetId === targetId);
}

/** Invalid drops are no-ops: no piece is consumed, moved or penalized. */
export function placeJigsawPiece(state: JigsawState, pieceId: string, targetId: string): JigsawState {
  if (!canPlaceJigsawPiece(state, pieceId, targetId)) return state;
  return Object.freeze({ ...state, placements: Object.freeze([
    ...state.placements, Object.freeze({ pieceId, targetId }),
  ]) });
}

/** Explicit removal supports a future undo/retry action, including after completion. */
export function removeJigsawPiece(state: JigsawState, pieceId: string): JigsawState {
  if (!state.placements.some((move) => move.pieceId === pieceId)) return state;
  return Object.freeze({ ...state, placements: Object.freeze(state.placements.filter((move) => move.pieceId !== pieceId)) });
}

export function resetJigsaw(state: JigsawState): JigsawState {
  return state.placements.length ? Object.freeze({ ...state, placements: Object.freeze([]) }) : state;
}

/** Derived from committed state; no timer, effects or once-only UI callbacks here. */
export function isJigsawComplete(state: JigsawState): boolean {
  return state.placements.length === state.definition.pieces.length;
}
