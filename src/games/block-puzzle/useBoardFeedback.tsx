"use client";
import { useEffect, useRef, useState } from "react";
import type { BlockBoard } from "./domain/board";
import styles from "./BoardFeedback.module.css";

/** Transient decoration only; the board commits immediately and stays interactive. */
export function useBoardFeedback() {
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [feedback, setFeedback] = useState<{ id: number; cells: number[]; celebration: boolean } | null>(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  function reset() { clearTimeout(timer.current); setFeedback(null); }
  function show(before: BlockBoard, placed: BlockBoard, after: BlockBoard, complete = false) {
    clearTimeout(timer.current);
    const cleared = placed.cells.flatMap((cell, index) => cell !== null && after.cells[index] === null ? [index] : []);
    const cells = complete ? placed.cells.flatMap((cell, index) => cell !== null ? [index] : [])
      : [...new Set([...cleared, ...placed.cells.flatMap((cell, index) => cell !== before.cells[index] ? [index] : [])])];
    setFeedback({ id: ++sequence.current, cells, celebration: complete || cleared.length > 0 });
    timer.current = setTimeout(() => setFeedback(null), 1000);
  }
  function render(index: number) {
    return feedback?.cells.includes(index) ? <span key={feedback.id} aria-hidden="true" data-board-feedback
      data-celebration={feedback.celebration} className={`${styles.effect} ${feedback.celebration ? styles.celebrate : ""}`}>
      <span>{feedback.celebration ? "★" : "✓"}</span>
    </span> : null;
  }
  return { show, reset, render };
}
