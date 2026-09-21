// @vitest-environment node
import { describe, expect, it } from "vitest";
import { chooseNumberMatch, createNumberMatch, getNumberMatchPresentation, resetNumberMatch,
  type NumberMatchDefinition, type NumberMatchDirection } from "./numberMatch";

const definition = (): NumberMatchDefinition => ({ id: "round-1", direction: "number-to-objects", numberMax: 5,
  target: 3, choices: [{ id: "two", value: 2 }, { id: "three", value: 3 }, { id: "four", value: 4 }] });

describe.each([5, 10, 20] as const)("inclusive range 1–%i", (numberMax) => {
  it.each(["number-to-objects", "objects-to-number"] as NumberMatchDirection[])("matches every quantity in %s", (direction) => {
    for (let target = 1; target <= numberMax; target++) {
      // Rotate choices to exercise every correct-answer position, including endpoints.
      const values = Array.from({ length: numberMax }, (_, i) => (i + target) % numberMax + 1);
      const state = createNumberMatch({ id: "round", direction, numberMax, target,
        choices: values.map((value) => ({ id: `choice-${value}`, value })) });
      const view = getNumberMatchPresentation(state);
      const count = (face: typeof view.prompt) => face.kind === "number" ? face.value : face.objects.length;
      expect(count(view.prompt)).toBe(target);
      expect(view.prompt.kind).toBe(direction === "number-to-objects" ? "number" : "objects");
      expect(view.choices.map((choice) => count(choice.face))).toEqual(values);
      for (const choice of view.choices) {
        expect(choice.face.kind).not.toBe(view.prompt.kind);
        if (choice.face.kind === "objects") expect(new Set(choice.face.objects.map((object) => object.id)).size).toBe(count(choice.face));
        expect(chooseNumberMatch(state, choice.id).status).toBe(count(choice.face) === target ? "complete" : "retry");
      }
      expect(state.status).toBe("ready");
    }
  });
});

it("allows repeated gentle retries, completion, duplicate events and explicit restart", () => {
  const initial = createNumberMatch(definition());
  const retry = chooseNumberMatch(initial, "two");
  expect(retry.status).toBe("retry");
  expect(retry.definition).toBe(initial.definition);
  expect(chooseNumberMatch(retry, "two")).toBe(retry);
  expect(chooseNumberMatch(retry, "missing")).toBe(retry);
  const second = chooseNumberMatch(retry, "four");
  const done = chooseNumberMatch(second, "three");
  expect(done.status).toBe("complete");
  expect(done.selectedChoiceId).toBe("three");
  expect(chooseNumberMatch(done, "three")).toBe(done);
  expect(chooseNumberMatch(done, "two")).toBe(done);
  expect(resetNumberMatch(done)).toEqual(initial);
  expect(resetNumberMatch(retry)).toEqual(initial);
  expect(resetNumberMatch(initial)).toBe(initial);
  expect(initial.selectedChoiceId).toBeNull();
});

it("copies/freezes content and presentation without storage, time or randomness", () => {
  const input = { ...definition(), choices: [{ id: "two", value: 2 }, { id: "three", value: 3 }] };
  const state = createNumberMatch(input);
  input.target = 2; input.choices[0].value = 1; input.choices.reverse();
  expect(state.definition.target).toBe(3);
  expect(state.definition.choices.map((choice) => choice.value)).toEqual([2, 3]);
  const view = getNumberMatchPresentation(state);
  expect(Object.isFrozen(state)).toBe(true);
  expect(Object.isFrozen(state.definition.choices[0])).toBe(true);
  expect(Object.isFrozen(view.choices)).toBe(true);
  const group = view.choices[0].face;
  if (group.kind !== "objects") throw new Error("Expected objects");
  expect(Object.isFrozen(group.objects)).toBe(true);
  expect(Object.isFrozen(group.objects[0])).toBe(true);
  expect(getNumberMatchPresentation(state)).toEqual(view);
  expect(createNumberMatch(JSON.parse(JSON.stringify(state.definition)))).toEqual(state);
});

it("rejects malformed definitions, ambiguous answers and sparse input", () => {
  const base = definition();
  const invalid: unknown[] = [null, {}, { ...base, id: " " }, { ...base, direction: "quest" },
    ...[0, 6, 15, "5", NaN, Infinity].map((numberMax) => ({ ...base, numberMax })),
    ...[0, -1, 6, 2.5, "3", NaN, Infinity].map((target) => ({ ...base, target })),
    ...[null, [], [base.choices[0]], Array(3), Array(6).fill(base.choices[0]),
      [{ id: "a", value: 1 }, { id: "b", value: 2 }],
      [{ id: "a", value: 3 }, { id: "b", value: 3 }],
      [{ id: "a", value: 3 }, { id: "a", value: 2 }],
      [{ id: " a", value: 3 }, { id: "b", value: 2 }],
      [{ id: "a", value: 3 }, { id: "b", value: 0 }],
      [{ id: "a", value: 3 }, { id: "b", value: 6 }],
      [{ id: "a", value: 3 }, { id: "b", value: 2.5 }],
      [{ id: "a", value: 3 }, null],
    ].map((choices) => ({ ...base, choices })),
  ];
  for (const value of invalid) expect(() => createNumberMatch(value as NumberMatchDefinition)).toThrow();
});
