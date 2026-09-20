/** Stable identifiers, display order and labels shared by registry consumers. */
export const gameCategories = Object.freeze([
  Object.freeze({ id: "puzzle", name: "Puzzle", label: "Giải đố" }),
  Object.freeze({ id: "think", name: "Think", label: "Tư duy" }),
  Object.freeze({ id: "build", name: "Build", label: "Xây dựng" }),
  Object.freeze({ id: "create", name: "Create", label: "Sáng tạo" }),
  Object.freeze({ id: "explore", name: "Explore", label: "Khám phá" }),
  Object.freeze({ id: "play", name: "Play", label: "Chơi tự do" }),
] as const);

export type GameCategory = typeof gameCategories[number]["id"];

/** Validate external/untyped values without silently accepting aliases or typos. */
export function isGameCategory(value: unknown): value is GameCategory {
  return gameCategories.some((category) => category.id === value);
}
