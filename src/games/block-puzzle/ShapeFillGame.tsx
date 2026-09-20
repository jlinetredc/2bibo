"use client";
import { placementHint } from "./domain/placementHint";
import { useBoardFeedback } from "./useBoardFeedback";
import { Score } from "./Score";
import { fillScore } from "./domain/score";
import { blockStyle, fillColorKey } from "./appearance";

import { useRef, useState } from "react";
import type { BaseGameProps } from "@/game-core/types";
import type { DragSample } from "@/game-core/input/pointerDrag";
import type { BoardPosition } from "./domain/board";
import { canFillShape, createShapeFill, fillPieces, isShapeFilled, placeShapePiece, shapeTargets, undoShapePiece,
  type ShapeFillConfig, type ShapeFillResult, type ShapeFillState } from "./domain/shapeFill";
import type { SessionProps } from "./progress";
import { Piece } from "./Piece";
import { boardDropTarget } from "./dropTarget";
import base from "./ClassicGame.module.css";
import styles from "./ShapeFillGame.module.css";

/** Configuration is initial state; hosts remount for a new externally chosen target. */
export default function ShapeFillGame({ config, onComplete, onTargetChange, initialState, onStateChange, onFeedback, hintsEnabled = true }: BaseGameProps<ShapeFillConfig, ShapeFillResult> & SessionProps<ShapeFillState> & {
  /** Optional host notification so shell restart can retain the chosen silhouette. */
  onTargetChange?: (targetId: string) => void;
}) {
  const boardFeedback = useBoardFeedback();
  const [state, setState] = useState(() => initialState ?? createShapeFill(config?.targetId));
  const [selected, setSelected] = useState("single");
  const [preview, setPreview] = useState<{ id: string; origin: BoardPosition } | null>(null);
  const [message, setMessage] = useState("Lấp đầy các ô trong hình nhé!");
  const [round, setRound] = useState(0);
  const [celebration, setCelebration] = useState({ event: 0, bonus: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const notified = useRef(initialState ? isShapeFilled(initialState) : false);
  const complete = isShapeFilled(state);
  const target = shapeTargets.find((item) => item.id === state.targetId)!;
  const previewPiece = fillPieces.find((piece) => piece.id === preview?.id);
  const valid = !!preview && canFillShape(state, preview.id, preview.origin);

  const suggested = !hintsEnabled ? [] : complete ? [] : placementHint(state.board, fillPieces.find((piece) => piece.id === selected), preview?.origin, (origin) => canFillShape(state, selected, origin));

  function start(targetId: string) {
    onTargetChange?.(targetId);
    boardFeedback.reset(); setCelebration({ event: 0, bonus: 0 });
    const next = createShapeFill(targetId); setState(next); onStateChange?.(next); setSelected("single"); setPreview(null);
    setMessage("Lấp đầy các ô trong hình nhé!"); notified.current = false;
    setRound((value) => value + 1);
  }
  function put(pieceId: string, origin: BoardPosition) {
    const next = placeShapePiece(state, pieceId, origin);
    setPreview(null);
    if (next === state) { if (!complete) setMessage("Thử lại nhé! Đặt khối vào ô trống trong hình."); return; }
    boardFeedback.show(state.board, next.board, next.board, isShapeFilled(next));
    setState(next); onStateChange?.(next); onFeedback?.(isShapeFilled(next) ? "celebrate" : "place"); setMessage("Con làm được rồi!");
    if (isShapeFilled(next) && !notified.current) {
      setCelebration((value) => ({ event: value.event + 1, bonus: 100 }));
      notified.current = true;
      onComplete?.({ targetId: next.targetId, filledCells: next.mask.filter(Boolean).length });
    }
  }
  function hit(sample: DragSample, id: string): BoardPosition | null {
    return boardDropTarget(boardRef.current, sample.position, 5, (origin) => canFillShape(state, id, origin));
  }
  return <div className={base.game}>
    <div data-blocks-picker role="group" aria-label="Chọn hình" className={styles.choices}>
      {shapeTargets.map((item) => <button type="button" key={item.id} className={styles.choice} aria-label={item.name}
        aria-pressed={item.id === state.targetId} onClick={() => { if (item.id !== state.targetId) start(item.id); }}>
        <span aria-hidden="true">{item.icon}{item.id === state.targetId ? "✓" : ""}</span>
      </button>)}
    </div>
    <Score label={target.name} value={fillScore(state.board, complete)} event={celebration.event} bonus={celebration.bonus} />
    <p className={base.instructions}>{hintsEnabled ? "Kéo khối theo mũi tên, hoặc chọn rồi chạm ô." : "Kéo khối vào hình, hoặc chọn rồi chạm ô."}</p>
    <div data-blocks-board role="group" aria-label={`Hình ${target.name}`} className={base.board} ref={boardRef}>
      {state.board.cells.map((cell, index) => {
        const row = Math.floor(index / 5), column = index % 5;
        const highlighted = preview && previewPiece?.cells.some((offset) => row === preview.origin.row + offset.row && column === preview.origin.column + offset.column);
        const feedback = highlighted ? valid ? base.preview : base.invalid : "";
        if (!state.mask[index]) return <span key={index} data-fill-cell={index} className={`${styles.outside} ${feedback}`} aria-hidden="true">{highlighted ? "×" : "·"}</span>;
        return <button key={index} type="button" data-fill-cell={index} data-filled={cell !== null}
          style={blockStyle(cell ? fillColorKey(state.board, cell) : previewPiece?.id ?? "")}
          className={`${base.cell} ${cell ? base.occupied : ""} ${feedback}`}
          aria-label={`Hàng ${row + 1}, cột ${column + 1}, ${cell ? "đã lấp" : "trống"}`}
          onClick={() => put(selected, { row, column })}
          onFocus={() => !complete && setPreview({ id: selected, origin: { row, column } })} onBlur={() => setPreview(null)}>
          {suggested.includes(index) && <span data-placement-hint className={base.placementHint} aria-hidden="true">↓</span>}
          {boardFeedback.render(index)}
          <span aria-hidden="true">{highlighted ? valid ? "+" : "×" : ""}</span>
        </button>;
      })}
    </div>
    {!complete && <div data-blocks-tray role="group" aria-label="Khối lấp hình" className={base.tray}>
      {fillPieces.map((piece, index) => <Piece key={`${round}-${piece.id}`} piece={piece} number={index + 1} selected={selected === piece.id}
        onSelect={() => { setSelected(piece.id); setPreview(null); }}
        onDrag={(sample) => { const origin = hit(sample, piece.id); setPreview(origin ? { id: piece.id, origin } : null); }}
        onDrop={(sample) => { const origin = hit(sample, piece.id); if (origin) put(piece.id, origin); else setPreview(null); }}
        onCancel={() => setPreview(null)} />)}
    </div>}
    <p role="status" className={base.status}>{complete ? `Tuyệt quá! Con đã lấp đầy ${target.name.toLocaleLowerCase("vi")}! ★` : message}</p>
    <div data-blocks-actions className={styles.actions}>
      <button type="button" className={base.restart} disabled={!state.history.length || complete}
        onClick={() => { boardFeedback.reset(); const next = undoShapePiece(state); setState(next); onStateChange?.(next); setPreview(null); setMessage("Mình chọn chỗ khác nhé!"); }}>Hoàn tác</button>
      <button type="button" className={base.restart} onClick={() => start(state.targetId)}>Lấp lại</button>
    </div>
  </div>;
}
