import { useState } from "react";
import { createRoot } from "react-dom/client";
import { CountingGame } from "../../../src/games/counting-adventure/CountingGame";
import "../../../src/game-core/theme/tokens.css";
const config = { id: "fixture", target: 3, instruction: "Đặt 3 hình vào ô.", destinationLabel: "Ô đếm",
  items: Array.from({ length: new URLSearchParams(location.search).has("large") ? 20 : 5 }, (_, i) => ({ id: `item-${i}`, label: `Hình ${i + 1}`, symbol: "⭐" })) };
function Fixture() {
  const [completions, setCompletions] = useState(0);
  return <main><style>{`body{margin:0;padding:16px;background:var(--bibo-page);font-family:var(--bibo-font)}*{box-sizing:border-box}output{display:block;text-align:center;margin:12px}`}</style>
    <CountingGame mode="standalone" config={config} onComplete={() => setCompletions((count) => count + 1)} />
    <output aria-label="Completions">{completions}</output>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
