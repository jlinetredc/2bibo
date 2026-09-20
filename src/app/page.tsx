import Link from "next/link";

export default function Home() {
  return (
    <main className="bibo-home">
      <div className="bibo-welcome">
        <span aria-hidden="true" className="text-6xl">☀️</span>
        <h1>Bibo Play</h1>
        <p>Chào con!</p>
        <nav aria-label="Bắt đầu">
          <Link href="/play" className="bibo-button bibo-button-primary"><span aria-hidden="true">▶</span> Vào góc chơi</Link>
          <Link href="/profiles" className="bibo-button"><span aria-hidden="true">🐻</span> Chọn hồ sơ</Link>
        </nav>
      </div>
    </main>
  );
}
