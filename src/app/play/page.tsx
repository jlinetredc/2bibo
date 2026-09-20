import Link from "next/link";
import { GameGrid } from "@/components/hub/GameGrid";
import styles from "@/components/hub/GameHub.module.css";
import { gameRegistry } from "@/game-core/registry";

export default function PlayPage() {
  const games = gameRegistry.list();
  return <main className={styles.page}>
    <nav className={styles.nav} aria-label="Điều hướng góc chơi">
      <Link href="/">← Bibo Play</Link>
      <Link href="/profiles">Chọn hồ sơ</Link>
    </nav>
    <header className={styles.header}>
      <h1>Góc chơi của con</h1>
      {games.length > 0 && <p>Chạm vào hình để chơi nhé!</p>}
    </header>
    <GameGrid games={games} />
  </main>;
}
