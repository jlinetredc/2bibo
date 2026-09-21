// @vitest-environment node
import { expect, it } from "vitest";
import { getDifficulty, type DifficultyProfile } from "@/game-core/difficulty/difficultyService";
import { gameRegistry } from "@/game-core/registry";
import { COUNTING_SCENARIOS, createCountingScenario, type CountingScenarioId } from "./scenarios";
import { checkCounting, createCountingState, moveCountingItem } from "../domain/counting";

it("provides the five distinct required scenario types/themes and a lazy hub entry", () => {
  expect(COUNTING_SCENARIOS.map((scenario) => scenario.id)).toEqual(["feed-animals", "fill-basket", "give-items", "collect-objects", "place-objects"]);
  expect(new Set(COUNTING_SCENARIOS.map((scenario) => scenario.theme)).size).toBe(5);
  expect(Object.isFrozen(COUNTING_SCENARIOS[0])).toBe(true);
  expect(gameRegistry.get("counting-adventure")?.category).toBe("think");
});
it.each([["3-4", 3, 5], ["5-6", 5, 7], ["7+", 8, 10]] as const)("creates every scenario at %s and supports correction/completion", (ageBand, target, available) => {
  expect(getDifficulty("counting-adventure", { ageBand })).toMatchObject({ target, available });
  for (const scenario of COUNTING_SCENARIOS) {
    const definition = createCountingScenario(scenario.id, { ageBand });
    expect(definition.target).toBe(target); expect(definition.items).toHaveLength(available);
    expect(definition.instruction).toBe(scenario.instruction.replace("{count}", String(target)));
    expect(definition.destinationSymbol).toBe(scenario.destinationSymbol);
    expect(new Set(definition.items.map((item) => item.label)).size).toBe(available);
    let state = createCountingState(definition);
    for (const item of definition.items.slice(0, target + 1)) state = moveCountingItem(state, item.id, true);
    expect(checkCounting(state).status).toBe("retry");
    state = moveCountingItem(state, definition.items[target].id, false);
    expect(checkCounting(state).status).toBe("complete");
  }
});

it.each([["3-4", 5], ["5-6", 10], ["7+", 20]] as const)("varies every quantity within the %s range without consecutive repeats", (ageBand, max) => {
  for (const scenario of COUNTING_SCENARIOS) {
    const targets = [];
    for (let round = 0; round <= max; round++) {
      const definition = createCountingScenario(scenario.id, { ageBand }, round);
      expect(definition.target).toBeGreaterThanOrEqual(1);
      expect(definition.target).toBeLessThanOrEqual(max);
      expect(definition.items.length).toBeGreaterThanOrEqual(definition.target);
      expect(definition.items.length).toBeLessThanOrEqual(20);
      if (round) expect(definition.target).not.toBe(targets[round - 1]);
      targets.push(definition.target);
    }
    expect(new Set(targets).size).toBe(max);
  }
  expect(() => createCountingScenario("feed-animals", { ageBand }, -1)).toThrow();
});
it("uses conservative guest defaults, isolated definitions and rejects unknown input", () => {
  const guest = createCountingScenario("feed-animals");
  expect(guest).toEqual(createCountingScenario("feed-animals", null));
  expect(guest.target).toBe(3); expect(Object.isFrozen(guest.items[0])).toBe(true);
  Object.assign(getDifficulty("counting-adventure") as object, { target: 20 });
  expect(createCountingScenario("feed-animals").target).toBe(3);
  expect(() => createCountingScenario("unknown" as CountingScenarioId)).toThrow();
  expect(() => createCountingScenario("feed-animals", { ageBand: "invalid" } as unknown as DifficultyProfile)).toThrow();
  expect(() => createCountingState({ ...guest, destinationSymbol: "" })).toThrow();
});
