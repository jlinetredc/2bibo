import { afterEach, expect, it, vi } from "vitest";
import { createAudioManager } from "./audioManager";

const makeGain = () => ({ gain: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() });
const makeSource = () => ({ buffer: null, loop: false, onended: null as (() => void) | null, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() });

class FakeContext {
  static instances: FakeContext[] = [];
  state = "suspended";
  currentTime = 0;
  destination = {};
  gains: ReturnType<typeof makeGain>[] = [];
  sources: ReturnType<typeof makeSource>[] = [];
  constructor() { FakeContext.instances.push(this); }
  resume = vi.fn(async () => { this.state = "running"; });
  close = vi.fn(async () => { this.state = "closed"; });
  decodeAudioData = vi.fn(async (): Promise<unknown> => ({}));
  createGain() {
    const gain = makeGain();
    this.gains.push(gain);
    return gain;
  }
  createBufferSource() {
    const source = makeSource();
    this.sources.push(source);
    return source;
  }
}
afterEach(() => { vi.unstubAllGlobals(); FakeContext.instances = []; });
function setup() {
  vi.stubGlobal("AudioContext", FakeContext);
  const fetcher = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(4) }));
  vi.stubGlobal("fetch", fetcher);
  const manager = createAudioManager();
  return { manager, fetcher, context: () => FakeContext.instances[0] };
}

it("does not create audio or fetch until explicitly unlocked and played", async () => {
  const { manager, fetcher, context } = setup();
  expect(FakeContext.instances).toHaveLength(0);
  expect(await manager.play("voice", "/hello.wav")).toBe("locked");
  expect(fetcher).not.toHaveBeenCalled();
  expect(await manager.unlock()).toBe(true);
  expect(context().sources).toHaveLength(0);
  expect(await manager.play("voice", "/hello.wav")).toBe("started");
  expect(context().sources[0].start).toHaveBeenCalledOnce();
});

it("replaces each channel independently without accumulating SFX or narration", async () => {
  const { manager, context } = setup();
  await manager.unlock();
  await manager.play("music", "/music.wav");
  await manager.play("voice", "/one.wav");
  await manager.play("voice", "/two.wav");
  expect(context().sources[0].loop).toBe(true);
  expect(context().sources[0].stop).not.toHaveBeenCalled();
  expect(context().sources[1].stop).toHaveBeenCalledOnce();
  expect(context().sources[1].disconnect).toHaveBeenCalledOnce();
  await manager.play("sfx", "/effect.wav");
  await manager.play("sfx", "/effect.wav");
  expect(context().sources[3].stop).toHaveBeenCalledOnce();
  expect(context().sources[4].loop).toBe(false);
});

it("applies independent mute/volume and does not resume stopped audio on unmute", async () => {
  const { manager, context, fetcher } = setup();
  await manager.unlock();
  await manager.play("voice", "/one.wav");
  manager.setVolume("music", 0.1);
  expect(context().gains[0].gain.setValueAtTime).toHaveBeenLastCalledWith(0.1, 0);
  manager.setMuted("voice", true);
  expect(context().sources[0].stop).toHaveBeenCalledOnce();
  expect(context().gains[2].gain.setValueAtTime).toHaveBeenLastCalledWith(0, 0);
  expect(await manager.play("voice", "/two.wav")).toBe("muted");
  expect(fetcher).toHaveBeenCalledTimes(1);
  manager.setMuted("voice", false);
  expect(context().sources).toHaveLength(1);
  expect(manager.getSettings().music.muted).toBe(false);
});

it("clamps volumes, rejects non-finite values, and copies settings for future persistence", () => {
  const { manager } = setup();
  manager.setVolume("music", 2);
  manager.setVolume("sfx", -1);
  expect(manager.getSettings().music.volume).toBe(1);
  expect(manager.getSettings().sfx.volume).toBe(0);
  expect(() => manager.setVolume("voice", NaN)).toThrow(RangeError);
  const saved = manager.getSettings();
  const restored = createAudioManager(saved);
  saved.voice.volume = 0;
  expect(restored.getSettings().voice.volume).toBe(0.5);
  expect(manager.getSettings().voice.volume).toBe(0.5);
});

