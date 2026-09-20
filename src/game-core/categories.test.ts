import { expect, it, vi } from "vitest";
import { gameCategories, isGameCategory } from "./categories";
import { createGameRegistry, type GameDefinition } from "./registry";

it("defines exactly the six ordered, unique categories with immutable labels", () => {
  expect(gameCategories.map(({ id, name }) => [id, name])).toEqual([
    ["puzzle", "Puzzle"], ["think", "Think"], ["build", "Build"],
    ["create", "Create"], ["explore", "Explore"], ["play", "Play"],
  ]);
  expect(Object.isFrozen(gameCategories)).toBe(true);
  for (const category of gameCategories) {
    expect(category.label.trim().length).toBeGreaterThan(0);
    expect(Object.isFrozen(category)).toBe(true);
  }
});

it("accepts each category through the registry without loading a game", () => {
  const load = vi.fn(async () => ({}));
  const definitions = gameCategories.map(({ id }) => ({ id: `fixture-${id}`, name: id, category: id, minAge: 3, load }));
  const registry = createGameRegistry(definitions);
  expect(registry.list().map(({ category }) => category)).toEqual(gameCategories.map(({ id }) => id));
  for (const category of gameCategories) expect(isGameCategory(category.id)).toBe(true);
  expect(load).not.toHaveBeenCalled();
});

it.each(["", "Puzzle", "thinking", "construction", "discovery", "toy-play", " puzzle", "puzzle ", "unknown", null, undefined, 1, {}])(
  "rejects invalid category %j at the registry boundary", (category) => {
    expect(isGameCategory(category)).toBe(false);
    const load = vi.fn(async () => ({}));
    const definition = { id: "fixture", name: "Fixture", category, minAge: 3, load } as unknown as GameDefinition;
    expect(() => createGameRegistry([definition])).toThrow("Unknown game category");
    expect(load).not.toHaveBeenCalled();
  },
);
