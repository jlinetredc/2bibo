"use client";
import { useEffect, useRef, useState } from "react";
import { JIGSAW_THEME_PACKS } from "./data/themePacks";
import type { JigsawPieceCount } from "./domain/difficultyPresets";
import styles from "./JigsawGame.module.css";

export function PictureLibrary({ pictureId, count, onClose, onStart }: {
  pictureId: string; count: JigsawPieceCount; onClose: () => void;
  onStart: (pictureId: string, count: JigsawPieceCount) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [theme, setTheme] = useState(JIGSAW_THEME_PACKS.find((pack) => pack.pictures.some((p) => p.id === pictureId))!.id);
  const [picture, setPicture] = useState(pictureId), [pieces, setPieces] = useState(count);
  useEffect(() => { const element = dialog.current!; element.showModal(); return () => element.close(); }, []);
  const pack = JIGSAW_THEME_PACKS.find((entry) => entry.id === theme)!;
  return <dialog ref={dialog} className={styles.library} aria-labelledby="library-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <header className={styles.libraryHeader}><h2 id="library-title">Chọn tranh của bé</h2><button type="button" aria-label="Đóng thư viện" onClick={onClose}>✕</button></header>
    <div className={styles.libraryBody}>
      <nav className={styles.themeTabs} aria-label="Bộ tranh">{JIGSAW_THEME_PACKS.map((entry) =>
        <button type="button" key={entry.id} aria-pressed={theme === entry.id} onClick={() => { setTheme(entry.id); setPicture(entry.pictures[0].id); }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.pictures[0].image.src} alt="" width={48} height={48} loading="lazy" />
          <span>{entry.title}</span>
        </button>)}</nav>
      <div className={styles.pictureGrid}>{pack.pictures.map((entry) => <button type="button" key={entry.id} aria-pressed={picture === entry.id}
        aria-label={entry.title} onClick={() => setPicture(entry.id)}>
        {/* Local illustrations in a bounded, lazy-loaded gallery. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.image.src} alt="" loading="lazy" width={entry.image.width} height={entry.image.height} />
        <span>{picture === entry.id ? "✓ " : ""}{entry.title}</span>
      </button>)}</div>
    </div>
    <footer className={styles.libraryFooter}>
      <div className={styles.countChoices} role="group" aria-label="Số mảnh">{([4, 6, 9, 12, 16, 24] as const).map((value) =>
        <button type="button" key={value} aria-pressed={pieces === value} onClick={() => setPieces(value)}>{value} mảnh</button>)}</div>
      <button type="button" className={styles.startButton} onClick={() => onStart(picture, pieces)}>▶ Bắt đầu ghép</button>
    </footer>
  </dialog>;
}
