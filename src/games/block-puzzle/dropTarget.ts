import type { Point } from "@/game-core/input/pointerDrag";
import type { BoardPosition } from "./domain/board";

export interface DropCell { origin: BoardPosition; left: number; right: number; top: number; bottom: number }
/** Only a small edge tolerance: never search the whole board for a distant fit. */
export function nearestDrop(point: Point, cells: DropCell[], allowed: (origin: BoardPosition) => boolean): BoardPosition | null {
  const ranked = cells.map((cell) => ({ cell, distance: Math.hypot(
    Math.max(cell.left - point.x, 0, point.x - cell.right),
    Math.max(cell.top - point.y, 0, point.y - cell.bottom),
  ) })).sort((a, b) => a.distance - b.distance);
  return ranked.find(({ cell, distance }) => distance <= 14 && allowed(cell.origin))?.cell.origin
    ?? ranked.find(({ distance }) => distance === 0)?.cell.origin ?? null;
}

export function boardDropTarget(board: HTMLElement | null, point: Point, columns: number,
  allowed: (origin: BoardPosition) => boolean): BoardPosition | null {
  if (!board) return null;
  const bounds = board.getBoundingClientRect();
  const cells = Array.from(board.children).flatMap((element, index) => {
    const box = element.getBoundingClientRect();
    const left = Math.max(box.left, bounds.left), right = Math.min(box.right, bounds.right);
    const top = Math.max(box.top, bounds.top), bottom = Math.min(box.bottom, bounds.bottom);
    if (right <= left || bottom <= top) return [];
    return [{ origin: { row: Math.floor(index / columns), column: index % columns }, left, right, top, bottom }];
  });
  return nearestDrop(point, cells, allowed);
}
