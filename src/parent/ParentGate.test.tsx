import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ParentGate } from "./ParentGate";

afterEach(() => vi.useRealTimers());
function setup() {
  vi.useFakeTimers();
  const onVerified = vi.fn(); const onCancel = vi.fn();
  const result = render(<ParentGate onVerified={onVerified} onCancel={onCancel} />);
  const button = screen.getByRole("button", { name: "Giữ để tiếp tục" });
  button.setPointerCapture = vi.fn(); button.hasPointerCapture = () => false;
  button.getBoundingClientRect = () => ({ left: 0, right: 100, top: 0, bottom: 100 } as DOMRect);
  function pointer(type: string, properties = {}) {
    const event = new Event(type, { bubbles: true });
    Object.assign(event, { pointerId: 1, isPrimary: true, button: 0, clientX: 50, clientY: 50 }, properties);
    fireEvent(button, event);
  }
  return { ...result, button, pointer, onVerified, onCancel };
}
it("requires a continuous three-second hold and verifies only once", () => {
  const { pointer, onVerified } = setup();
  pointer("pointerdown");
  act(() => vi.advanceTimersByTime(2999)); expect(onVerified).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1)); expect(onVerified).toHaveBeenCalledTimes(1);
  pointer("pointerdown"); act(() => vi.advanceTimersByTime(4000));
  expect(onVerified).toHaveBeenCalledTimes(1);
});
it.each(["pointerup", "pointercancel", "lostpointercapture"])("resets on %s and allows a fresh attempt", (type) => {
  const { pointer, onVerified } = setup();
  pointer("pointerdown"); act(() => vi.advanceTimersByTime(2000)); pointer(type);
  act(() => vi.advanceTimersByTime(4000)); expect(onVerified).not.toHaveBeenCalled();
  pointer("pointerdown"); act(() => vi.advanceTimersByTime(3000)); expect(onVerified).toHaveBeenCalledTimes(1);
});
it("ignores secondary pointers and cancels after leaving the hold region", () => {
  const { pointer, onVerified } = setup();
  pointer("pointerdown", { isPrimary: false }); act(() => vi.advanceTimersByTime(3000));
  expect(onVerified).not.toHaveBeenCalled();
  pointer("pointerdown"); pointer("pointerup", { pointerId: 2 });
  pointer("pointermove", { clientX: 150 }); act(() => vi.advanceTimersByTime(3000));
  expect(onVerified).not.toHaveBeenCalled();
});
it.each(["blur", "pagehide"])("cancels on window %s", (type) => {
  const { pointer, onVerified } = setup(); pointer("pointerdown");
  fireEvent(window, new Event(type)); act(() => vi.advanceTimersByTime(3000));
  expect(onVerified).not.toHaveBeenCalled();
});
it("clears pending work on unmount", () => {
  const { pointer, unmount, onVerified } = setup(); pointer("pointerdown"); unmount();
  act(() => vi.advanceTimersByTime(3000)); expect(onVerified).not.toHaveBeenCalled();
});
it("offers an untimed keyboard alternative without personal information", () => {
  const { button, onVerified } = setup(); fireEvent.click(button, { detail: 0 });
  const input = screen.getByRole("textbox"); expect(input).toHaveFocus();
  fireEvent.change(input, { target: { value: "abc" } });
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  expect(onVerified).not.toHaveBeenCalled();
  fireEvent.change(input, { target: { value: " phụ huynh " } });
  fireEvent.click(screen.getByRole("button", { name: "Tiếp tục" }));
  expect(onVerified).toHaveBeenCalledTimes(1);
});
it("Escape cancels pending verification and invokes only cancel", () => {
  const { pointer, button, onVerified, onCancel } = setup(); pointer("pointerdown");
  fireEvent.keyDown(button, { key: "Escape" }); act(() => vi.advanceTimersByTime(3000));
  expect(onVerified).not.toHaveBeenCalled(); expect(onCancel).toHaveBeenCalledTimes(1);
});

