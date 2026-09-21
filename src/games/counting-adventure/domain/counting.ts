export interface CountingItem { readonly id: string; readonly label: string; readonly symbol: string }
export interface CountingDefinition {
  readonly id: string;
  readonly target: number;
  readonly instruction: string;
  readonly destinationLabel: string;
  readonly destinationSymbol?: string;
  readonly items: readonly CountingItem[];
}
export interface CountingState {
  readonly definition: CountingDefinition;
  readonly placedIds: readonly string[];
  readonly status: "playing" | "retry" | "complete";
}
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

/** Count each distinct object once. No coordinates, themes, storage or age policy. */
export function createCountingState(definition: CountingDefinition): CountingState {
  if (!definition || !text(definition.id) || !text(definition.instruction) || !text(definition.destinationLabel)
    || (definition.destinationSymbol !== undefined && !text(definition.destinationSymbol))
    || !Array.isArray(definition.items) || definition.items.length < 1 || definition.items.length > 20
    || !Number.isInteger(definition.target) || definition.target < 1 || definition.target > definition.items.length) {
    throw new RangeError("Counting requires a reachable target and 1–20 objects with instructions.");
  }
  const ids = new Set<string>();
  const items = Array.from(definition.items, (item) => {
    if (!item || !text(item.id) || item.id.trim() !== item.id || ids.has(item.id) || !text(item.label) || !text(item.symbol)) {
      throw new TypeError("Counting objects need unique IDs, labels and symbols.");
    }
    ids.add(item.id);
    return Object.freeze({ id: item.id, label: item.label, symbol: item.symbol });
  });
  return Object.freeze({ definition: Object.freeze({ id: definition.id, target: definition.target,
    instruction: definition.instruction, destinationLabel: definition.destinationLabel,
    ...(definition.destinationSymbol === undefined ? {} : { destinationSymbol: definition.destinationSymbol }), items: Object.freeze(items) }),
    placedIds: Object.freeze([]), status: "playing" });
}

/** A drop commits once; invalid IDs, duplicates and completed-round events do nothing. */
export function moveCountingItem(state: CountingState, id: string, placed: boolean): CountingState {
  if (state.status === "complete" || typeof placed !== "boolean" || !state.definition.items.some((item) => item.id === id)
    || state.placedIds.includes(id) === placed) return state;
  return Object.freeze({ ...state, status: "playing", placedIds: Object.freeze(placed
    ? [...state.placedIds, id] : state.placedIds.filter((entry) => entry !== id)) });
}

/** Explicit confirmation lets children explore too few/too many and adjust freely. */
export function checkCounting(state: CountingState): CountingState {
  const status = state.placedIds.length === state.definition.target ? "complete" : "retry";
  return state.status === "complete" || state.status === status ? state : Object.freeze({ ...state, status });
}

export function resetCounting(state: CountingState): CountingState {
  return state.status === "playing" && !state.placedIds.length ? state
    : Object.freeze({ ...state, placedIds: Object.freeze([]), status: "playing" });
}
