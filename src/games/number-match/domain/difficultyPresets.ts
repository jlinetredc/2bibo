import type { DifficultyAdapter } from "../../../game-core/difficulty/difficultyService";
import type { NumberMatchRange } from "./numberMatch";

export interface NumberMatchDifficultyConfig {
  readonly numberMax: NumberMatchRange;
  readonly optionCount: 2 | 3 | 4;
}

/** Data-only policy; broad age bands do not imply an exact age or ability score. */
export const numberMatchDifficultyAdapter: DifficultyAdapter<NumberMatchDifficultyConfig> = Object.freeze({
  gameId: "number-match",
  presets: Object.freeze({
    "3-4": Object.freeze({ numberMax: 5, optionCount: 2 }),
    "5-6": Object.freeze({ numberMax: 10, optionCount: 3 }),
    "7+": Object.freeze({ numberMax: 20, optionCount: 4 }),
  }),
});
