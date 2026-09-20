import { audioChannels, type AudioSettings } from "./audioManager";
import { createLocalStorageStore } from "../persistence/localStorage";
import { createVersionedStore } from "../persistence/store";

export function isAudioSettings(value: unknown): value is AudioSettings {
  if (typeof value !== "object" || !value) return false;
  return audioChannels.every((key) => {
    const channel = (value as Record<string, unknown>)[key];
    if (!channel || typeof channel !== "object") return false;
    const { muted, volume } = channel as Record<string, unknown>;
    return typeof muted === "boolean" && typeof volume === "number" && Number.isFinite(volume) && volume >= 0 && volume <= 1;
  });
}

const store = createVersionedStore(createLocalStorageStore(), { version: 1, validate: isAudioSettings });
/** Load before enabling audio controls; callers handle unavailable/corrupt storage. */
export const loadAudioSettings = () => store.get("audio-settings");
export const saveAudioSettings = (settings: AudioSettings) => store.set("audio-settings", settings);
