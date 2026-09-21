import type { DifficultyAdapter } from "@/game-core/difficulty/difficultyService";
export interface CountingDifficulty { readonly target: number; readonly available: number; readonly numberMax: number }
/** Initial content defaults, shared by every scenario. Not adaptive progression. */
export const countingDifficultyAdapter: DifficultyAdapter<CountingDifficulty> = Object.freeze({
  gameId: "counting-adventure",
  presets: Object.freeze({
    "3-4": Object.freeze({ target: 3, available: 5, numberMax: 5 }),
    "5-6": Object.freeze({ target: 5, available: 7, numberMax: 10 }),
    "7+": Object.freeze({ target: 8, available: 10, numberMax: 20 }),
  }),
});
