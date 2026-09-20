"use client";
import { useEffect, useRef, type CSSProperties } from "react";
import { attachPointerDrag, type DragSample } from "@/game-core/input/pointerDrag";
import type { ImagePiece, JigsawImage } from "./domain/imagePieces";
import { JigsawImagePiece } from "./JigsawImagePiece";
import styles from "./JigsawGame.module.css";

export function JigsawDragPiece({ piece, image, number, selected, onSelect, onMove, onDrop, onCancel, style, onNudge }: {
  piece: ImagePiece; image: JigsawImage; number: number; selected: boolean;
  onSelect: () => void; onMove: (sample: DragSample) => void;
  onDrop: (sample: DragSample) => void; onCancel: () => void;
  style?: CSSProperties; onNudge?: (dx: number, dy: number) => void;
}) {
  const button = useRef<HTMLButtonElement>(null), suppress = useRef(false);
  const callbacks = useRef({ onSelect, onMove, onDrop, onCancel });
  useEffect(() => { callbacks.current = { onSelect, onMove, onDrop, onCancel }; });
  useEffect(() => {
    let moved = false;
    const drag = attachPointerDrag(button.current!, {
      onStart: () => { moved = false; suppress.current = false; callbacks.current.onSelect(); },
      onMove: (sample) => {
        if (Math.hypot(sample.delta.x, sample.delta.y) > 8) moved = true;
        if (moved) callbacks.current.onMove(sample);
      },
      onEnd: (sample) => { suppress.current = moved; if (moved) callbacks.current.onDrop(sample); },
      onCancel: () => { suppress.current = true; callbacks.current.onCancel(); },
    });
    const cancel = () => drag.cancel();
    window.addEventListener("resize", cancel);
    window.addEventListener("scroll", cancel, true);
    return () => {
      window.removeEventListener("resize", cancel); window.removeEventListener("scroll", cancel, true);
      drag.destroy();
    };
  }, []);
  return <button ref={button} type="button" style={style} className={styles.piece} aria-label={`Mảnh ${number}`}
    onKeyDown={(event) => {
      const directions: Record<string, [number, number]> = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] };
      if (onNudge && directions[event.key]) { event.preventDefault(); onNudge(...directions[event.key]); }
    }}
    aria-pressed={selected} onClick={(event) => {
      if (suppress.current && event.detail !== 0) { suppress.current = false; return; }
      onSelect();
    }}>
    <span aria-hidden="true"><JigsawImagePiece image={image} piece={piece} interlocking fitted /></span>
    {selected && <span aria-hidden="true" className={styles.selectedMark}>✓</span>}
  </button>;
}
