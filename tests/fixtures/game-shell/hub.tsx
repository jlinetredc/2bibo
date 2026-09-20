import { createRoot } from "react-dom/client";
import { GameGrid } from "../../../src/components/hub/GameGrid";
import { createGameRegistry } from "../../../src/game-core/registry";
import "../../../src/app/globals.css";

// Synthetic catalogue only; never registered in the application.
const registry = createGameRegistry(Array.from({ length: 9 }, (_, index) => ({
  id: `fixture-${index}`, name: index === 1 ? "Tên trò chơi dài để kiểm tra xuống dòng" : `Thẻ thử ${index + 1}`,
  icon: ["🌻", "🐳", "🚀"][index % 3], category: "puzzle", minAge: 3,
  load: async () => { throw new Error("Hub must not load game modules"); },
})));
createRoot(document.getElementById("root")!).render(<main style={{ maxWidth: 1120, margin: "auto", padding: 24 }}>
  <h1>Danh sách thử nghiệm</h1><GameGrid games={registry.list()} />
</main>);

