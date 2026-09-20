"use client";
import { useEffect, useRef, useState } from "react";
import { ParentGate } from "@/parent/ParentGate";
import { classicSizes, type ClassicState } from "./domain/classic";
import styles from "./BlocksSettings.module.css";

export function BlocksSettings({ classic, hints, muted, onHints, onMuted, onNewBoard, onTutorial, onClose }: {
  classic: ClassicState; hints: boolean; muted: boolean;
  onHints: (value: boolean) => void; onMuted: (value: boolean) => void;
  onNewBoard: (size: number, baby: boolean) => void; onTutorial: () => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null), heading = useRef<HTMLHeadingElement>(null);
  const [verified, setVerified] = useState(false);
  const [baby, setBaby] = useState(classic.generator.pieceSet === "baby");
  const [size, setSize] = useState(classic.board.columns);
  useEffect(() => { const node = dialog.current!; node.showModal(); return () => node.close(); }, []);
  useEffect(() => { if (verified) heading.current?.focus(); }, [verified]);
  function close() { dialog.current?.close(); onClose(); }
  return <dialog ref={dialog} className={styles.dialog} aria-label="Cài đặt cho bố mẹ" onCancel={(event) => { event.preventDefault(); close(); }}>
    {!verified ? <ParentGate onVerified={() => setVerified(true)} onCancel={close} /> : <div className={styles.content}>
      <h2 ref={heading} tabIndex={-1}>Cài đặt cho bố mẹ</h2>
      <button type="button" aria-label="Gợi ý tự động" aria-pressed={hints} onClick={() => onHints(!hints)}>💡 Gợi ý: {hints ? "Bật ✓" : "Tắt"}</button>
      <button type="button" aria-label="Tắt âm thanh" aria-pressed={muted} onClick={() => onMuted(!muted)}>{muted ? "🔇 Âm thanh: Tắt" : "🔊 Âm thanh: Bật"}</button>
      <fieldset><legend>Bàn xếp khối mới</legend>
        <label htmlFor="blocks-level">Cách chơi</label>
        <select id="blocks-level" value={baby ? "baby" : "custom"} onChange={(event) => { const next = event.target.value === "baby"; setBaby(next); if (next) setSize(5); }}>
          <option value="baby">Bé chơi — khối 1–2 ô</option><option value="custom">Tự chọn — đủ loại khối</option>
        </select>
        <label htmlFor="blocks-size">Cỡ bàn</label>
        <select id="blocks-size" disabled={baby} value={size} onChange={(event) => setSize(Number(event.target.value))}>
          {classicSizes.map((value) => <option key={value} value={value}>{value} × {value}</option>)}
        </select>
        <p>Mở bàn mới sẽ bắt đầu lại phần Xếp khối. Các hình và bàn Ghép kín đang chơi được giữ lại.</p>
        <button type="button" onClick={() => { dialog.current?.close(); onNewBoard(size, baby); }}>Mở bàn mới</button>
      </fieldset>
      <button type="button" onClick={() => { dialog.current?.close(); onTutorial(); }}>Xem cách chơi</button>
      <button type="button" className={styles.done} onClick={close}>Về chơi</button>
    </div>}
  </dialog>;
}
