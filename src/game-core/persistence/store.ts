export interface KeyValueStore {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export class PersistenceError extends Error {
  constructor(public readonly code: "storage" | "corrupt" | "version" | "invalid" | "blocked", message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "PersistenceError";
  }
}

export function createVersionedStore<T>(backend: KeyValueStore, schema: {
  version: number;
  validate: (value: unknown) => value is T;
  /** Each key N converts payload version N to N+1. Must be pure. */
  migrations?: Readonly<Record<number, (value: unknown) => unknown>>;
}) {
  if (!Number.isSafeInteger(schema.version) || schema.version < 1) throw new RangeError("Invalid schema version.");
  return {
    async get(key: string): Promise<T | null> {
      const record = await backend.get(key);
      if (record === null) return null;
      if (typeof record !== "object" || !record || !("version" in record) || !("data" in record)
        || !Number.isSafeInteger(record.version) || (record.version as number) < 1) {
        throw new PersistenceError("corrupt", "Invalid stored envelope.");
      }
      let version = record.version as number;
      let data: unknown = record.data;
      if (version > schema.version) throw new PersistenceError("version", "Stored data is newer than this reader.");
      while (version < schema.version) {
        const migrate = schema.migrations?.[version];
        if (!migrate) throw new PersistenceError("version", "Missing data migration.");
        try { data = migrate(data); } catch (cause) {
          throw new PersistenceError("corrupt", "Data migration failed.", { cause });
        }
        version++;
      }
      if (!schema.validate(data)) throw new PersistenceError("corrupt", "Stored data failed validation.");
      // Read-only migration avoids overwriting a newer concurrent write.
      return data;
    },
    async set(key: string, value: T): Promise<void> {
      if (!schema.validate(value)) throw new PersistenceError("invalid", "Data failed validation.");
      await backend.set(key, { version: schema.version, data: value });
    },
    remove: (key: string) => backend.remove(key),
  };
}
