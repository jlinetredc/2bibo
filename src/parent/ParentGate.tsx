"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./ParentGate.module.css";

export interface ParentGateProps {
  onVerified: () => void;
  onCancel: () => void;
}

/** Mount for each entry attempt. This is an interaction gate, not authentication. */
export function ParentGate({ onVerified, onCancel }: ParentGateProps) {
  const id = useId();
  const hold = useRef<HTMLButtonElement>(null);
  const completed = useRef(false);
  const cancelHold = useRef<() => void>(() => {});
  const [holding, setHolding] = useState(false);
  const [alternative, setAlternative] = useState(false);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { hold.current?.focus(); }, []);

  useEffect(() => {
    const button = hold.current!;
    let pointer: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    function cancel() {
      clearTimeout(timer);
      timer = undefined;
      const previous = pointer;
      pointer = null;
      if (previous !== null && button.hasPointerCapture(previous)) button.releasePointerCapture(previous);
      setHolding(false);
    }
    cancelHold.current = cancel;
    function start(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0 || pointer !== null || completed.current) return;
      pointer = event.pointerId;
      button.setPointerCapture(pointer);
      setHolding(true);
      timer = setTimeout(() => {
        cancel();
        if (!completed.current && document.visibilityState !== "hidden") {
          completed.current = true;
          onVerified();
        }
      }, 3000);
    }
    function end(event: PointerEvent) { if (event.pointerId === pointer) cancel(); }
    function move(event: PointerEvent) {
      if (event.pointerId !== pointer) return;
      const rect = button.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) cancel();
    }
    function visibility() { if (document.visibilityState === "hidden") cancel(); }
    button.addEventListener("pointerdown", start);
    button.addEventListener("pointerup", end);
    button.addEventListener("pointercancel", end);
    button.addEventListener("lostpointercapture", end);
    button.addEventListener("pointermove", move);
    window.addEventListener("blur", cancel);
    window.addEventListener("pagehide", cancel);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancel();
      button.removeEventListener("pointerdown", start);
      button.removeEventListener("pointerup", end);
      button.removeEventListener("pointercancel", end);
      button.removeEventListener("lostpointercapture", end);
      button.removeEventListener("pointermove", move);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("pagehide", cancel);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [onVerified]);

  useEffect(() => { if (alternative) input.current?.focus(); }, [alternative]);
  function cancel() {
    cancelHold.current();
    if (!completed.current) { completed.current = true; onCancel(); }
  }
  return <section className={styles.gate} aria-labelledby={`${id}-title`} onKeyDown={(event) => {
    if (event.key === "Escape") { event.preventDefault(); cancel(); }
  }}>
    <h2 id={`${id}-title`}>Dành cho phụ huynh</h2>
    <p id={`${id}-help`}>Nhấn và giữ nút bên dưới trong 3 giây.</p>
    <button ref={hold} type="button" className={styles.hold} aria-describedby={`${id}-help`}
      onBlur={() => cancelHold.current()} onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        // Keyboard and assistive-technology activation uses the untimed alternative.
        if (event.detail === 0 && !completed.current) { cancelHold.current(); setAlternative(true); }
      }}>Giữ để tiếp tục</button>
    <p role="status">{holding ? "Đang giữ…" : ""}</p>
    <button type="button" onClick={() => { cancelHold.current(); setAlternative(true); }}>Xác nhận không cần giữ</button>
    {alternative && <form onSubmit={(event) => {
      event.preventDefault();
      if (completed.current) return;
      if (answer.trim().toLocaleUpperCase("vi") !== "PHỤ HUYNH") {
        setMessage("Vui lòng nhập cụm từ PHỤ HUYNH."); return;
      }
      cancelHold.current(); completed.current = true; onVerified();
    }}>
      <label htmlFor={`${id}-answer`}>Nhập cụm từ PHỤ HUYNH để tiếp tục</label>
      <input ref={input} id={`${id}-answer`} value={answer} autoComplete="off" spellCheck={false}
        onChange={(event) => setAnswer(event.target.value)} aria-describedby={`${id}-message`} />
      <p id={`${id}-message`} role="status">{message}</p>
      <button type="submit">Tiếp tục</button>
    </form>}
    <button type="button" onClick={cancel}>Quay lại</button>
  </section>;
}
