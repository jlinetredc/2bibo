import { getDifficulty, type DifficultyProfile } from "../../../game-core/difficulty/difficultyService";
import type { NumberMatchDifficultyConfig } from "./difficultyPresets";
import { createNumberMatch, type NumberMatchDefinition } from "./numberMatch";

/** Resolve through the central catalogue once at the start of a new round. */
export function getNumberMatchDifficulty(profile?: DifficultyProfile | null): NumberMatchDifficultyConfig {
  return getDifficulty("number-match", profile) as NumberMatchDifficultyConfig;
}

/** Host-authored content must fit the preset; never trim away the correct answer. */
export function createNumberMatchForProfile(
  definition: Omit<NumberMatchDefinition, "numberMax">,
  profile?: DifficultyProfile | null,
) {
  const config = getNumberMatchDifficulty(profile);
  if (!definition || !Array.isArray(definition.choices) || definition.choices.length !== config.optionCount) {
    throw new RangeError("Number Match choice count must match the profile preset.");
  }
  // Set the resolved range last so caller-supplied runtime fields cannot override it.
  return createNumberMatch({ ...definition, numberMax: config.numberMax });
}
