"use client";

import { useId, type ReactNode } from "react";
import styles from "./GameShell.module.css";

export interface GameShellProps {
  title: string;
  children: ReactNode;
  onBack: () => void;
  /** The host resets the game's state; the shell does not remount children. */
  onRestart: () => void;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  showAudioControl?: boolean;
}

export function GameShell({ title, children, onBack, onRestart, muted, onMutedChange, showAudioControl = true }: GameShellProps) {
  const titleId = useId();

  return (
    <section className={styles.shell} aria-labelledby={titleId}>
      <header className={styles.header}>
        <button className={styles.button} type="button" onClick={onBack} aria-label="Quay lại">
          <span aria-hidden="true">←</span>
        </button>
        <h1 id={titleId} className={styles.title}>{title}</h1>
        <div className={styles.actions}>
          <button className={styles.button} type="button" onClick={onRestart} aria-label="Chơi lại">
            <span aria-hidden="true">↻</span>
          </button>
          {showAudioControl && <button className={styles.button} type="button" onClick={() => onMutedChange(!muted)}
            aria-label="Tắt âm thanh" aria-pressed={muted}>
            <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
          </button>}
        </div>
      </header>
      <div className={styles.content}>{children}</div>
    </section>
  );
}
