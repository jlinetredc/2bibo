import type { GameDefinition } from "../../game-core/registry";
import styles from "./GameHub.module.css";

type GameCard = Pick<GameDefinition, "id" | "name" | "icon">;

/** Metadata only: rendering the catalogue never loads a game module. */
export function GameGrid({ games }: { games: readonly GameCard[] }) {
  if (games.length === 0) return <div className={styles.empty}>
    <span className={styles.illustration} aria-hidden="true">🌱</span>
    <h2>Góc chơi đang được chuẩn bị</h2>
    <p>Hiện chưa có trò chơi để chọn.</p>
  </div>;

  return <ul className={styles.grid} aria-label="Trò chơi">
    {games.map((game) => <li key={game.id}>
      <a className={styles.card} href={`/play/${encodeURIComponent(game.id)}`}>
        <span className={styles.icon} aria-hidden="true">{game.icon || "🎲"}</span>
        <span className={styles.name}>{game.name}</span>
      </a>
    </li>)}
  </ul>;
}
