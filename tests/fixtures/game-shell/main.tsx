import { useState } from "react";
import { createRoot } from "react-dom/client";
import { GameShell } from "../../../src/game-core/GameShell";
import "../../../src/app/globals.css";

function Fixture() {
  const [muted, setMuted] = useState(false);
  const [count, setCount] = useState(0);
  const [back, setBack] = useState(false);
  return <GameShell title="Khám phá những điều thú vị cùng Bibo" muted={muted} onMutedChange={setMuted}
    onBack={() => setBack(true)} onRestart={() => setCount(0)}>
    <button type="button" onClick={() => setCount(count + 1)} style={{ minWidth: 52, minHeight: 52 }}>Đếm: {count}</button>
    {back && <p role="status">Đã quay lại</p>}
    <div style={{ minHeight: 1200 }}>Nội dung dài để kiểm tra cuộn trang.</div>
  </GameShell>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
