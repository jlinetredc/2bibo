"use client";
import { useEffect, useState, type CSSProperties } from "react";
import styles from "./Score.module.css";

function Celebration({ bonus }: { bonus: number }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), 1600);
    return () => window.clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return <span data-blocks-celebration className={styles.celebration} aria-hidden="true">
    <strong>Tuyệt quá! +{bonus} điểm</strong>
    {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--angle": `${index * 45}deg` } as CSSProperties}>★</i>)}
  </span>;
}

export function Score({ value, event, bonus, classic = false, label = "" }: {
  value: number; event: number; bonus: number; classic?: boolean; label?: string;
}) {
  return <div data-blocks-score className={styles.score}>
    {label && <h2>{label}</h2>}
    <p aria-live="polite" aria-atomic="true"><span aria-hidden="true">★ </span>Điểm: <strong>{value}</strong></p>
    <small>{classic ? "Đặt khối +10 · Đầy hàng/cột +50" : "Mỗi ô +10 · Hoàn thành +100"}</small>
    {event > 0 && <Celebration key={event} bonus={bonus} />}
  </div>;
}
