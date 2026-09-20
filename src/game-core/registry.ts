import { isGameCategory, type GameCategory } from "./categories";

/** Metadata can be read without importing a game's implementation. */
export interface GameDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: GameCategory;
  readonly minAge: number;
  readonly maxAge?: number;
  readonly icon?: string;
  /** Use a deferred dynamic import: () => import("@/games/<id>/..."). */
  readonly load: () => Promise<unknown>;
}

/** Builds an immutable catalogue; construction and lookup never invoke loaders. */
export function createGameRegistry(definitions: readonly GameDefinition[]) {
  const byId = new Map<string, GameDefinition>();

  for (const definition of definitions) {
    if (!definition.id.trim() || definition.id !== definition.id.trim()) {
      throw new Error("Game ID must be non-empty and have no surrounding whitespace.");
    }
    if (byId.has(definition.id)) {
      throw new Error(`Duplicate game ID: ${definition.id}`);
    }
    if (!isGameCategory(definition.category)) {
      throw new Error(`Unknown game category for ${definition.id}: ${String(definition.category)}`);
    }
    byId.set(definition.id, Object.freeze({ ...definition }));
  }

  const games: readonly GameDefinition[] = Object.freeze([...byId.values()]);

  return Object.freeze({
    list: (): readonly GameDefinition[] => games,
    get: (id: string): GameDefinition | undefined => byId.get(id),
    async load(id: string): Promise<unknown> {
      const game = byId.get(id);
      if (!game) {
        throw new Error(`Unknown game ID: ${id}`);
      }
      return game.load();
    },
  });
}

/** The single application catalogue. Add only implemented games here. */
export const gameRegistry = createGameRegistry([
  { id: "block-puzzle", name: "Bibo Blocks", category: "puzzle", minAge: 3, icon: "🧩",
    load: () => import("@/games/block-puzzle/ClassicGame") },
  { id: "jigsaw", name: "Bibo Jigsaw", category: "puzzle", minAge: 3, icon: "🖼️",
    load: () => import("@/games/jigsaw/JigsawGame") },
]);
