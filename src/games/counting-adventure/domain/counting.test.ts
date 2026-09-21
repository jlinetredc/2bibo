// @vitest-environment node
import { expect, it } from "vitest";
import { checkCounting, createCountingState, moveCountingItem, resetCounting, type CountingDefinition } from "./counting";

const definition = (target = 3, count = 5): CountingDefinition => ({ id: "test", target,
  instruction: "Đặt hình vào ô.", destinationLabel: "Ô đếm",
  items: Array.from({ length: count }, (_, i) => ({ id: `item-${i}`, label: `Hình ${i + 1}`, symbol: "●" })),
});
it("counts distinct transfers and supports under/over-count correction without losing objects", () => {
  const start = createCountingState(definition());
  let state = checkCounting(start);
  expect(state.status).toBe("retry");
  for (let i = 0; i < 4; i++) state = moveCountingItem(state, `item-${i}`, true);
  expect(state.placedIds).toHaveLength(4);
  state = checkCounting(state); expect(state.status).toBe("retry");
  expect(state.definition.items).toHaveLength(5);
  state = moveCountingItem(state, "item-1", false);
  expect(state.status).toBe("playing");
  state = checkCounting(state); expect(state.status).toBe("complete");
  expect(moveCountingItem(state, "item-4", true)).toBe(state);
  expect(moveCountingItem(state, "item-0", false)).toBe(state);
  expect(checkCounting(state)).toBe(state);
  expect(resetCounting(state)).toEqual(start);
  expect(start.placedIds).toEqual([]);
});
it("treats duplicate, unknown and invalid moves as no-ops", () => {
  const start = createCountingState(definition());
  expect(moveCountingItem(start, "missing", true)).toBe(start);
  expect(moveCountingItem(start, "item-0", false)).toBe(start);
  expect(moveCountingItem(start, "item-0", 1 as unknown as boolean)).toBe(start);
  const next = moveCountingItem(start, "item-0", true);
  expect(moveCountingItem(next, "item-0", true)).toBe(next);
  expect(resetCounting(start)).toBe(start);
});
it("can complete every supported target and replay a fresh round", () => {
  for (let target = 1; target <= 20; target++) {
    let state = createCountingState(definition(target, 20));
    for (let i = target - 1; i >= 0; i--) state = moveCountingItem(state, `item-${i}`, true);
    expect(checkCounting(state).status).toBe("complete");
    expect(resetCounting(checkCounting(state)).placedIds).toHaveLength(0);
  }
});
it("copies and freezes caller-owned content", () => {
  const input = { ...definition(), items: [{ id: "a", label: "A", symbol: "●" }], target: 1 };
  const state = createCountingState(input);
  input.items[0].label = "changed"; input.target = 9;
  expect(state.definition.items[0].label).toBe("A");
  expect(state.definition.target).toBe(1);
  expect(Object.isFrozen(state.definition.items[0])).toBe(true);
  expect(Object.isFrozen(moveCountingItem(state, "a", true).placedIds)).toBe(true);
});
it("rejects unreachable targets, sparse/duplicate objects and missing labels", () => {
  const base = definition();
  for (const value of [null, {}, ...[0, -1, 6, NaN, 1.5].map((target) => ({ ...base, target })),
    ...[[], Array(5), Array(21).fill(base.items[0]), [base.items[0], base.items[0]],
      [{ id: "a", label: "", symbol: "●" }], [{ id: " a", label: "A", symbol: "●" }],
      [{ id: "a", label: "A", symbol: "" }]].map((items) => ({ ...base, target: 1, items })),
    { ...base, instruction: "" }, { ...base, destinationLabel: "" }]) {
    expect(() => createCountingState(value as CountingDefinition)).toThrow();
  }
});
