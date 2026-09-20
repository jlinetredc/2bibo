"use client";
import { blockStyle } from "./appearance";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { attachPointerDrag, type DragSample } from "@/game-core/input/pointerDrag";
import type { BlockPiece } from "./domain/boardOperations";
import styles from "./ClassicGame.module.css";
export const touchLift = 56;
const aim = (sample: DragSample): DragSample => sample.pointerType === "mouse" ? sample : {
  ...sample, position: { x: sample.position.x, y: sample.position.y - touchLift },
};
export function Piece({ piece, number, selected, onSelect, onDrag, onDrop, onCancel }: {
  piece: BlockPiece; number: number; selected: boolean; onSelect: () => void;
  onDrag: (sample: DragSample) => void; onDrop: (sample: DragSample) => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const callbacks = useRef({ onSelect, onDrag, onDrop, onCancel });
  const suppressClick = useRef(false);
  const [ghost, setGhost] = useState<DragSample | null>(null);
  useEffect(() => { callbacks.current = { onSelect, onDrag, onDrop, onCancel }; });
  useEffect(() => {
    let moved = false;
    const drag = attachPointerDrag(ref.current!, {
      onStart: () => { moved = false; suppressClick.current = false; callbacks.current.onSelect(); },
      onMove: (sample) => {
        if (Math.hypot(sample.delta.x, sample.delta.y) > 8) moved = true;
        if (moved) { setGhost(sample); callbacks.current.onDrag(aim(sample)); }
      },
      onEnd: (sample) => {
        suppressClick.current = moved;
        setGhost(null);
        if (moved) callbacks.current.onDrop(aim(sample));
      },
      onCancel: () => { setGhost(null); suppressClick.current = true; callbacks.current.onCancel(); },
    });
    const cancel = () => drag.cancel();
    window.addEventListener("resize", cancel);
    return () => { window.removeEventListener("resize", cancel); drag.destroy(); };
  }, []);
  return <><button ref={ref} className={styles.piece} type="button" aria-label={`Khối ${number}, ${piece.cells.length} ô`}
    aria-pressed={selected} onClick={(event) => {
      if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
      onSelect();
    }}>
    <span aria-hidden="true" className={styles.shape} style={{ ...blockStyle(piece.id), gridTemplateColumns: `repeat(${Math.max(...piece.cells.map((c) => c.column)) + 1}, 18px)` }}>
      {piece.cells.map((cell) => <span key={`${cell.row}-${cell.column}`} className={styles.tile}
        style={{ gridRow: cell.row + 1, gridColumn: cell.column + 1 }} />)}
    </span>
    <span aria-hidden="true">{selected ? "✓ " : ""}Khối {number}</span>
  </button>{ghost && createPortal(<div aria-hidden="true" data-drag-ghost className={styles.ghost}
    style={{ left: Math.max(44, Math.min(window.innerWidth - 44, ghost.position.x)), top: Math.max(80, ghost.pointerType === "mouse" ? ghost.position.y - 28 : aim(ghost).position.y), transform: ghost.pointerType === "mouse" ? undefined : "translate(-50%, -50%)" }}>
    <span className={styles.shape} style={{ ...blockStyle(piece.id), gridTemplateColumns: `repeat(${Math.max(...piece.cells.map((cell) => cell.column)) + 1}, 18px)` }}>
      {piece.cells.map((cell) => <span key={`${cell.row}-${cell.column}`} className={styles.tile}
        style={{ gridRow: cell.row + 1, gridColumn: cell.column + 1 }} />)}
    </span>
  </div>, document.body)}</>;
}
