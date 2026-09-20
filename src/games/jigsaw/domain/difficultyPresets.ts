import type { DifficultyAdapter } from "../../../game-core/difficulty/difficultyService";

export type JigsawDifficulty = "starter" | "easy" | "standard" | "advanced";
export type JigsawPieceCount = 4 | 6 | 9 | 12 | 16 | 24;
export interface JigsawDifficultyConfig {
  readonly level: JigsawDifficulty;
  readonly counts: readonly JigsawPieceCount[];
}

export const JIGSAW_DIFFICULTIES: Readonly<Record<JigsawDifficulty, JigsawDifficultyConfig>> = Object.freeze({
  starter: Object.freeze({ level: "starter", counts: Object.freeze([4] as const) }),
  easy: Object.freeze({ level: "easy", counts: Object.freeze([6, 9] as const) }),
  standard: Object.freeze({ level: "standard", counts: Object.freeze([9, 12, 16] as const) }),
  advanced: Object.freeze({ level: "advanced", counts: Object.freeze([16, 24] as const) }),
});

/** Existing broad age bands choose conservative defaults, never infer exact ages. */
export const jigsawDifficultyAdapter: DifficultyAdapter<JigsawDifficultyConfig> = Object.freeze({
  gameId: "jigsaw",
  presets: Object.freeze({
    "3-4": JIGSAW_DIFFICULTIES.starter,
    "5-6": JIGSAW_DIFFICULTIES.easy,
    "7+": JIGSAW_DIFFICULTIES.standard,
  }),
});
