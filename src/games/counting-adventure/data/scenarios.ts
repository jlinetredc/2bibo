import { getDifficulty, type DifficultyProfile } from "@/game-core/difficulty/difficultyService";
import { createCountingState } from "../domain/counting";
import type { CountingDifficulty } from "../domain/difficultyPresets";

export type CountingScenarioId = "feed-animals" | "fill-basket" | "give-items" | "collect-objects" | "place-objects";
interface CountingScenario {
  readonly id: CountingScenarioId;
  readonly name: string;
  readonly theme: "animals" | "farm" | "food" | "ocean" | "space";
  readonly instruction: string;
  readonly itemLabel: string;
  readonly itemSymbol: string;
  readonly destinationLabel: string;
  readonly destinationSymbol: string;
}
/** Content describes the context; no scenario-ID branches exist in the engine. */
export const COUNTING_SCENARIOS: readonly CountingScenario[] = Object.freeze([
  { id: "feed-animals", name: "Cho thỏ ăn", theme: "animals", instruction: "Cho thỏ {count} củ cà rốt.", itemLabel: "Cà rốt", itemSymbol: "🥕", destinationLabel: "Phần ăn của thỏ", destinationSymbol: "🐰" },
  { id: "fill-basket", name: "Táo vào giỏ", theme: "farm", instruction: "Đặt {count} quả táo vào giỏ.", itemLabel: "Táo", itemSymbol: "🍎", destinationLabel: "Giỏ táo", destinationSymbol: "🧺" },
  { id: "give-items", name: "Chia bánh", theme: "food", instruction: "Cho gấu {count} chiếc bánh.", itemLabel: "Bánh", itemSymbol: "🍪", destinationLabel: "Phần bánh của gấu", destinationSymbol: "🐻" },
  { id: "collect-objects", name: "Nhặt vỏ sò", theme: "ocean", instruction: "Nhặt {count} vỏ sò vào xô.", itemLabel: "Vỏ sò", itemSymbol: "🐚", destinationLabel: "Xô vỏ sò", destinationSymbol: "🪣" },
  { id: "place-objects", name: "Xếp sao", theme: "space", instruction: "Đặt {count} ngôi sao lên trời.", itemLabel: "Ngôi sao", itemSymbol: "⭐", destinationLabel: "Bầu trời", destinationSymbol: "🌌" },
].map((scenario) => Object.freeze(scenario as CountingScenario)));

export function createCountingScenario(id: CountingScenarioId, profile?: DifficultyProfile | null, round = 0) {
  if (!Number.isSafeInteger(round) || round < 0) throw new RangeError("Invalid counting round.");
  const scenario = COUNTING_SCENARIOS.find((entry) => entry.id === id);
  if (!scenario) throw new RangeError("Unknown counting scenario.");
  const difficulty = getDifficulty("counting-adventure", profile) as CountingDifficulty;
  const target = (difficulty.target - 1 + round % difficulty.numberMax) % difficulty.numberMax + 1;
  const available = Math.min(20, target + difficulty.available - difficulty.target);
  return createCountingState({
    id: `${scenario.id}-${target}`, target,
    instruction: scenario.instruction.replace("{count}", String(target)),
    destinationLabel: scenario.destinationLabel, destinationSymbol: scenario.destinationSymbol,
    items: Array.from({ length: available }, (_, index) => ({
      id: `${scenario.id}-item-${index + 1}`, label: `${scenario.itemLabel} ${index + 1}`, symbol: scenario.itemSymbol,
    })),
  }).definition;
}
