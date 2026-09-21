// @vitest-environment node
import { expect, it } from "vitest";
import { getDifficulty, type DifficultyProfile } from "../../../game-core/difficulty/difficultyService";
import { createNumberMatchForProfile, getNumberMatchDifficulty } from "./difficulty";
import { numberMatchDifficultyAdapter } from "./difficultyPresets";
import { chooseNumberMatch, getNumberMatchPresentation, resetNumberMatch, type NumberMatchDefinition } from "./numberMatch";

it.each([["3-4", 5, 2], ["5-6", 10, 3], ["7+", 20, 4]] as const)(
  "resolves %s centrally and completes both directions for every allowed target", (ageBand, numberMax, optionCount) => {
    const profile = { ageBand };
    expect(getNumberMatchDifficulty(profile)).toEqual({ numberMax, optionCount });
    expect(getDifficulty("number-match", profile)).toEqual(getNumberMatchDifficulty(profile));
    for (const direction of ["number-to-objects", "objects-to-number"] as const) {
      for (let target = 1; target <= numberMax; target++) {
        const values = Array.from({ length: optionCount }, (_, index) => (target - 1 + index) % numberMax + 1).reverse();
        const state = createNumberMatchForProfile({ id: "round", direction, target,
          choices: values.map((value) => ({ id: `choice-${value}`, value })) }, profile);
        expect(state.definition.numberMax).toBe(numberMax);
        expect(getNumberMatchPresentation(state).choices).toHaveLength(optionCount);
        const retry = chooseNumberMatch(state, `choice-${values[0]}`);
        expect(retry.status).toBe("retry");
        const done = chooseNumberMatch(retry, `choice-${target}`);
        expect(done.status).toBe("complete");
        expect(resetNumberMatch(done)).toEqual(state);
      }
    }
  },
);

const content: Omit<NumberMatchDefinition, "numberMax"> = {
  id: "small", direction: "objects-to-number", target: 5,
  choices: [{ id: "a", value: 4 }, { id: "b", value: 5 }],
};

it("uses the youngest preset for guests and isolates settings from caller mutation", () => {
  expect(getNumberMatchDifficulty()).toEqual({ numberMax: 5, optionCount: 2 });
  expect(getNumberMatchDifficulty(null)).toEqual(getNumberMatchDifficulty());
  const result = getNumberMatchDifficulty();
  Object.assign(result, { numberMax: 20, optionCount: 4 });
  expect(getNumberMatchDifficulty()).toEqual({ numberMax: 5, optionCount: 2 });
  expect(Object.isFrozen(numberMatchDifficultyAdapter.presets["3-4"])).toBe(true);
  expect(createNumberMatchForProfile(content)).toEqual(createNumberMatchForProfile(content, null));
});

it("rejects incorrect choice counts rather than truncating or adding answers", () => {
  for (const choices of [[], content.choices.slice(0, 1), [...content.choices, { id: "c", value: 3 }], Array(2)]) {
    expect(() => createNumberMatchForProfile({ ...content, choices })).toThrow();
  }
  expect(() => createNumberMatchForProfile(content, { ageBand: "5-6" })).toThrow();
  expect(() => createNumberMatchForProfile(content, { ageBand: "7+" })).toThrow();
});

it("enforces the preset range and delegates answer validation to the existing core", () => {
  const forged = { ...content, numberMax: 20, target: 20, choices: [{ id: "a", value: 1 }, { id: "b", value: 20 }] };
  expect(() => createNumberMatchForProfile(forged)).toThrow();
  expect(() => createNumberMatchForProfile({ ...content, target: 3 })).toThrow();
  expect(() => createNumberMatchForProfile({ ...content, choices: [{ id: "a", value: 5 }, { id: "b", value: 5 }] })).toThrow();
  expect(() => getNumberMatchDifficulty({ ageBand: "invalid" } as unknown as DifficultyProfile)).toThrow();
  expect(() => createNumberMatchForProfile(content, { ageBand: "invalid" } as unknown as DifficultyProfile)).toThrow();
});

it("does not alter a running round when a profile changes or affect other games", () => {
  const profile: { ageBand: "3-4" | "7+" } = { ageBand: "3-4" };
  const state = chooseNumberMatch(createNumberMatchForProfile(content, profile), "a");
  const snapshot = JSON.stringify(state);
  profile.ageBand = "7+";
  expect(getNumberMatchDifficulty(profile).numberMax).toBe(20);
  expect(JSON.stringify(state)).toBe(snapshot);
  expect(state.definition.numberMax).toBe(5);
  expect(chooseNumberMatch(state, "b").status).toBe("complete");
  expect(getDifficulty("jigsaw", { ageBand: "3-4" })).toEqual({ level: "starter", counts: [4] });
});
