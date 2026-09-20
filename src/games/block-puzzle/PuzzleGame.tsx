"use client";
import { placementHint } from "./domain/placementHint";
import { useBoardFeedback } from "./useBoardFeedback";
import { Score } from "./Score";
import { fillScore } from "./domain/score";
import { blockStyle } from "./appearance";

import { useRef, useState } from "react";
import type { BaseGameProps } from "@/game-core/types";
import type { DragSample } from "@/game-core/input/pointerDrag";
import { canPlace } from "./domain/boardOperations";
import { checkPuzzleSolution, createPuzzleState, placePuzzlePiece, solvePuzzle, undoPuzzlePiece, type PuzzlePlacement, type PuzzleState } from "./domain/puzzle";
import type { SessionProps } from "./progress";
import { blockPuzzles, getBlockPuzzle } from "./data/puzzles";
import { Piece } from "./Piece";
import { boardDropTarget } from "./dropTarget";
import base from "./ClassicGame.module.css";
import shared from "./ShapeFillGame.module.css";
import styles from "./PuzzleGame.module.css";

export interface PuzzleConfig { readonly puzzleId?: string }
export interface PuzzleResult { readonly puzzleId: string; readonly piecesPlaced: number }

export default function PuzzleGame({ config, onComplete, onPuzzleChange, initialState, onStateChange, onFeedback, hintsEnabled = true }: BaseGameProps<PuzzleConfig, PuzzleResult> & SessionProps<PuzzleState> & {
  onPuzzleChange?: (puzzleId: string) => void;
}) {
  const boardFeedback = useBoardFeedback();
  const [state, setState] = useState(() => initialState ?? createPuzzleState(getBlockPuzzle(config?.puzzleId)));
  const [selected, setSelected] = useState<string | null>(null);
  const [preview, setPreview] = useState<PuzzlePlacement | null>(null);
  const [message, setMessage] = useState("Dùng hết các khối để lấp bàn nhé!");
  const [round, setRound] = useState(0);
  const notified = useRef(initialState ? checkPuzzleSolution(initialState.definition, initialState.placements) : false);
  const [celebration, setCelebration] = useState({ event: 0, bonus: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const definition = state.definition;
  const complete = checkPuzzleSolution(definition, state.placements);
  const remaining = definition.pieces.filter((piece) => !state.placements.some((move) => move.pieceId === piece.id));
  const previewPiece = remaining.find((piece) => piece.id === preview?.pieceId);
  const valid = !!preview && !!previewPiece && canPlace(state.board, previewPiece, preview.origin);

  const suggested = !hintsEnabled ? [] : placementHint(state.board, remaining.find((piece) => piece.id === selected), preview?.origin);

  function start(id: string) {
    boardFeedback.reset(); setCelebration({ event: 0, bonus: 0 });
    const next = createPuzzleState(getBlockPuzzle(id)); setState(next); onStateChange?.(next); setSelected(null); setPreview(null);
    setMessage("Dùng hết các khối để lấp bàn nhé!"); notified.current = false;
    setRound((value) => value + 1); onPuzzleChange?.(id);
  }
  function put(move: PuzzlePlacement) {
    const next = placePuzzlePiece(state, move.pieceId, move.origin);
    setPreview(null);
    if (next === state) { setMessage("Thử lại nhé! Chọn chỗ trống khác."); return; }
    boardFeedback.show(state.board, next.board, next.board, checkPuzzleSolution(definition, next.placements));
    setState(next); onStateChange?.(next); onFeedback?.(checkPuzzleSolution(definition, next.placements) ? "celebrate" : "place"); setSelected(null); setMessage("Con làm được rồi!");
    if (checkPuzzleSolution(definition, next.placements) && !notified.current) {
      setCelebration((value) => ({ event: value.event + 1, bonus: 100 }));
      notified.current = true; onComplete?.({ puzzleId: definition.id, piecesPlaced: next.placements.length });
    }
  }
  function hit(sample: DragSample, id: string) {
    const piece = remaining.find((item) => item.id === id);
    return boardDropTarget(boardRef.current, sample.position, definition.columns, (origin) => !!piece && canPlace(state.board, piece, origin));
  }
  function hint() {
    const result = solvePuzzle(definition, state.placements);
    if (result.status === "solved") {
      const next = result.placements[state.placements.length];
      if (next) {
        setSelected(next.pieceId); setPreview(next);
        const number = definition.pieces.findIndex((piece) => piece.id === next.pieceId) + 1;
        setMessage(`Khối ${number} → hàng ${next.origin.row + 1}, cột ${next.origin.column + 1}.`);
      }
    } else {
      setPreview(null);
      setMessage(result.status === "unsolvable" ? "Mình hoàn tác rồi thử chỗ khác nhé!" : "Mình thử hoàn tác một khối nhé!");
    }
  }
  return <div className={base.game}>
    <div data-blocks-picker role="group" aria-label="Chọn bàn Puzzle" className={shared.choices}>
      {blockPuzzles.map((puzzle, index) => <button type="button" key={puzzle.id} className={shared.mode}
        aria-label={`Bàn ${index + 1}`} aria-pressed={puzzle.id === definition.id}
        onClick={() => { if (puzzle.id !== definition.id) start(puzzle.id); }}>
        <span aria-hidden="true">{puzzle.id === definition.id ? "✓ " : ""}Bàn {index + 1}</span>
      </button>)}
    </div>
    <Score value={fillScore(state.board, complete)} event={celebration.event} bonus={celebration.bonus} />
    <p className={base.instructions}>{hintsEnabled ? "Kéo khối theo mũi tên, hoặc chọn rồi chạm ô." : "Kéo khối vào bàn, hoặc chọn rồi chạm ô."}</p>
    <div data-blocks-board role="group" aria-label="Bàn Puzzle" ref={boardRef} className={`${base.board} ${styles.board}`}
      style={{ gridTemplateColumns: `repeat(${definition.columns}, minmax(0, 1fr))` }}>
      {state.board.cells.map((cell, index) => {
        const origin = { row: Math.floor(index / definition.columns), column: index % definition.columns };
        const highlighted = preview && previewPiece?.cells.some((offset) => origin.row === preview.origin.row + offset.row && origin.column === preview.origin.column + offset.column);
        return <button key={index} type="button" data-puzzle-cell={index} data-puzzle-filled={cell !== null}
          style={blockStyle(cell ?? previewPiece?.id ?? "")}
          className={`${base.cell} ${cell ? base.occupied : ""} ${highlighted ? valid ? base.preview : base.invalid : ""}`}
          aria-label={`Hàng ${origin.row + 1}, cột ${origin.column + 1}, ${cell ? "đã lấp" : "trống"}`}
          onClick={() => selected ? put({ pieceId: selected, origin }) : setMessage("Chọn một khối nhé!")}
          onFocus={() => selected && setPreview({ pieceId: selected, origin })} onBlur={() => setPreview(null)}>
          {suggested.includes(index) && <span data-placement-hint className={base.placementHint} aria-hidden="true">↓</span>}
          {boardFeedback.render(index)}
          <span aria-hidden="true">{highlighted ? valid ? "+" : "×" : ""}</span>
        </button>;
      })}
    </div>
    {!complete && <div data-blocks-tray role="group" aria-label="Khối Puzzle" className={styles.tray}>
      {remaining.map((piece) => <Piece key={`${round}-${piece.id}`} piece={piece} number={definition.pieces.indexOf(piece) + 1} selected={selected === piece.id}
        onSelect={() => { setSelected(piece.id); setPreview(null); }}
        onDrag={(sample) => { const origin = hit(sample, piece.id); setPreview(origin ? { pieceId: piece.id, origin } : null); }}
        onDrop={(sample) => { const origin = hit(sample, piece.id); if (origin) put({ pieceId: piece.id, origin }); else setPreview(null); }}
        onCancel={() => setPreview(null)} />)}
    </div>}
    <p role="status" className={base.status}>{complete ? "Tuyệt quá! Con đã ghép kín bàn! ★" : message}</p>
    <div data-blocks-actions className={styles.controls}>
      <button type="button" className={base.restart} disabled={!state.placements.length || complete}
        onClick={() => { boardFeedback.reset(); const next = undoPuzzlePiece(state); setState(next); onStateChange?.(next); setPreview(null); setSelected(null); setMessage("Mình thử chỗ khác nhé!"); }}>Hoàn tác</button>
      <button type="button" className={base.restart} disabled={complete} onClick={hint}>Gợi ý</button>
      <button type="button" className={base.restart} onClick={() => start(definition.id)}>Ghép lại</button>
    </div>
  </div>;
}
