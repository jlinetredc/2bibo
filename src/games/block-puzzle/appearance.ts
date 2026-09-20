import type { CSSProperties } from "react";
import type { BlockBoard } from "./domain/board";

const colors = ["#f3cc38", "#45bce8", "#a866e3", "#7dce42", "#ef8740", "#e95972"];

/** Presentation only: stable across reloads without changing saved game data. */
export function blockStyle(id: string): CSSProperties {
  const palette = { single: 0, horizontal: 1, vertical: 2 };
  const index = id in palette ? palette[id as keyof typeof palette]
    : [...id].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 0) % colors.length;
  return { "--block-color": colors[index] } as CSSProperties;
}

export function fillColorKey(board: BlockBoard, id: string): string {
  const first = board.cells.indexOf(id), last = board.cells.lastIndexOf(id);
  return first === last ? "single" : last - first === 1 ? "horizontal" : "vertical";
}