it.each(["stop", "mute", "zero", "dispose", "replace"])("prevents stale decoding from playing after %s", async (action) => {
  const { manager, context } = setup();
  await manager.unlock();
  let finish!: (value: unknown) => void;
  context().decodeAudioData.mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }));
  const pending = manager.play("voice", "/old.wav");
  await vi.waitFor(() => expect(finish).toBeDefined());
  if (action === "stop") manager.stop("voice");
  if (action === "mute") manager.setMuted("voice", true);
  if (action === "zero") manager.setVolume("voice", 0);
  if (action === "dispose") await manager.dispose();
  if (action === "replace") expect(await manager.play("voice", "/new.wav")).toBe("started");
  finish({});
  expect(await pending).toBe("cancelled");
  expect(context().sources).toHaveLength(action === "replace" ? 1 : 0);
});

it("handles network/decode errors and permits a later retry", async () => {
  const { manager, context, fetcher } = setup();
  await manager.unlock();
  fetcher.mockRejectedValueOnce(new Error("offline"));
  expect(await manager.play("sfx", "/bad.wav")).toBe("error");
  context().decodeAudioData.mockRejectedValueOnce(new Error("corrupt"));
  expect(await manager.play("sfx", "/bad.wav")).toBe("error");
  expect(await manager.play("sfx", "/good.wav")).toBe("started");
});

it("disconnects completed audio and disposes once", async () => {
  const { manager, context } = setup();
  await manager.unlock();
  await manager.play("sfx", "/short.wav");
  context().sources[0].onended!();
  manager.stop("sfx");
  expect(context().sources[0].stop).not.toHaveBeenCalled();
  expect(context().sources[0].disconnect).toHaveBeenCalledOnce();
  await manager.play("music", "/music.wav");
  await manager.dispose();
  await manager.dispose();
  expect(context().sources[1].stop).toHaveBeenCalledOnce();
  expect(context().close).toHaveBeenCalledOnce();
  expect(await manager.unlock()).toBe(false);
  expect(await manager.play("music", "/music.wav")).toBe("cancelled");
});

it("tolerates unavailable audio and rejected resume", async () => {
  const { manager, context } = setup();
  await manager.unlock();
  context().state = "suspended";
  context().resume.mockRejectedValueOnce(new Error("blocked"));
  expect(await manager.unlock()).toBe(false);
  expect(await manager.play("music", "/music.wav")).toBe("locked");
  vi.stubGlobal("AudioContext", undefined);
  expect(await createAudioManager().unlock()).toBe(false);
});

it("aborts an outstanding download on stop without later playback", async () => {
  const { manager, context } = setup();
  await manager.unlock();
  let signal: AbortSignal | undefined;
  vi.stubGlobal("fetch", vi.fn((_url: string, options: RequestInit) => new Promise((_resolve, reject) => {
    signal = options.signal!;
    signal.addEventListener("abort", () => reject(new DOMException("Stopped", "AbortError")));
  })));
  const pending = manager.play("voice", "/slow.wav");
  manager.stop("voice");
  expect(signal?.aborted).toBe(true);
  expect(await pending).toBe("cancelled");
  expect(context().sources).toHaveLength(0);
});

it("does not start a decoded clip while the browser has suspended the context", async () => {
  const { manager, context } = setup();
  await manager.unlock();
  context().decodeAudioData.mockImplementationOnce(async () => {
    context().state = "suspended";
    return {};
  });
  expect(await manager.play("voice", "/voice.wav")).toBe("locked");
  expect(context().sources).toHaveLength(0);
  expect(await manager.unlock()).toBe(true);
  expect(await manager.play("voice", "/voice.wav")).toBe("started");
});
