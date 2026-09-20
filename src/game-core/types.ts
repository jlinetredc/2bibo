/** Hosting context for a reusable game, not its internal gameplay variant. */
export type GameMode = "standalone" | "quest";

/** Shared input/output contract; each game supplies its own config and result. */
export interface BaseGameProps<TConfig = unknown, TResult = unknown> {
  mode: GameMode;
  config?: TConfig;
  /** Optional because free-play toys may have no completion condition. */
  onComplete?: (result: TResult) => void;
}
