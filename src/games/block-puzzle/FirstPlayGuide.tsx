"use client";
import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import styles from "./FirstPlayGuide.module.css";
import type { BlocksProgress } from "./progress";
import { placementHint } from "./domain/placementHint";
import { canFillShape, fillPieces } from "./domain/shapeFill";

/** Visual-only demonstration; never selects, moves, scores or consumes a piece. */
export function FirstPlayGuide({ root, data, onDismiss }: { root: RefObject<HTMLDivElement | null>; data: BlocksProgress; onDismiss: () => void }) {
  const piece = data.variant === "classic" ? data.classic.tray[0] : data.variant === "shape-fill" ? fillPieces[0]
    : data.puzzle.definition.pieces.find((item) => !data.puzzle.placements.some((move) => move.pieceId === item.id));
  const board = data.variant === "classic" ? data.classic.board : data.variant === "shape-fill" ? data.shape.board : data.puzzle.board;
  const footprint = placementHint(board, piece, undefined, data.variant === "shape-fill" ? (origin) => canFillShape(data.shape, piece!.id, origin) : undefined);
  // The first cell of a piece need not be its top-left origin.
  const index = footprint[0];
  const selector = data.variant === "classic" ? "data-cell" : data.variant === "shape-fill" ? "data-fill-cell" : "data-puzzle-cell";
  const [path, setPath] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    function measure() {
      const piece = node!.querySelector("[data-blocks-tray] button"), cell = index === undefined ? null : node!.querySelector(`[${selector}="${index}"]`);
      if (!piece || !cell) { setPath(null); return; }
      const from = piece.getBoundingClientRect(), to = cell.getBoundingClientRect(), base = node!.getBoundingClientRect();
      setPath({ x: from.left + from.width / 2 - base.left, y: from.top + from.height / 2 - base.top,
        dx: to.left + to.width / 2 - from.left - from.width / 2, dy: to.top + to.height / 2 - from.top - from.height / 2 });
    }
    const observer = new MutationObserver(measure), resize = new ResizeObserver(measure);
    observer.observe(node, { childList: true, subtree: true }); resize.observe(node);
    window.addEventListener("resize", measure); measure();
    return () => { observer.disconnect(); resize.disconnect(); window.removeEventListener("resize", measure); };
  }, [root, index, selector]);
  return <div data-first-play-guide className={styles.guide}>
    {path && piece && <span aria-hidden="true" className={styles.hand} style={{ left: path.x, top: path.y, "--dx": `${path.dx}px`, "--dy": `${path.dy}px` } as CSSProperties}>
      <span className={styles.example}>{piece.cells.map((cell) => <span key={`${cell.row}-${cell.column}`} className={styles.block} style={{ gridRow: cell.row + 1, gridColumn: cell.column + 1 }} />)}</span>☝️</span>}
    <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Đóng hướng dẫn">☝️ Kéo khối vào bàn <span aria-hidden="true">×</span></button>
  </div>;
}
