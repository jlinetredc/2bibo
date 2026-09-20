"use client";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { GameShell } from "@/game-core/GameShell";
import { gameRegistry } from "@/game-core/registry";
import { loadProfiles } from "@/game-core/profiles/profiles";
import type { DifficultyProfile } from "@/game-core/difficulty/difficultyService";
import { getJigsawDifficulty } from "@/games/jigsaw/domain/difficulty";
import type { JigsawDifficulty, JigsawPieceCount } from "@/games/jigsaw/domain/difficultyPresets";
import { JIGSAW_THEME_PACKS, generateThemedPuzzle } from "@/games/jigsaw/data/themePacks";
import { PictureLibrary } from "@/games/jigsaw/PictureLibrary";
import styles from "@/games/jigsaw/JigsawGame.module.css";

const definition = gameRegistry.get("jigsaw")!;
const JigsawGame = lazy(() => definition.load() as Promise<typeof import("@/games/jigsaw/JigsawGame")>);
const pictures = JIGSAW_THEME_PACKS.flatMap((pack) => pack.pictures.map((picture) => ({ pack, picture })));
const countLevels: Record<JigsawPieceCount, JigsawDifficulty> = { 4: "starter", 6: "easy", 9: "standard", 12: "standard", 16: "advanced", 24: "advanced" };
export default function JigsawPage() {
  const router = useRouter(), chooser = useRef<HTMLButtonElement>(null);
  const [profile, setProfile] = useState<DifficultyProfile | null | undefined>(undefined);
  const [warning, setWarning] = useState("");
  const [active, setActive] = useState(pictures[0].picture.id), [round, setRound] = useState(0);
  const [activeCount, setActiveCount] = useState<JigsawPieceCount | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  useEffect(() => {
    let alive = true;
    loadProfiles().then((data) => { if (alive) setProfile(data.profiles.find((p) => p.id === data.activeId) ?? null); })
      .catch(() => { if (alive) { setProfile(null); setWarning("Chưa mở được hồ sơ. Bé chơi bàn 4 mảnh nhé!"); } });
    return () => { alive = false; };
  }, []);
  const choice = pictures.find((p) => p.picture.id === active)!;
  const count = activeCount ?? getJigsawDifficulty(profile).counts[0];
  const puzzle = generateThemedPuzzle({ id: `${active}-${count}`, themeId: choice.pack.id, pictureId: active, profile, level: countLevels[count], pieceCount: count });
  function closeLibrary() { setLibraryOpen(false); requestAnimationFrame(() => chooser.current?.focus()); }
  return <div className={styles.scene}><GameShell title="Ghép tranh" onBack={() => router.push("/play")} onRestart={() => setRound((r) => r + 1)}
    muted showAudioControl={false} onMutedChange={() => {}}>
    {warning && <p role="note">{warning}</p>}
    <div className={styles.playToolbar}>
      <div className={styles.currentPicture}>
        <span className={styles.pictureBadge} aria-hidden="true">🧩</span>
        <div><strong>{choice.picture.title}</strong><span>🧩 {count} mảnh</span></div>
      </div>
      <button ref={chooser} type="button" aria-haspopup="dialog" onClick={() => setLibraryOpen(true)}>🖼️ Chọn tranh</button>
    </div>
    {profile === undefined ? <p role="status">Đang mở bàn chơi…</p> : <Suspense fallback={<p role="status">Đang mở bàn chơi…</p>}>
      <JigsawGame key={`${active}-${round}`} mode="standalone" config={puzzle} onChoosePicture={() => setLibraryOpen(true)} />
    </Suspense>}
    {libraryOpen && <PictureLibrary pictureId={active} count={count} onClose={closeLibrary}
      onStart={(id, size) => { setActive(id); setActiveCount(size); setRound((r) => r + 1); closeLibrary(); }} />}
  </GameShell></div>;
}
