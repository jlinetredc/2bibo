import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { ParentGate } from "../../../src/parent/ParentGate";
import "../../../src/app/globals.css";

function Fixture() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  function close() { setOpen(false); trigger.current?.focus(); }
  return <main style={{ padding: 16 }}>
    <button ref={trigger} style={{ minHeight: 52 }} onClick={() => setOpen(true)}>Mở cổng phụ huynh</button>
    <p>Lần xác nhận: {count}</p>
    {open && <ParentGate onVerified={() => { setCount((n) => n + 1); close(); }} onCancel={close} />}
    <div style={{ height: 1000 }}>Vùng cuộn ngoài nút giữ</div>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
