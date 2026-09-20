import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { attachPointerDrag } from "../../../src/game-core/input/pointerDrag";
import "../../../src/app/globals.css";

function Fixture() {
  const handle = useRef<HTMLButtonElement>(null);
  const [state, setState] = useState("Sẵn sàng");
  const [ends, setEnds] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const drag = attachPointerDrag(handle.current!, {
      onStart: () => setState("Đang kéo"),
      onMove: ({ delta }) => setPosition(delta),
      onEnd: () => { setState("Đã thả"); setEnds((n) => n + 1); },
      onCancel: () => { setState("Đã hủy"); setPosition({ x: 0, y: 0 }); },
    });
    return () => drag.destroy();
  }, []);
  return <main style={{ padding: 16 }}>
    <h1>Kiểm tra kéo</h1>
    <button ref={handle} type="button" aria-label="Tay cầm kéo"
      style={{ width: 100, height: 100, background: "#ccfbf1", border: "2px solid #0f766e", borderRadius: 16 }}>
      Kéo tại đây
    </button>
    <p role="status">{state}</p>
    <p>Lượt thả: <span data-testid="ends">{ends}</span></p>
    <p>Vị trí: <span data-testid="position">{position.x}, {position.y}</span></p>
    <button type="button" style={{ minWidth: 52, minHeight: 52, border: "2px solid" }}
      onClick={() => setPosition((p) => ({ ...p, x: p.x + 20 }))}>Dịch sang phải</button>
    <p>Cuộn ngoài tay cầm vẫn hoạt động.</p>
    <div style={{ height: 1500 }} />
  </main>;
}

createRoot(document.getElementById("root")!).render(<Fixture />);
