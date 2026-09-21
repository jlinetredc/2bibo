"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GameShell } from "@/game-core/GameShell";
import { gameRegistry } from "@/game-core/registry";
import { loadProfiles } from "@/game-core/profiles/profiles";
import type { DifficultyProfile } from "@/game-core/difficulty/difficultyService";

const definition = gameRegistry.get("counting-adventure")!;
const CountingAdventure = lazy(() => definition.load() as Promise<typeof import("@/games/counting-adventure/CountingAdventure")>);
export default function CountingPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DifficultyProfile | null | undefined>(undefined);
  const [warning, setWarning] = useState("");
  const [round, setRound] = useState(0);
  useEffect(() => {
    let alive = true;
    loadProfiles().then((data) => { if (alive) setProfile(data.profiles.find((entry) => entry.id === data.activeId) ?? null); })
      .catch(() => { if (alive) { setProfile(null); setWarning("Chưa mở được hồ sơ. Mình bắt đầu với 3 vật nhé!"); } });
    return () => { alive = false; };
  }, []);
  return <GameShell title={definition.name} onBack={() => router.push("/play")} onRestart={() => setRound((value) => value + 1)}
    muted showAudioControl={false} onMutedChange={() => {}}>
    {warning && <p role="note">{warning}</p>}
    {profile === undefined ? <p role="status">Đang mở hoạt động…</p> : <Suspense fallback={<p role="status">Đang mở hoạt động…</p>}>
      <CountingAdventure restartKey={round} mode="standalone" config={{ scenarioId: "feed-animals", profile }} />
    </Suspense>}
  </GameShell>;
}
