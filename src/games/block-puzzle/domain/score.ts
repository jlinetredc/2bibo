import type { ClassicState } from "./classic";
import type { BlockBoard } from "./board";

export function classicScore(state: Pick<ClassicState, "moves" | "lines">): number {
  return state.moves * 10 + state.lines * 50;
}

/** Score represents current progress, so undo/replay cannot farm points. */
export function fillScore(board: BlockBoard, complete: boolean): number {
  return board.cells.filter((cell) => cell !== null).length * 10 + (complete ? 100 : 0);
}
