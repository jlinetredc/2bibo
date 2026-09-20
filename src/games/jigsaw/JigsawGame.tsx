"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { BaseGameProps } from "@/game-core/types";
import type { DragSample } from "@/game-core/input/pointerDrag";
import type { ImagePiece, JigsawImagePieces } from "./domain/imagePieces";
import { createJigsawState, isJigsawComplete, placeJigsawPiece, type JigsawState } from "./domain/jigsaw";
import { findJigsawSnap, snapJigsawPiece } from "./domain/snap";
import { JigsawImagePiece } from "./JigsawImagePiece";
import { JigsawDragPiece } from "./JigsawDragPiece";
import { PlacementBurst } from "./PlacementBurst";
import styles from "./JigsawGame.module.css";
import { scatterColumns, scatterPosition, scatterDrop, nudgeScatter, type ScatterPosition } from "./scatter";

export interface JigsawResult { readonly puzzleId: string; readonly pieces: number }
/** Remount with a new key when the supplied puzzle changes. */
export default function JigsawGame({ config: puzzle, onComplete, onChoosePicture }: BaseGameProps<JigsawImagePieces, JigsawResult> & {
  config: JigsawImagePieces; onChoosePicture?: () => void;
}) {
  const [state, setState] = useState(() => createJigsawState(puzzle.definition));
  const current = useRef(state), completed = useRef(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState("Kéo mảnh vào tranh. Hoặc chạm mảnh rồi chạm chỗ ghép.");
  const [guide, setGuide] = useState(true);
  const [wideTray, setWideTray] = useState(false);
  const [landscapeTray, setLandscapeTray] = useState(false);
  useEffect(() => {
    const update = () => { setWideTray(window.innerWidth >= 700); setLandscapeTray(window.innerWidth >= 1000); };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const [positions, setPositions] = useState<Record<string, ScatterPosition>>({});
  const scatter = useRef<HTMLDivElement>(null);
  const [imageStatus, setImageStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [ghost, setGhost] = useState<{ piece: ImagePiece; x: number; y: number; width: number; height: number; targetId?: string } | null>(null);
  const board = useRef<HTMLDivElement>(null), success = useRef<HTMLHeadingElement>(null);
  const surface = useRef<HTMLDivElement>(null), trayPanel = useRef<HTMLDivElement>(null);
  const [boardLimit, setBoardLimit] = useState<number>();
  const complete = isJigsawComplete(state);
  useEffect(() => {
    if (imageStatus !== "ready" || !surface.current) return;
    const fit = () => {
      if (window.innerWidth < 700) { setBoardLimit(undefined); return; }
      const top = surface.current!.getBoundingClientRect().top + window.scrollY;
      const trayHeight = trayPanel.current?.getBoundingClientRect().height ?? 0;
      const height = window.innerHeight - top - trayHeight - (trayHeight ? 12 : 0) - 24;
      const minimum = Math.max(puzzle.columns * 48, puzzle.rows * 48 * puzzle.image.width / puzzle.image.height);
      setBoardLimit(Math.max(minimum, Math.max(0, height - 16) * puzzle.image.width / puzzle.image.height) + 16);
    };
    const observer = new ResizeObserver(fit);
    observer.observe(surface.current.parentElement!.parentElement!);
    if (trayPanel.current) observer.observe(trayPanel.current);
    window.addEventListener("resize", fit);
    fit();
    return () => { observer.disconnect(); window.removeEventListener("resize", fit); };
  }, [imageStatus, complete, puzzle.image.width, puzzle.image.height, puzzle.columns, puzzle.rows]);
  useEffect(() => {
    let alive = true;
    const image = new Image();
    image.onload = () => { if (alive) setImageStatus("ready"); };
    image.onerror = () => { if (alive) setImageStatus("error"); };
    image.src = puzzle.image.src;
    return () => { alive = false; image.onload = null; image.onerror = null; };
  }, [puzzle.image.src, attempt]);
  useEffect(() => { if (complete) success.current?.focus(); }, [complete]);
  function commit(next: JigsawState) {
    setGhost(null);
    if (next === current.current) { setMessage("Gần đúng rồi! Thử lại nhé!"); return; }
    current.current = next; setState(next); setSelected(null);
    setMessage("Giỏi lắm!");
    if (isJigsawComplete(next) && !completed.current) {
      completed.current = true;
      onComplete?.({ puzzleId: puzzle.definition.id, pieces: puzzle.pieces.length });
    }
  }
  function restart() {
    current.current = createJigsawState(puzzle.definition); setState(current.current);
    completed.current = false; setSelected(null); setGhost(null);
    setPositions({});
    setMessage("Kéo mảnh vào tranh. Hoặc chạm mảnh rồi chạm chỗ ghép.");
  }
  function dragInput(piece: ImagePiece, sample: DragSample) {
    const bounds = board.current!.getBoundingClientRect();
    const width = piece.source.width / puzzle.image.width * bounds.width;
    const height = piece.source.height / puzzle.image.height * bounds.height;
    // The tray is a thumbnail. Its dragged image is centered on a visible aim point.
    const origin = { x: sample.position.x - width / 2, y: sample.position.y - height / 2 - (sample.pointerType === "mouse" ? 0 : 56) };
    return { puzzle, pieceId: piece.id, board: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }, origin, radius: 28 };
  }
  const columns = puzzle.pieces.slice(0, puzzle.columns).map((p) => `${p.source.width}fr`).join(" ");
  const rows = puzzle.pieces.filter((p) => p.column === 0).map((p) => `minmax(0, ${p.source.height}fr)`).join(" ");
  const remaining = [...puzzle.pieces].reverse().filter((piece) => !state.placements.some((p) => p.pieceId === piece.id));
  const scatterRows = Math.ceil(puzzle.pieces.length / scatterColumns(puzzle.pieces.length, wideTray, landscapeTray));
  function positionOf(piece: ImagePiece) { return positions[piece.id] ?? scatterPosition(puzzle.pieces.length - 1 - puzzle.pieces.indexOf(piece), puzzle.pieces.length, wideTray, landscapeTray); }
  function drop(piece: ImagePiece, sample: DragSample) {
    const input = dragInput(piece, sample);
    const next = snapJigsawPiece(current.current, input);
    if (next !== current.current) { commit(next); return; }
    const area = scatter.current!.getBoundingClientRect();
    const point = sample.position;
    if (point.x >= area.left && point.x <= area.right && point.y >= area.top && point.y <= area.bottom) {
      const size = parseFloat(getComputedStyle(scatter.current!).getPropertyValue("--scatter-size"));
      const position = scatterDrop({ x: point.x, y: point.y - (sample.pointerType === "mouse" ? 0 : 56) }, area, size);
      setPositions((previous) => ({ ...previous, [piece.id]: position }));
      setGhost(null); setMessage("Con có thể kéo các mảnh ra chỗ khác để tìm.");
    } else commit(next);
  }
  if (imageStatus !== "ready") return <div className={styles.game}>
    <p role="status">{imageStatus === "loading" ? "Đang mở tranh…" : "Tranh chưa mở được. Thử lại nhé!"}</p>
    {imageStatus === "error" && <button type="button" onClick={() => { setImageStatus("loading"); setAttempt((v) => v + 1); }}>Mở lại tranh</button>}
  </div>;
  return <section className={styles.game} aria-label="Ghép tranh">
    {complete ? <div className={styles.success}>
      <span className={styles.stars} aria-hidden="true">⭐ 🌟 ⭐</span>
      <h2 ref={success} tabIndex={-1}>Con làm được rồi!</h2>
      <p>{puzzle.image.alt}</p>
      <div className={styles.actions}>
        <button type="button" onClick={restart}>Ghép lại</button>
        {onChoosePicture && <button type="button" onClick={onChoosePicture}>Chọn tranh khác</button>}
      </div>
    </div> : <p className={styles.instruction} role="status">{message}</p>}
    {!complete && <div className={styles.guideBar}><div className={styles.progress}><span>⭐ {state.placements.length}/{puzzle.pieces.length} mảnh</span><progress aria-label="Tiến độ ghép tranh" value={state.placements.length} max={puzzle.pieces.length} /></div>
      <div className={styles.guideActions}>
        <button type="button" onClick={() => setPositions({})}>Xếp gọn</button>
        <button type="button" aria-pressed={guide} onClick={() => setGuide((value) => !value)}>Ảnh gợi ý: {guide ? "Bật" : "Tắt"}</button>
      </div>
    </div>}
    <div className={styles.stage} data-complete={complete}>
    <div ref={surface} className={styles.boardScroll} style={{ maxWidth: boardLimit }}><div ref={board} data-jigsaw-board className={styles.board} style={{ minWidth: Math.max(puzzle.columns * 48, puzzle.rows * 48 * puzzle.image.width / puzzle.image.height), gridTemplateColumns: columns, gridTemplateRows: complete ? undefined : rows, aspectRatio: `${puzzle.image.width}/${puzzle.image.height}` }}>
      {complete ? (
        // Full local artwork replaces target seams after the final committed piece.
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.fullImage} src={puzzle.image.src} alt={puzzle.image.alt} width={puzzle.image.width} height={puzzle.image.height} />
      ) : puzzle.pieces.map((piece, index) => {
        const placed = state.placements.some((p) => p.pieceId === piece.id);
        return <button type="button" key={piece.id} className={styles.target} data-target={index + 1}
          data-placed={placed} data-snap={ghost?.targetId === piece.targetId}
          disabled={placed} aria-label={`Ô ${index + 1}${placed ? ", đã ghép" : ""}`}
          onClick={() => { if (selected) commit(placeJigsawPiece(current.current, selected, piece.targetId)); }}>
          {placed ? <JigsawImagePiece image={puzzle.image} piece={piece} interlocking /> : guide ? <span className={styles.guide} aria-hidden="true"><JigsawImagePiece image={puzzle.image} piece={piece} interlocking /></span> : <span aria-hidden="true" className={styles.emptyTarget}>✧</span>}
        </button>;
      })}
      {state.placements.map((placement) => <PlacementBurst key={placement.pieceId}
        piece={puzzle.pieces.find((piece) => piece.id === placement.pieceId)!} image={puzzle.image} />)}
    </div></div>
    {!complete && <div ref={trayPanel} className={styles.scatterPanel}>
      <div ref={scatter} role="group" aria-label="Khay mảnh ghép" data-scatter data-piece-count={puzzle.pieces.length} className={styles.tray} style={{ "--scatter-rows": scatterRows } as CSSProperties}>
      {remaining.map((piece) =>
        <JigsawDragPiece key={piece.id} piece={piece} image={puzzle.image} number={puzzle.pieces.indexOf(piece) + 1}
          style={{
            left: `calc(${positionOf(piece).x * 100}% - var(--scatter-size) * ${positionOf(piece).x})`,
            top: `calc(${positionOf(piece).y * 100}% - var(--scatter-size) * ${positionOf(piece).y})`,
            zIndex: selected === piece.id ? 2 : 1,
            opacity: ghost?.piece.id === piece.id ? .25 : 1,
          }}
          onNudge={(dx, dy) => { setSelected(piece.id); const moved = nudgeScatter(positionOf(piece), dx, dy); setPositions((previous) => ({ ...previous, [piece.id]: moved })); }}
          selected={selected === piece.id} onSelect={() => setSelected(piece.id)}
          onMove={(sample) => {
            const input = dragInput(piece, sample), snap = findJigsawSnap(current.current, input);
            const area = scatter.current!.getBoundingClientRect();
            const inScatter = sample.position.x >= area.left && sample.position.x <= area.right && sample.position.y >= area.top && sample.position.y <= area.bottom;
            const size = parseFloat(getComputedStyle(scatter.current!).getPropertyValue("--scatter-size"));
            const width = inScatter ? size : piece.source.width / puzzle.image.width * input.board.width;
            const height = inScatter ? size * piece.source.height / piece.source.width : piece.source.height / puzzle.image.height * input.board.height;
            setGhost({ piece, x: sample.position.x - width / 2, y: sample.position.y - height / 2 - (sample.pointerType === "mouse" ? 0 : 56),
              width, height, targetId: snap?.targetId });
          }}
          onDrop={(sample) => drop(piece, sample)}
          onCancel={() => { setGhost(null); setSelected(null); }} />)}
    </div>
    </div>}
    </div>
    {ghost && createPortal(<div aria-hidden="true" data-jigsaw-ghost className={styles.ghost}
      style={{ left: ghost.x, top: ghost.y, width: ghost.width, height: ghost.height }}>
      <JigsawImagePiece image={puzzle.image} piece={ghost.piece} interlocking />
    </div>, document.body)}
  </section>;
}
