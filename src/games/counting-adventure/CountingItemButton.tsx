"use client";
import { useEffect, useRef } from "react";
import { attachPointerDrag, type DragSample } from "@/game-core/input/pointerDrag";
import type { CountingItem } from "./domain/counting";
import styles from "./CountingGame.module.css";

export function CountingItemButton({ item, placed, disabled, onTap, onMove, onDrop, onCancel }: {
  item: CountingItem; placed: boolean; disabled: boolean; onTap: () => void;
  onMove: (sample: DragSample) => void; onDrop: (sample: DragSample) => void; onCancel: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null), suppress = useRef(false);
  const callbacks = useRef({ onMove, onDrop, onCancel });
  useEffect(() => { callbacks.current = { onMove, onDrop, onCancel }; });
  useEffect(() => {
    if (disabled) return;
    let moved = false;
    const drag = attachPointerDrag(ref.current!, {
      onStart: () => { moved = false; suppress.current = false; },
      onMove: (sample) => {
        if (Math.hypot(sample.delta.x, sample.delta.y) > 8) moved = true;
        if (moved) callbacks.current.onMove(sample);
      },
      onEnd: (sample) => { suppress.current = moved; if (moved) callbacks.current.onDrop(sample); },
      onCancel: () => { suppress.current = true; callbacks.current.onCancel(); },
    });
    const cancel = () => drag.cancel();
    window.addEventListener("resize", cancel); window.addEventListener("scroll", cancel, true);
    return () => {
      window.removeEventListener("resize", cancel); window.removeEventListener("scroll", cancel, true);
      drag.destroy();
    };
  }, [disabled]);
  return <button ref={ref} className={styles.item} type="button" disabled={disabled}
    aria-label={`${placed ? "Lấy ra" : "Đặt vào"}: ${item.label}`} onClick={(event) => {
      if (suppress.current && event.detail !== 0) { suppress.current = false; return; }
      onTap();
    }}><span aria-hidden="true">{item.symbol}</span></button>;
}
