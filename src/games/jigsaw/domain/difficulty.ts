import { getDifficulty, type DifficultyProfile } from "../../../game-core/difficulty/difficultyService";
import { generateImagePieces, type JigsawImage } from "./imagePieces";
import { JIGSAW_DIFFICULTIES, type JigsawDifficulty, type JigsawDifficultyConfig, type JigsawPieceCount } from "./difficultyPresets";

/** Resolve once when starting a new puzzle; never change a running puzzle. */
export function getJigsawDifficulty(profile?: DifficultyProfile | null): JigsawDifficultyConfig {
  // The central catalogue registers this game's typed, data-only adapter.
  return getDifficulty("jigsaw", profile) as JigsawDifficultyConfig;
}

const grids: Readonly<Record<JigsawPieceCount, readonly [number, number]>> = {
  4: [2, 2], 6: [2, 3], 9: [3, 3], 12: [3, 4], 16: [4, 4], 24: [4, 6],
};

/** Explicit level/count are host choices, not adaptive progression or saved preferences. */
export function generateDifficultyPuzzle({ id, image, profile, level, pieceCount }: {
  readonly id: string;
  readonly image: JigsawImage;
  readonly profile?: DifficultyProfile | null;
  readonly level?: JigsawDifficulty;
  readonly pieceCount?: JigsawPieceCount;
}) {
  const ageDefault = getJigsawDifficulty(profile);
  if (level !== undefined && !Object.hasOwn(JIGSAW_DIFFICULTIES, level)) throw new RangeError("Unknown Jigsaw difficulty.");
  const config = level === undefined ? ageDefault : JIGSAW_DIFFICULTIES[level];
  const count = pieceCount ?? config.counts[0];
  if (!config.counts.includes(count)) throw new RangeError("Piece count is not supported by this Jigsaw difficulty.");
  const [short, long] = grids[count];
  // More columns for landscape/square images, more rows for portrait images.
  const portrait = image.height > image.width;
  return generateImagePieces({ id, image, rows: portrait ? long : short, columns: portrait ? short : long });
}
