import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createAudioManager, type AudioChannel, type AudioSettings } from "../../../src/game-core/audio/audioManager";
import { loadAudioSettings, saveAudioSettings } from "../../../src/game-core/audio/audioSettings";
import { GameShell } from "../../../src/game-core/GameShell";
import "../../../src/app/globals.css";

// Locally generated, quiet two-second tone; no external media/assets required.
function toneUrl() {
  const count = 16000;
  const bytes = new ArrayBuffer(44 + count * 2);
  const view = new DataView(bytes);
  const text = (offset: number, value: string) => [...value].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)));
  text(0, "RIFF"); view.setUint32(4, bytes.byteLength - 8, true); text(8, "WAVE");
  text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true); view.setUint32(28, 16000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, "data"); view.setUint32(40, count * 2, true);
  for (let i = 0; i < count; i++) view.setInt16(44 + i * 2, Math.sin(i * 2 * Math.PI * 220 / 8000) * 600, true);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}

function Fixture({ initial, storageFailed = false }: { initial?: AudioSettings; storageFailed?: boolean }) {
  const [manager] = useState(() => createAudioManager(initial));
  const [status, setStatus] = useState("Sẵn sàng");
  const [muted, setMuted] = useState(initial ? Object.values(initial).every((channel) => channel.muted) : false);
  const [storageStatus, setStorageStatus] = useState(storageFailed ? "unavailable" : "ready");
  useEffect(() => () => { void manager.dispose(); }, [manager]);
  async function play(channel: AudioChannel) {
    if (!await manager.unlock()) { setStatus("locked"); return; }
    const url = toneUrl();
    try { setStatus(await manager.play(channel, url)); } finally { URL.revokeObjectURL(url); }
  }
  return <GameShell title="Kiểm tra âm thanh" muted={muted} onMutedChange={(next) => {
    setMuted(next);
    for (const channel of ["music", "sfx", "voice"] as const) manager.setMuted(channel, next);
    void saveAudioSettings(manager.getSettings()).then(() => setStorageStatus("saved"), () => setStorageStatus("unavailable"));
  }} onBack={() => { manager.stopAll(); setStatus("stopped"); }} onRestart={() => { manager.stopAll(); setStatus("stopped"); }}>
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {(["music", "sfx", "voice"] as const).map((channel) => <button key={channel} type="button"
        style={{ minWidth: 64, minHeight: 52, border: "2px solid", padding: 8 }}
        onClick={() => { void play(channel); }}>Phát {channel}</button>)}
    </div>
    <p role="status">{status}</p>
    <p data-testid="storage">{storageStatus}</p>
  </GameShell>;
}

const root = createRoot(document.getElementById("root")!);
void loadAudioSettings().then(
  (initial) => root.render(<Fixture initial={initial ?? undefined} />),
  () => root.render(<Fixture storageFailed />),
);
