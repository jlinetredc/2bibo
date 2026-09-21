"use client";
import { useRef, useState } from "react";
import type { BaseGameProps } from "@/game-core/types";
import type { DragSample } from "@/game-core/input/pointerDrag";
import { checkCounting, createCountingState, moveCountingItem, resetCounting, type CountingDefinition, type CountingItem } from "./domain/counting";
import { CountingItemButton } from "./CountingItemButton";
import styles from "./CountingGame.module.css";

export interface CountingResult { readonly id: string; readonly count: number; readonly placedIds: readonly string[] }
type Props = BaseGameProps<CountingDefinition, CountingResult> & { config: CountingDefinition; onNewRound?: () => void };

/** Initial configuration: hosts remount for a new definition, as with other games. */
export function CountingGame(props: Props) {
  return <CountingRound key={props.config.id} {...props} />;
}
function CountingRound({ config, onComplete, onNewRound }: Props) {
  const [state, setState] = useState(() => createCountingState(config));
  const current = useRef(state);
  const [preview, setPreview] = useState<{ item: CountingItem; x: number; y: number } | null>(null);
  const source = useRef<HTMLDivElement>(null), destination = useRef<HTMLDivElement>(null);
  function move(id: string, placed: boolean) {
    current.current = moveCountingItem(current.current, id, placed);
    setState(current.current); setPreview(null);
  }
  function drop(id: string, sample: DragSample) {
    const inside = (element: HTMLElement | null) => {
      if (!element) return false;
      const rect = element.getBoundingClientRect(), { x, y } = sample.position;
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    };
    if (inside(destination.current)) move(id, true);
    else if (inside(source.current)) move(id, false);
    setPreview(null);
  }
  function confirm() {
    const before = current.current, next = checkCounting(before);
    current.current = next; setState(next);
    if (before.status !== "complete" && next.status === "complete") onComplete?.({
      id: next.definition.id, count: next.placedIds.length, placedIds: next.placedIds,
    });
  }
  const complete = state.status === "complete";
  function items(placed: boolean) {
    return state.definition.items.filter((item) => state.placedIds.includes(item.id) === placed).map((item) =>
      <CountingItemButton key={item.id} item={item} placed={placed} disabled={complete}
        onTap={() => move(item.id, !placed)} onDrop={(sample) => drop(item.id, sample)} onCancel={() => setPreview(null)}
        onMove={(sample) => setPreview({ item, x: Math.max(32, Math.min(window.innerWidth - 32, sample.position.x)),
          y: Math.max(32, Math.min(window.innerHeight - 32, sample.position.y - 48)) })} />);
  }
  return <section className={styles.game} aria-label="Hoạt động đếm">
    <h2>{state.definition.instruction}</h2>
    <p className={styles.goal}>Cần <strong>{state.definition.target}</strong> vật</p>
    <p>Chạm hoặc kéo hình sang bên nhận. Chạm lại để lấy ra.</p>
    <div className={styles.zones}>
      <div ref={source} className={styles.zone} role="group" aria-label="Các vật để chọn">
        <h3>Các vật để chọn</h3><div className={styles.items}>{items(false)}</div>
      </div>
      <div ref={destination} className={`${styles.zone} ${styles.destination} ${complete ? styles.complete : ""}`} role="group" aria-label={state.definition.destinationLabel}>
        <div className={styles.receiver} aria-hidden="true">
          <span className={styles.destinationSymbol}>{state.definition.destinationSymbol ?? "🎯"}</span>
          {complete && <span className={styles.celebration}>⭐ 💛 ⭐</span>}
        </div>
        <h3>{state.definition.destinationLabel}</h3><div className={styles.items}>{items(true)}</div>
        <p className={styles.counter} aria-label="Số vật đã đặt" aria-live="polite" aria-atomic="true">Đã đặt: <strong key={state.placedIds.length}>{state.placedIds.length}</strong></p>
      </div>
    </div>
    <p role="status" className={styles.feedback}>{complete ? "✓ Con làm được rồi!" : state.status === "retry" ? "Gần đúng rồi! Con thêm hoặc lấy bớt nhé." : ""}</p>
    <div className={styles.actions}>
      <button type="button" className={styles.confirm} disabled={complete} onClick={confirm}>Xong rồi</button>
      <button type="button" className={complete ? styles.confirm : undefined} onClick={() => { if (onNewRound) { onNewRound(); return; } current.current = resetCounting(current.current); setState(current.current); setPreview(null); }}>{onNewRound ? complete ? "Chơi tiếp" : "Lượt mới" : "Chơi lại"}</button>
    </div>
    {preview && <span aria-hidden="true" className={styles.preview} style={{ left: preview.x, top: preview.y }}>{preview.item.symbol}</span>}
  </section>;
}
