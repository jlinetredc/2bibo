export type NumberMatchRange = 5 | 10 | 20;
export type NumberMatchDirection = "number-to-objects" | "objects-to-number";

export interface NumberMatchDefinition {
  readonly id: string;
  readonly direction: NumberMatchDirection;
  /** Inclusive range 1..numberMax; selected by the host, never inferred from age. */
  readonly numberMax: NumberMatchRange;
  readonly target: number;
  /** Display order is supplied by content/the host. Exactly one value must match. */
  readonly choices: readonly { readonly id: string; readonly value: number }[];
}

export type NumberMatchFace =
  | { readonly kind: "number"; readonly value: number }
  | { readonly kind: "objects"; readonly objects: readonly { readonly id: string }[] };

export interface NumberMatchState {
  readonly definition: NumberMatchDefinition;
  readonly selectedChoiceId: string | null;
  readonly status: "ready" | "retry" | "complete";
}

const validId = (id: unknown): id is string => typeof id === "string" && id.length > 0 && id.trim() === id;

/** Validate at the boundary; copy/freeze content so callers cannot change answers. */
export function createNumberMatch(definition: NumberMatchDefinition): NumberMatchState {
  if (!definition || !validId(definition.id)
    || !["number-to-objects", "objects-to-number"].includes(definition.direction)
    || ![5, 10, 20].includes(definition.numberMax)) {
    throw new TypeError("Invalid Number Match identity, direction or range.");
  }
  const inRange = (value: number) => Number.isInteger(value) && value >= 1 && value <= definition.numberMax;
  if (!inRange(definition.target) || !Array.isArray(definition.choices)
    || definition.choices.length < 2 || definition.choices.length > definition.numberMax) {
    throw new RangeError("Number Match needs an in-range target and at least two bounded choices.");
  }
  const ids = new Set<string>(), values = new Set<number>();
  const choices = Array.from(definition.choices, (choice) => {
    if (!choice || !validId(choice.id) || !inRange(choice.value) || ids.has(choice.id) || values.has(choice.value)) {
      throw new TypeError("Choices need distinct IDs and distinct in-range quantities.");
    }
    ids.add(choice.id); values.add(choice.value);
    return Object.freeze({ id: choice.id, value: choice.value });
  });
  if (!values.has(definition.target)) throw new RangeError("Exactly one choice must match the target.");
  return Object.freeze({
    definition: Object.freeze({ id: definition.id, direction: definition.direction,
      numberMax: definition.numberMax, target: definition.target, choices: Object.freeze(choices) }),
    selectedChoiceId: null, status: "ready",
  });
}

function face(kind: NumberMatchFace["kind"], value: number): NumberMatchFace {
  return kind === "number" ? Object.freeze({ kind, value }) : Object.freeze({
    kind, objects: Object.freeze(Array.from({ length: value }, (_, index) => Object.freeze({ id: `object-${index + 1}` }))),
  });
}

/** Renderable data only: the host chooses artwork and a non-overlapping layout. */
export function getNumberMatchPresentation(state: NumberMatchState) {
  const { direction, target, choices } = state.definition;
  const promptKind = direction === "number-to-objects" ? "number" : "objects";
  return Object.freeze({
    prompt: face(promptKind, target),
    choices: Object.freeze(choices.map((choice) => Object.freeze({
      id: choice.id, face: face(promptKind === "number" ? "objects" : "number", choice.value),
    }))),
  });
}

/** Accept only constructor/transition states. Invalid/stale input is a no-op. */
export function chooseNumberMatch(state: NumberMatchState, choiceId: string): NumberMatchState {
  const choice = state.definition.choices.find((entry) => entry.id === choiceId);
  if (!choice || state.status === "complete" || state.selectedChoiceId === choiceId) return state;
  return Object.freeze({ ...state, selectedChoiceId: choiceId,
    status: choice.value === state.definition.target ? "complete" : "retry" });
}

/** Wrong choices never remove options; restart retains the same content/order. */
export function resetNumberMatch(state: NumberMatchState): NumberMatchState {
  return state.status === "ready" ? state : Object.freeze({ ...state, selectedChoiceId: null, status: "ready" });
}
