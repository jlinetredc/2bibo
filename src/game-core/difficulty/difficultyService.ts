import type { ProfileInput } from "../profiles/profiles";
import { jigsawDifficultyAdapter } from "../../games/jigsaw/domain/difficultyPresets";

export type AgeBand = ProfileInput["ageBand"];
export type DifficultyProfile = Readonly<Pick<ProfileInput, "ageBand">>;

/** Each game supplies cloneable configuration data, not UI or game loaders. */
export interface DifficultyAdapter<TConfig = unknown> {
  readonly gameId: string;
  readonly presets: Readonly<Record<AgeBand, TConfig>>;
}

/** No profile starts with the youngest band's configuration. Invalid data fails explicitly. */
export function resolveAgeBand(profile?: DifficultyProfile | null): AgeBand {
  if (profile == null) return "3-4";
  switch (profile.ageBand) {
    case "3-4": case "5-6": case "7+": return profile.ageBand;
    default: throw new Error("Unsupported profile age band.");
  }
}

/** Immutable catalogue; resolution has no storage, performance tracking or UI side effects. */
export function createDifficultyService<TConfig = unknown>(adapters: readonly DifficultyAdapter<TConfig>[]) {
  const presets = new Map<string, Record<AgeBand, TConfig>>();
  for (const adapter of adapters) {
    const { gameId } = adapter;
    if (!gameId.trim() || gameId !== gameId.trim()) throw new Error("Difficulty game ID must be non-empty and trimmed.");
    if (presets.has(gameId)) throw new Error(`Duplicate difficulty game ID: ${gameId}`);
    for (const band of ["3-4", "5-6", "7+"] as const) {
      if (!Object.hasOwn(adapter.presets, band) || adapter.presets[band] === undefined) {
        throw new Error(`Missing difficulty preset for ${gameId}: ${band}`);
      }
    }
    presets.set(gameId, structuredClone(adapter.presets));
  }

  return Object.freeze({
    getDifficulty(gameId: string, profile?: DifficultyProfile | null): TConfig {
      const configuration = presets.get(gameId);
      if (!configuration) throw new Error(`Unknown difficulty game ID: ${gameId}`);
      return structuredClone(configuration[resolveAgeBand(profile)]);
    },
  });
}

/** Register presets only when their games are implemented and tuned. */
export const difficultyService = createDifficultyService<unknown>([jigsawDifficultyAdapter]);
export const getDifficulty = difficultyService.getDifficulty;
