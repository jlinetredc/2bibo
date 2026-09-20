import { PersistenceError, type KeyValueStore } from "./store";

/** JSON-compatible small preferences. Browser access occurs only during operations. */
export function createLocalStorageStore(namespace = "bibo-play", storage = () => window.localStorage): KeyValueStore {
  const keyFor = (key: string) => `${encodeURIComponent(namespace)}:${encodeURIComponent(key)}`;
  return {
    async get(key) {
      let value: string | null;
      try { value = storage().getItem(keyFor(key)); } catch (cause) {
        throw new PersistenceError("storage", "Cannot read local storage.", { cause });
      }
      if (value === null) return null;
      try { return JSON.parse(value) as unknown; } catch (cause) {
        throw new PersistenceError("corrupt", "Invalid stored JSON.", { cause });
      }
    },
    async set(key, value) {
      try {
        const json = JSON.stringify(value);
        if (json === undefined) throw new TypeError("Value is not JSON serializable.");
        storage().setItem(keyFor(key), json);
      } catch (cause) {
        throw new PersistenceError("storage", "Cannot write local storage.", { cause });
      }
    },
    async remove(key) {
      try { storage().removeItem(keyFor(key)); } catch (cause) {
        throw new PersistenceError("storage", "Cannot remove local storage entry.", { cause });
      }
    },
  };
}
