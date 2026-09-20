export const audioChannels = ["music", "sfx", "voice"] as const;
export type AudioChannel = typeof audioChannels[number];
export interface ChannelSettings { muted: boolean; volume: number }
export type AudioSettings = Record<AudioChannel, ChannelSettings>;
export type PlayResult = "started" | "muted" | "locked" | "cancelled" | "error";

interface Playback {
  abort: AbortController;
  source?: AudioBufferSourceNode;
}

/** Lazy, session-scoped Web Audio service. Construct once per host and dispose on exit. */
export function createAudioManager(initial?: AudioSettings) {
  const settings: AudioSettings = {
    music: { muted: false, volume: 0.25 },
    sfx: { muted: false, volume: 0.4 },
    voice: { muted: false, volume: 0.5 },
  };
  function volume(value: number) {
    if (!Number.isFinite(value)) throw new RangeError("Audio volume must be finite.");
    return Math.max(0, Math.min(1, value));
  }
  if (initial) for (const channel of audioChannels) {
    settings[channel] = { muted: initial[channel].muted, volume: volume(initial[channel].volume) };
  }
  let context: AudioContext | undefined;
  let disposed = false;
  const gains = new Map<AudioChannel, GainNode>();
  const playing = new Map<AudioChannel, Playback>();

  function stop(channel: AudioChannel) {
    const current = playing.get(channel);
    playing.delete(channel);
    if (!current) return;
    current.abort.abort();
    if (current.source) {
      current.source.onended = null;
      try { current.source.stop(); } catch { /* A failed start has nothing to stop. */ }
      current.source.disconnect();
    }
  }
  function stopAll() { audioChannels.forEach(stop); }
  function applyGain(channel: AudioChannel) {
    const gain = gains.get(channel);
    if (gain && context) {
      gain.gain.setValueAtTime(settings[channel].muted ? 0 : settings[channel].volume, context.currentTime);
    }
  }

  return {
    /** Call directly from a tap/click handler; never on mount or from a timer. */
    async unlock(): Promise<boolean> {
      if (disposed) return false;
      try {
        if (!context) {
          context = new AudioContext();
          for (const channel of audioChannels) {
            const gain = context.createGain();
            gain.connect(context.destination);
            gains.set(channel, gain);
            applyGain(channel);
          }
        }
        await context.resume();
        return !disposed && context.state === "running";
      } catch {
        return false; // Unsupported/blocked audio must never prevent gameplay.
      }
    },
    getSettings(): AudioSettings {
      return { music: { ...settings.music }, sfx: { ...settings.sfx }, voice: { ...settings.voice } };
    },
    setMuted(channel: AudioChannel, muted: boolean) {
      settings[channel].muted = muted;
      if (muted) stop(channel); // No stale speech or pending download resumes on unmute.
      applyGain(channel);
    },
    setVolume(channel: AudioChannel, value: number) {
      settings[channel].volume = volume(value);
      if (settings[channel].volume === 0) stop(channel);
      applyGain(channel);
    },
    async play(channel: AudioChannel, url: string, options: { loop?: boolean } = {}): Promise<PlayResult> {
      if (disposed) return "cancelled";
      if (!context || context.state !== "running") return "locked";
      stop(channel); // One active or pending clip per channel, including SFX.
      if (settings[channel].muted || settings[channel].volume === 0) return "muted";
      const audioContext = context;
      const current: Playback = { abort: new AbortController() };
      playing.set(channel, current);
      const stale = () => disposed || playing.get(channel) !== current;
      try {
        const response = await fetch(url, { signal: current.abort.signal });
        if (!response.ok) throw new Error("Audio request failed.");
        const bytes = await response.arrayBuffer();
        if (stale()) return "cancelled";
        const buffer = await audioContext.decodeAudioData(bytes);
        if (stale()) return "cancelled";
        if (audioContext.state !== "running") { stop(channel); return "locked"; }
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = options.loop ?? channel === "music";
        source.connect(gains.get(channel)!);
        source.onended = () => {
          source.disconnect();
          if (playing.get(channel) === current) playing.delete(channel);
        };
        current.source = source;
        source.start();
        return "started";
      } catch {
        if (stale()) return "cancelled";
        stop(channel);
        return "error";
      }
    },
    stop,
    stopAll,
    async dispose() {
      if (disposed) return;
      disposed = true;
      stopAll();
      gains.forEach((gain) => gain.disconnect());
      gains.clear();
      if (context && context.state !== "closed") {
        try { await context.close(); } catch { /* Already closed by the browser. */ }
      }
    },
  };
}
