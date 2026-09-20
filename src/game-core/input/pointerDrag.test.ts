import { afterEach, expect, it, vi } from "vitest";
import { attachPointerDrag } from "./pointerDrag";

const cleanups: Array<() => void> = [];
afterEach(() => { cleanups.splice(0).forEach((fn) => fn()); vi.restoreAllMocks(); });

function setup() {
  const element = document.createElement("button");
  element.style.setProperty("user-select", "text", "important");
  document.body.append(element);
  const captured = new Set<number>();
  element.setPointerCapture = vi.fn((id) => { captured.add(id); });
  element.hasPointerCapture = (id) => captured.has(id);
  element.releasePointerCapture = vi.fn((id) => { captured.delete(id); });
  const callbacks = { onStart: vi.fn(), onMove: vi.fn(), onEnd: vi.fn(), onCancel: vi.fn() };
  const controller = attachPointerDrag(element, callbacks);
  cleanups.push(() => { controller.destroy(); element.remove(); });
  function send(type: string, overrides: Partial<PointerEvent> = {}) {
    // jsdom has no native pointer capture; browser tests cover actual capture.
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, { pointerId: 1, pointerType: "touch", isPrimary: true, button: 0, clientX: 10, clientY: 20 }, overrides);
    element.dispatchEvent(event);
    return event;
  }
  return { element, callbacks, controller, send, captured };
}

it("tracks viewport coordinates, deltas, and final release, without a second cancel", () => {
  const { send, callbacks, captured } = setup();
  send("pointerdown");
  expect(captured.has(1)).toBe(true);
  send("pointermove", { clientX: 25, clientY: 15 });
  expect(callbacks.onMove).toHaveBeenLastCalledWith(expect.objectContaining({ delta: { x: 15, y: -5 } }));
  send("pointerup", { clientX: 30, clientY: 40 });
  expect(callbacks.onEnd).toHaveBeenLastCalledWith(expect.objectContaining({ position: { x: 30, y: 40 }, delta: { x: 20, y: 20 } }));
  expect(captured.size).toBe(0);
  send("lostpointercapture");
  expect(callbacks.onCancel).not.toHaveBeenCalled();
});

it("ignores secondary buttons and unrelated pointers", () => {
  const { send, callbacks } = setup();
  send("pointerdown", { button: 2 });
  send("pointerdown", { isPrimary: false });
  expect(callbacks.onStart).not.toHaveBeenCalled();
  send("pointerdown");
  send("pointerdown", { pointerId: 2 });
  send("pointermove", { pointerId: 2 });
  send("pointerup", { pointerId: 2 });
  send("pointercancel", { pointerId: 2 });
  expect(callbacks.onStart).toHaveBeenCalledTimes(1);
  expect(callbacks.onMove).not.toHaveBeenCalled();
  expect(callbacks.onEnd).not.toHaveBeenCalled();
  expect(callbacks.onCancel).not.toHaveBeenCalled();
  send("pointerup");
  expect(callbacks.onEnd).toHaveBeenCalledTimes(1);
});

it.each(["pointercancel", "lostpointercapture"])("cleans up %s and accepts the next pointer", (event) => {
  const { send, callbacks, captured } = setup();
  send("pointerdown");
  send(event);
  send(event);
  send("pointerup");
  expect(callbacks.onCancel).toHaveBeenCalledTimes(1);
  expect(callbacks.onEnd).not.toHaveBeenCalled();
  expect(captured.size).toBe(0);
  send("pointerdown", { pointerId: 2 });
  send("pointerup", { pointerId: 2 });
  expect(callbacks.onEnd).toHaveBeenCalledTimes(1);
});

it.each(["blur", "hidden", "escape", "manual"])("cancels on %s", (reason) => {
  const { send, callbacks, controller, captured } = setup();
  send("pointerdown");
  if (reason === "blur") window.dispatchEvent(new Event("blur"));
  if (reason === "hidden") {
    vi.spyOn(document, "hidden", "get").mockReturnValue(true);
    document.dispatchEvent(new Event("visibilitychange"));
  }
  if (reason === "escape") document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
  if (reason === "manual") controller.cancel();
  expect(callbacks.onCancel).toHaveBeenCalledWith(expect.anything(), reason);
  expect(captured.size).toBe(0);
});

it("restores styles and removes listeners on repeated destroy", () => {
  const { element, send, controller, callbacks } = setup();
  // touch-action is unsupported by this jsdom version; verified in Playwright.
  expect(element.style.getPropertyValue("user-select")).toBe("none");
  expect(document.body.style.getPropertyValue("touch-action")).toBe("");
  expect(send("dragstart").defaultPrevented).toBe(true);
  expect(send("selectstart").defaultPrevented).toBe(true);
  send("pointerdown");
  controller.destroy();
  controller.destroy();
  expect(callbacks.onCancel).toHaveBeenCalledTimes(1);
  expect(element.style.getPropertyValue("user-select")).toBe("text");
  expect(element.style.getPropertyPriority("user-select")).toBe("important");
  expect(element.style.getPropertyValue("touch-action")).toBe("");
  send("pointerdown");
  window.dispatchEvent(new Event("blur"));
  expect(callbacks.onStart).toHaveBeenCalledTimes(1);
  expect(send("dragstart").defaultPrevented).toBe(false);
});

it("does not start when capture fails", () => {
  const { element, send, callbacks } = setup();
  element.setPointerCapture = vi.fn(() => { throw new DOMException("No pointer"); });
  send("pointerdown");
  send("pointerup");
  expect(callbacks.onStart).not.toHaveBeenCalled();
  expect(callbacks.onEnd).not.toHaveBeenCalled();
});
