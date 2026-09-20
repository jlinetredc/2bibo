import { createIndexedDBStore } from "../../../src/game-core/persistence/indexedDB";
import { createLocalStorageStore } from "../../../src/game-core/persistence/localStorage";
import { createVersionedStore } from "../../../src/game-core/persistence/store";

const localRaw = createLocalStorageStore("persistence-test");
const largeRaw = createIndexedDBStore("bibo-persistence-test");
const schema = {
  version: 2,
  validate: (data: unknown): data is { text: string; bytes?: ArrayBuffer } => !!data && typeof data === "object" && "text" in data && typeof data.text === "string",
  migrations: { 1: (data: unknown) => ({ text: String(data) }) },
};
const fixture = { localRaw, largeRaw, local: createVersionedStore(localRaw, schema), large: createVersionedStore(largeRaw, schema) };
declare global { interface Window { persistenceFixture: typeof fixture } }
window.persistenceFixture = fixture;
document.getElementById("status")!.textContent = "ready";
