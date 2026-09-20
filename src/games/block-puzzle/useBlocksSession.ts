"use client";

import { useEffect, useRef, useState } from "react";
import { audioChannels, createAudioManager } from "@/game-core/audio/audioManager";
import { loadAudioSettings, saveAudioSettings } from "@/game-core/audio/audioSettings";
import { loadProfiles } from "@/game-core/profiles/profiles";
import { freshBlocksProgress, loadBlocksProgress, saveBlocksProgress, type BlocksProgress } from "./progress";

/** Standalone host owns browser services; reusable games only emit state/feedback. */
export function useBlocksSession() {
  const [data, setData] = useState<BlocksProgress | null>(null);
  const [muted, setMuted] = useState(false);
  const [warning, setWarning] = useState("");
  const latest = useRef<BlocksProgress | null>(null);
  const audio = useRef<ReturnType<typeof createAudioManager> | null>(null);
  const profile = useRef<string | null>(null);
  const writable = useRef(false), audioWritable = useRef(false), alive = useRef(false);
  const soundRequest = useRef(0);
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let cancelled = false;
    alive.current = true;
    async function load() {
      const [profiles, settings] = await Promise.allSettled([loadProfiles(), loadAudioSettings()]);
      if (cancelled) return;
      audioWritable.current = settings.status === "fulfilled";
      const manager = createAudioManager(settings.status === "fulfilled" ? settings.value ?? undefined : undefined);
      audio.current = manager; setMuted(manager.getSettings().sfx.muted);
      let restored = freshBlocksProgress();
      let canWrite = false;
      if (profiles.status === "fulfilled") {
        profile.current = profiles.value.activeId;
        try { restored = await loadBlocksProgress(profile.current) ?? restored; canWrite = true; }
        catch { /* Preserve an unreadable record rather than overwrite it. */ }
      }
      if (cancelled) return;
      writable.current = canWrite;
      if (!writable.current || !audioWritable.current) setWarning("Không thể đọc bản lưu. Con vẫn chơi được; bản lưu cũ được giữ lại.");
      latest.current = restored; setData(restored);
    }
    void load();
    const silence = () => { if (document.hidden) { soundRequest.current++; audio.current?.stopAll(); } };
    document.addEventListener("visibilitychange", silence);
    return () => {
      cancelled = true; alive.current = false;
      document.removeEventListener("visibilitychange", silence);
      void audio.current?.dispose(); audio.current = null;
    };
  }, []);

  function update(patch: Partial<BlocksProgress>) {
    stopSound();
    const next = { ...latest.current!, ...patch };
    latest.current = next; setData(next);
    if (!writable.current) return;
    const id = profile.current;
    // Ordered snapshots, captured profile identity, no delayed debounce on exit.
    writes.current = writes.current.then(() => saveBlocksProgress(id, next)).then(() => {
      if (alive.current) setWarning((current) => current.startsWith("Chưa lưu được lượt") ? "" : current);
    }).catch(() => {
      if (alive.current) setWarning("Chưa lưu được lượt chơi này. Con vẫn có thể tiếp tục chơi.");
    });
  }
  function stopSound() { soundRequest.current++; audio.current?.stopAll(); }
  function feedback(kind: "place" | "celebrate") {
    const manager = audio.current;
    if (!manager || manager.getSettings().sfx.muted) return;
    const request = ++soundRequest.current;
    // Called from the game gesture, not an effect or autoplay.
    void manager.unlock().then((ready) => {
      if (ready && request === soundRequest.current && alive.current) void manager.play("sfx", `/audio/blocks-${kind}.wav`);
    });
  }
  function changeMuted(value: boolean) {
    stopSound(); setMuted(value);
    const manager = audio.current;
    if (!manager) return;
    audioChannels.forEach((channel) => manager.setMuted(channel, value));
    if (!audioWritable.current) return;
    const settings = manager.getSettings();
    writes.current = writes.current.then(() => saveAudioSettings(settings)).then(() => {
      if (alive.current) setWarning((current) => current === "Chưa lưu được lựa chọn âm thanh." ? "" : current);
    }).catch(() => {
      if (alive.current) setWarning("Chưa lưu được lựa chọn âm thanh.");
    });
  }
  return { data, update, muted, changeMuted, feedback, stopSound, warning };
}
