"use client";
import { placementHint } from "./domain/placementHint";
import { useBoardFeedback } from "./useBoardFeedback";
import { Score } from "./Score";
import { classicScore } from "./domain/score";
import { blockStyle } from "./appearance";

import { useEffect, useRef, useState } from "react";
import type { BaseGameProps } from "@/game-core/types";
import { type DragSample } from "@/game-core/input/pointerDrag";
import { Piece } from "./Piece";
import { boardDropTarget } from "./dropTarget";
import { canPlace, place } from "./domain/boardOperations";
import type { BoardPosition } from "./domain/board";
import { createClassicGame, hasClassicMove, playClassicPiece, type ClassicConfig, type ClassicState } from "./domain/classic";
import type { SessionProps } from "./progress";
import styles from "./ClassicGame.module.css";

/** Endless Classic has no completion callback; hosts may remount to restart. */
export default function ClassicGame({ config, initialState, onStateChange, onFeedback, hintsEnabled = true }: BaseGameProps<ClassicConfig> & SessionProps<ClassicState>) {
  const boardFeedback = useBoardFeedback();
  const [state, setState] = useState(() => initialState ?? createClassicGame(config));
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; origin: BoardPosition } | null>(null);
  const [message, setMessage] = useState("Chọn một khối nhé!");
  const [celebration, setCelebration] = useState({ event: 0, bonus: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const available = hasClassicMove(state);
  const endRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (!available) endRef.current?.focus(); }, [available]);
  const previewPiece = state.tray.find((piece) => piece.id === preview?.id);
  const valid = !!preview && !!previewPiece && canPlace(state.board, previewPiece, preview.origin);

  const suggested = !hintsEnabled ? [] : placementHint(state.board, state.tray.find((piece) => piece.id === selected), preview?.origin);

  function target(sample: DragSample, id: string): BoardPosition | null {
    const piece = state.tray.find((item) => item.id === id);
    return boardDropTarget(boardRef.current, sample.position, state.board.columns, (origin) => !!piece && canPlace(state.board, piece, origin));
  }
  function put(id: string, origin: BoardPosition) {
    const next = playClassicPiece(state, id, origin);
    setPreview(null);
    if (next === state) { setMessage("Thử lại nhé! Chọn một chỗ trống khác."); return; }
    boardFeedback.show(state.board, place(state.board, state.tray.find((piece) => piece.id === id)!, origin), next.board);
    if (next.lines > state.lines) setCelebration((value) => ({ event: value.event + 1, bonus: (next.lines - state.lines) * 50 }));
    setState(next); onStateChange?.(next); onFeedback?.(next.lines > state.lines ? "celebrate" : "place"); setSelected(null);
    setMessage(next.lines > state.lines ? "Tuyệt quá! Hàng đầy đã được dọn rồi!" : "Con làm được rồi!");
  }
  function restart() { boardFeedback.reset(); setCelebration({ event: 0, bonus: 0 }); const next = createClassicGame({ ...config, size: state.board.columns, pieceSet: state.generator.pieceSet }); setState(next); onStateChange?.(next); setSelected(null); setPreview(null); setMessage("Chọn một khối nhé!"); }
  return <div className={`${styles.game} ${state.board.columns > 5 ? styles.largeGame : ""}`}>
    <Score value={classicScore(state)} event={celebration.event} bonus={celebration.bonus} classic />
    {available ? <p className={styles.instructions}>Kéo hoặc chọn rồi chạm ô. Lấp đầy hàng, cột nhé!</p>
      : <section className={styles.roundEnd} aria-labelledby="blocks-round-end" data-blocks-round-end>
        <span className={styles.sadFace} aria-hidden="true">😔</span>
        <h2 id="blocks-round-end" ref={endRef} tabIndex={-1}>Không còn chỗ đặt khối</h2>
        <p>Con đã được <strong>{classicScore(state)} điểm</strong>.<br />Mình chơi một bàn mới nhé!</p>
        <button type="button" className={styles.playAgain} onClick={restart}>↻ Chơi bàn mới</button>
      </section>}
    <div data-blocks-board style={{ gridTemplateColumns: `repeat(${state.board.columns}, minmax(48px, 1fr))` }} className={styles.board} ref={boardRef} role="group" aria-label="Bàn xếp khối">
      {state.board.cells.map((cell, index) => {
        const row = Math.floor(index / state.board.columns), column = index % state.board.columns;
        const highlighted = preview && previewPiece?.cells.some((offset) => row === preview.origin.row + offset.row && column === preview.origin.column + offset.column);
        return <button key={index} type="button" disabled={!available} data-cell={index} data-occupied={cell !== null}
          style={blockStyle(cell ?? previewPiece?.id ?? "")}
          className={`${styles.cell} ${cell ? styles.occupied : ""} ${highlighted ? valid ? styles.preview : styles.invalid : ""}`}
          aria-label={`Hàng ${row + 1}, cột ${column + 1}, ${cell ? "có khối" : "trống"}`}
          onClick={() => selected ? put(selected, { row, column }) : setMessage("Chọn một khối trước nhé!")}
          onFocus={() => selected && setPreview({ id: selected, origin: { row, column } })} onBlur={() => setPreview(null)}>
          {suggested.includes(index) && <span data-placement-hint className={styles.placementHint} aria-hidden="true">↓</span>}
          {boardFeedback.render(index)}
          <span aria-hidden="true">{highlighted ? valid ? "+" : "×" : ""}</span>
        </button>;
      })}
    </div>
    {available && <div data-blocks-tray className={styles.tray} role="group" aria-label="Khay khối">
      {state.tray.map((piece, index) => <Piece key={piece.id} piece={piece} number={index + 1} selected={selected === piece.id}
        onSelect={() => { setSelected(piece.id); setPreview(null); setMessage("Chạm ô bắt đầu cho khối đã chọn."); }}
        onDrag={(sample) => { const origin = target(sample, piece.id); setPreview(origin ? { id: piece.id, origin } : null); }}
        onDrop={(sample) => { const origin = target(sample, piece.id); if (origin) put(piece.id, origin); else setPreview(null); }}
        onCancel={() => setPreview(null)} />)}
    </div>}
    {available && <p role="status" className={styles.status}>{message}</p>}
  </div>;
}
