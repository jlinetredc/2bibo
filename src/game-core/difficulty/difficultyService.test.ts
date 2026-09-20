import { describe, expect, it } from "vitest";
import { createDifficultyService, getDifficulty, resolveAgeBand, type DifficultyAdapter, type DifficultyProfile } from "./difficultyService";

// Synthetic configurations exercise the contract without implementing future games.
function adapter(gameId = "fixture"): DifficultyAdapter<{ choices: number; hints: { enabled: boolean } }> {
  return { gameId, presets: {
    "3-4": { choices: 2, hints: { enabled: true } },
    "5-6": { choices: 3, hints: { enabled: true } },
    "7+": { choices: 4, hints: { enabled: false } },
  } };
}

describe("shared difficulty service", () => {
  it.each([ ["3-4", 2], ["5-6", 3], ["7+", 4] ] as const)("resolves %s consistently", (ageBand, choices) => {
    const service = createDifficultyService([adapter()]);
    const profile = Object.freeze({ ageBand });
    expect(service.getDifficulty("fixture", profile).choices).toBe(choices);
    expect(service.getDifficulty("fixture", profile)).toEqual(service.getDifficulty("fixture", profile));
  });
  it("uses the youngest preset without a selected profile", () => {
    const service = createDifficultyService([adapter()]);
    expect(service.getDifficulty("fixture")).toEqual(service.getDifficulty("fixture", null));
    expect(service.getDifficulty("fixture").choices).toBe(2);
  });
  it("routes by game ID and supports configurations unrelated to numeric levels", () => {
    const service = createDifficultyService([
      { gameId: "first", presets: { "3-4": "guided", "5-6": "guided", "7+": "free" } },
      { gameId: "second", presets: { "3-4": "free", "5-6": "free", "7+": "free" } },
    ]);
    expect(service.getDifficulty("first")).toBe("guided");
    expect(service.getDifficulty("second")).toBe("free");
  });
  it("isolates nested presets from registration and returned-value mutations", () => {
    const definition = adapter();
    const registrations = [definition];
    const service = createDifficultyService(registrations);
    definition.presets["3-4"].hints.enabled = false;
    registrations.length = 0;
    const result = service.getDifficulty("fixture");
    result.hints.enabled = false;
    expect(service.getDifficulty("fixture").hints.enabled).toBe(true);
  });
  it("rejects missing games rather than guessing a game's parameters", () => {
    expect(() => createDifficultyService([adapter()]).getDifficulty("missing")).toThrow("Unknown difficulty game ID");
    expect(() => getDifficulty("fixture")).toThrow("Unknown difficulty game ID");
  });
  it("rejects duplicate and malformed adapter IDs", () => {
    expect(() => createDifficultyService([adapter(), adapter()])).toThrow("Duplicate");
    for (const id of ["", " ", " fixture"]) expect(() => createDifficultyService([adapter(id)])).toThrow("trimmed");
  });
  it("rejects incomplete presets and invalid profile bands", () => {
    const incomplete = { gameId: "fixture", presets: { "3-4": 2 } } as DifficultyAdapter<number>;
    expect(() => createDifficultyService([incomplete])).toThrow("Missing difficulty preset");
    expect(() => resolveAgeBand({ ageBand: "unknown" } as unknown as DifficultyProfile)).toThrow("Unsupported");
  });
  it("rejects non-data presets at registration", () => {
    const definition = { gameId: "fixture", presets: { "3-4": () => 1, "5-6": () => 2, "7+": () => 3 } };
    expect(() => createDifficultyService([definition])).toThrow();
  });
});
