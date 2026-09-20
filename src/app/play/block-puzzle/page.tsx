"use client";

import { lazy, Suspense, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameShell } from "@/game-core/GameShell";
import { gameRegistry } from "@/game-core/registry";
import styles from "@/games/block-puzzle/ShapeFillGame.module.css";
import { useBlocksSession } from "@/games/block-puzzle/useBlocksSession";
import { createClassicGame } from "@/games/block-puzzle/domain/classic";
import { BlocksSettings } from "@/games/block-puzzle/BlocksSettings";
import { FirstPlayGuide } from "@/games/block-puzzle/FirstPlayGuide";
import scene from "@/games/block-puzzle/BlocksScene.module.css";
import { createShapeFill } from "@/games/block-puzzle/domain/shapeFill";
import { createPuzzleState } from "@/games/block-puzzle/domain/puzzle";
import type { BlocksVariant } from "@/games/block-puzzle/progress";

const definition = gameRegistry.get("block-puzzle")!;
const ClassicGame = lazy(() => definition.load() as Promise<typeof import("@/games/block-puzzle/ClassicGame")>);
const ShapeFillGame = lazy(() => import("@/games/block-puzzle/ShapeFillGame"));
const PuzzleGame = lazy(() => import("@/games/block-puzzle/PuzzleGame"));

export default function BlocksPage() {
  const router = useRouter();
  const [round, setRound] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const playArea = useRef<HTMLDivElement>(null), settingsButton = useRef<HTMLButtonElement>(null);
  const session = useBlocksSession();
  const { data, update, feedback } = session;
  if (!data) return <p role="status">Đang mở bàn chơi…</p>;
  const variant = data.variant;
  function setVariant(variant: BlocksVariant) { session.stopSound(); update({ variant }); }
  function restart() {
    session.stopSound();
    if (variant === "classic") update({ classic: createClassicGame({ size: data!.classic.board.columns, pieceSet: data!.classic.generator.pieceSet }) });
    else if (variant === "shape-fill") update({ shape: createShapeFill(data!.shape.targetId) });
    else update({ puzzle: createPuzzleState(data!.puzzle.definition) });
    setRound((value) => value + 1);
  }
  function dismissGuide() { if (data?.tutorialSeen === false) update({ tutorialSeen: true }); }
  function closeSettings() { setSettingsOpen(false); settingsButton.current?.focus(); }
  return <div className={scene.scene}><GameShell title={definition.name} onBack={() => { session.stopSound(); router.push("/play"); }}
    onRestart={restart} muted={session.muted} onMutedChange={session.changeMuted} showAudioControl={false}>
    {session.warning && <p role="note">{session.warning}</p>}
    <div className={scene.workspace}>
    <div className={scene.toolbar}>
    <nav aria-label="Chế độ Blocks" className={styles.modes}>
      <button type="button" className={styles.mode} aria-current={variant === "classic" ? "page" : undefined} onClick={() => setVariant("classic")}>Xếp khối</button>
      <button type="button" className={styles.mode} aria-current={variant === "shape-fill" ? "page" : undefined} onClick={() => setVariant("shape-fill")}>Lấp hình</button>
      <button type="button" className={styles.mode} aria-current={variant === "puzzle" ? "page" : undefined} onClick={() => setVariant("puzzle")}>Ghép kín</button>
    </nav>
    <div className={scene.options}>
      <button ref={settingsButton} type="button" aria-label="Cài đặt cho bố mẹ" aria-haspopup="dialog"
        onClick={() => { dismissGuide(); session.stopSound(); setSettingsOpen(true); }}>
        <span aria-hidden="true">⚙️</span>
      </button>
    </div>
    </div>
    <div ref={playArea} className={scene.playArea} onPointerDownCapture={dismissGuide} onKeyDownCapture={dismissGuide}>
    {variant === "classic" && data.classic.board.columns > 5 && <p className={scene.scrollNote}>Bàn rộng hơn — vuốt ngang bàn nếu cần nhé!</p>}
    <Suspense fallback={<p role="status">Đang mở bàn chơi…</p>}>
      {variant === "classic" ? <ClassicGame key={round} mode="standalone" initialState={data.classic} hintsEnabled={data.hintsEnabled ?? true}
        onStateChange={(classic) => update({ classic })} onFeedback={feedback} /> : variant === "shape-fill" ? <ShapeFillGame key={round} mode="standalone"
        initialState={data.shape} hintsEnabled={data.hintsEnabled ?? true} onStateChange={(shape) => update({ shape })} onFeedback={feedback} /> : <PuzzleGame key={round} mode="standalone"
        initialState={data.puzzle} hintsEnabled={data.hintsEnabled ?? true} onStateChange={(puzzle) => update({ puzzle })} onFeedback={feedback} />}
    </Suspense>
    {data.tutorialSeen === false && !settingsOpen && <FirstPlayGuide root={playArea} data={data} onDismiss={dismissGuide} />}
    </div>
    {settingsOpen && <BlocksSettings classic={data.classic} hints={data.hintsEnabled ?? true} muted={session.muted}
      onHints={(hintsEnabled) => update({ hintsEnabled })} onMuted={session.changeMuted} onClose={closeSettings}
      onTutorial={() => { update({ tutorialSeen: false }); closeSettings(); }}
      onNewBoard={(size, baby) => { update({ classic: createClassicGame({ size, pieceSet: baby ? "baby" : undefined }), variant: "classic" }); setRound((value) => value + 1); closeSettings(); }} />}
    </div>
  </GameShell></div>;
}
