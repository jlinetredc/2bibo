import { afterEach, expect, it, vi } from "vitest";
import { createLocalStorageStore } from "./localStorage";
import { createVersionedStore } from "./store";
import { isAudioSettings, loadAudioSettings, saveAudioSettings } from "../audio/audioSettings";
import { createAudioManager } from "../audio/audioManager";

afterEach(() => { localStorage.clear(); vi.restoreAllMocks(); });
const validate = (value: unknown): value is { count: number } => typeof value === "object" && value !== null && "count" in value && typeof value.count === "number";
const setup = () => createVersionedStore(createLocalStorageStore("test"), { version: 1, validate });

it("round-trips, updates, removes, and isolates namespaces", async () => {
  const store = setup();
  expect(await store.get("one")).toBeNull();
  await store.set("one", { count: 1 });
  expect(await setup().get("one")).toEqual({ count: 1 });
  await store.set("one", { count: 2 });
  expect(await store.get("one")).toEqual({ count: 2 });
  expect(await createLocalStorageStore("other").get("one")).toBeNull();
  await store.remove("one");
  await store.remove("one");
  expect(await store.get("one")).toBeNull();
});

it("migrates sequentially without writing on read", async () => {
  const backend = createLocalStorageStore("test");
  await backend.set("one", { version: 1, data: 3 });
  const store = createVersionedStore(backend, { version: 3, validate, migrations: {
    1: (data) => ({ count: Number(data) }),
    2: (data) => ({ count: (data as { count: number }).count + 1 }),
  } });
  expect(await store.get("one")).toEqual({ count: 4 });
  expect(await backend.get("one")).toEqual({ version: 1, data: 3 });
});

it.each(["bad json", JSON.stringify({ version: 1, data: {} }), JSON.stringify({ version: 0, data: {} })])("reports corrupt data and preserves raw bytes: %s", async (raw) => {
  localStorage.setItem("test:one", raw);
  await expect(setup().get("one")).rejects.toMatchObject({ code: "corrupt" });
  expect(localStorage.getItem("test:one")).toBe(raw);
});

it("rejects future versions, missing migrations, and invalid writes", async () => {
  const backend = createLocalStorageStore("test");
  await backend.set("one", { version: 2, data: { count: 1 } });
  await expect(setup().get("one")).rejects.toMatchObject({ code: "version" });
  await expect(createVersionedStore(backend, { version: 3, validate }).get("one")).rejects.toMatchObject({ code: "version" });
  await expect(setup().set("one", { count: "bad" } as unknown as { count: number })).rejects.toMatchObject({ code: "invalid" });
  expect(await backend.get("one")).toMatchObject({ version: 2 });
});

it("reports migration failures without discarding stored data", async () => {
  const backend = createLocalStorageStore("test");
  await backend.set("one", { version: 1, data: { count: 1 } });
  const store = createVersionedStore(backend, { version: 2, validate, migrations: { 1: () => { throw new Error("bad"); } } });
  await expect(store.get("one")).rejects.toMatchObject({ code: "corrupt" });
  expect(await backend.get("one")).toMatchObject({ version: 1 });
});

it("reports unavailable storage and quota errors, never claiming a save", async () => {
  const blocked = createLocalStorageStore("test", () => { throw new DOMException("blocked", "SecurityError"); });
  await expect(blocked.get("one")).rejects.toMatchObject({ code: "storage" });
  await expect(blocked.set("one", 1)).rejects.toMatchObject({ code: "storage" });
  await expect(blocked.remove("one")).rejects.toMatchObject({ code: "storage" });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("full", "QuotaExceededError"); });
  await expect(setup().set("one", { count: 1 })).rejects.toMatchObject({ code: "storage" });
});

it("saves and restores validated audio preferences without enabling playback", async () => {
  const manager = createAudioManager();
  manager.setMuted("voice", true);
  manager.setVolume("music", 0.1);
  await saveAudioSettings(manager.getSettings());
  const saved = await loadAudioSettings();
  const restored = createAudioManager(saved!);
  expect(restored.getSettings()).toEqual(manager.getSettings());
  expect(isAudioSettings({ voice: { muted: "yes", volume: 4 } })).toBe(false);
  expect(await restored.play("music", "/not-fetched.wav")).toBe("locked");
});
