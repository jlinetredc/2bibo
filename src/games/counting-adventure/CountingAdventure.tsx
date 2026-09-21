"use client";
import { useState } from "react";
import type { BaseGameProps } from "@/game-core/types";
import type { DifficultyProfile } from "@/game-core/difficulty/difficultyService";
import { CountingGame, type CountingResult } from "./CountingGame";
import { COUNTING_SCENARIOS, createCountingScenario, type CountingScenarioId } from "./data/scenarios";
import styles from "./CountingAdventure.module.css";

export interface CountingAdventureConfig { readonly scenarioId: CountingScenarioId; readonly profile?: DifficultyProfile | null }
/** Configuration/profile are initial inputs. Hosts remount to apply profile changes. */
export default function CountingAdventure({ mode, config, onComplete, restartKey = 0 }: BaseGameProps<CountingAdventureConfig, CountingResult> & { restartKey?: number }) {
  const [scenarioId, setScenarioId] = useState(config?.scenarioId ?? "feed-animals");
  const [round, setRound] = useState(0);
  const [profile] = useState(() => config?.profile == null ? null : { ageBand: config.profile.ageBand });
  const definition = createCountingScenario(scenarioId, profile, round + restartKey);
  return <div className={styles.adventure}>
    {mode === "standalone" && <div className={styles.choices} role="group" aria-label="Chọn hoạt động">
      {COUNTING_SCENARIOS.map((scenario) => <button key={scenario.id} type="button" aria-pressed={scenario.id === scenarioId}
        onClick={() => { if (scenario.id !== scenarioId) { setScenarioId(scenario.id); setRound((value) => value + 1); } }}><span aria-hidden="true">{scenario.destinationSymbol}</span>{scenario.name}</button>)}
    </div>}
    <CountingGame key={`${restartKey}-${round}`} mode={mode} config={definition} onComplete={onComplete}
      onNewRound={mode === "standalone" ? () => setRound((value) => value + 1) : undefined} />
  </div>;
}
