import { describe, expect, it, vi } from "vitest";
import { createGameRegistry, gameRegistry, type GameDefinition } from "./registry";

function definition(id: string, load = vi.fn(async () => ({ default: id }))): GameDefinition {
  return { id, name: id, category: "puzzle", minAge: 3, load };
}

describe("game registry", () => {
  it("starts with no unimplemented game entries", () => {
    expect(gameRegistry.list().map((game) => game.id)).toEqual(["block-puzzle", "jigsaw"]);
  });

  it("lists games in registration order and looks them up without loading", () => {
    const first = definition("first");
    const second = definition("second");
    const registry = createGameRegistry([first, second]);

    expect(registry.list()).toEqual([first, second]);
    expect(registry.get("second")).toEqual(second);
    expect(registry.get("missing")).toBeUndefined();
    expect(first.load).not.toHaveBeenCalled();
    expect(second.load).not.toHaveBeenCalled();
  });

  it("rejects duplicate IDs before invoking any loader", () => {
    const first = definition("duplicate");
    const second = { ...definition("duplicate"), name: "Another name" };
    expect(() => createGameRegistry([first, second])).toThrow("Duplicate game ID: duplicate");
    expect(first.load).not.toHaveBeenCalled();
    expect(second.load).not.toHaveBeenCalled();
    expect(() => createGameRegistry([first, first])).toThrow("Duplicate game ID: duplicate");
  });

  it.each(["", " ", " leading", "trailing "])("rejects invalid ID %j", (id) => {
    expect(() => createGameRegistry([definition(id)])).toThrow("Game ID must be non-empty");
  });

  it("invokes only the requested loader and returns its module", async () => {
    const first = definition("first");
    const second = definition("second");
    const registry = createGameRegistry([first, second]);

    await expect(registry.load("second")).resolves.toEqual({ default: "second" });
    expect(first.load).not.toHaveBeenCalled();
    expect(second.load).toHaveBeenCalledTimes(1);
  });

  it("rejects unknown IDs without invoking loaders", async () => {
    const game = definition("known");
    await expect(createGameRegistry([game]).load("missing")).rejects.toThrow("Unknown game ID: missing");
    expect(game.load).not.toHaveBeenCalled();
  });

  it("propagates load errors and allows a later retry", async () => {
    const failure = new Error("Network unavailable");
    const load = vi.fn<() => Promise<unknown>>()
      .mockRejectedValueOnce(failure)
      .mockResolvedValueOnce({ default: "loaded" });
    const registry = createGameRegistry([{ ...definition("retry"), load }]);

    await expect(registry.load("retry")).rejects.toBe(failure);
    await expect(registry.load("retry")).resolves.toEqual({ default: "loaded" });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("isolates its catalogue from mutations to the source array and objects", () => {
    const source = [{ ...definition("original") }];
    const registry = createGameRegistry(source);
    source[0].id = "changed";
    source.push(definition("extra"));

    expect(registry.list().map((game) => game.id)).toEqual(["original"]);
    expect(registry.get("original")?.id).toBe("original");
    expect(registry.get("changed")).toBeUndefined();
    expect(Object.isFrozen(registry.list())).toBe(true);
    expect(Object.isFrozen(registry.get("original"))).toBe(true);
  });
});

