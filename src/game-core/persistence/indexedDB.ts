import { PersistenceError, type KeyValueStore } from "./store";

/** Structured-clone storage for larger data, including Blobs. One connection per operation. */
export function createIndexedDBStore(database = "bibo-play"): KeyValueStore {
  function open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      let abandoned = false;
      let request: IDBOpenDBRequest;
      try { request = indexedDB.open(database, 1); } catch (cause) {
        reject(new PersistenceError("storage", "IndexedDB is unavailable.", { cause }));
        return;
      }
      request.onupgradeneeded = () => {
        if (abandoned) { request.transaction?.abort(); return; }
        request.result.createObjectStore("entries");
      };
      request.onblocked = () => {
        abandoned = true;
        reject(new PersistenceError("blocked", "Database upgrade is blocked by another connection."));
      };
      request.onerror = () => reject(new PersistenceError("storage", "Cannot open IndexedDB.", { cause: request.error }));
      request.onsuccess = () => {
        const db = request.result;
        if (abandoned) { db.close(); return; }
        db.onversionchange = () => db.close();
        resolve(db);
      };
    });
  }

  async function run(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest): Promise<unknown> {
    const db = await open();
    try {
      return await new Promise((resolve, reject) => {
        const transaction = db.transaction("entries", mode);
        let result: unknown;
        transaction.oncomplete = () => resolve(result);
        transaction.onabort = () => reject(new PersistenceError("storage", "IndexedDB transaction aborted.", { cause: transaction.error }));
        // Request failures abort the transaction by default. Do not resolve on request success.
        try {
          const request = operation(transaction.objectStore("entries"));
          request.onsuccess = () => { result = request.result; };
        } catch (cause) {
          transaction.abort();
          reject(new PersistenceError("storage", "Cannot store this value.", { cause }));
        }
      });
    } catch (cause) {
      if (cause instanceof PersistenceError) throw cause;
      throw new PersistenceError("storage", "IndexedDB operation failed.", { cause });
    } finally { db.close(); }
  }
  return {
    async get(key) { return (await run("readonly", (store) => store.get(key))) ?? null; },
    async set(key, value) { await run("readwrite", (store) => store.put(value, key)); },
    async remove(key) { await run("readwrite", (store) => store.delete(key)); },
  };
}
