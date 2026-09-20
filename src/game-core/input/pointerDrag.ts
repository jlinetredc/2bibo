export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface DragSample {
  readonly pointerId: number;
  readonly pointerType: string;
  /** Viewport coordinates in CSS pixels, suitable for elementFromPoint. */
  readonly position: Point;
  readonly start: Point;
  readonly delta: Point;
}

export type DragCancelReason = "pointercancel" | "lostcapture" | "blur" | "hidden" | "escape" | "manual" | "destroy";

export interface PointerDragCallbacks {
  onStart?: (sample: DragSample) => void;
  onMove?: (sample: DragSample) => void;
  onEnd?: (sample: DragSample) => void;
  onCancel?: (sample: DragSample, reason: DragCancelReason) => void;
}

/** Attach once to a dedicated drag handle; destroy on unmount. No document scroll lock. */
export function attachPointerDrag(element: HTMLElement, callbacks: PointerDragCallbacks) {
  const doc = element.ownerDocument;
  const win = doc.defaultView;
  let active: DragSample | undefined;
  let destroyed = false;
  const properties = ["touch-action", "user-select", "-webkit-user-select"];
  const previous = properties.map((name) => ({
    name, value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name),
  }));
  // Must be in place BEFORE pointerdown; changing touch-action mid-gesture is too late.
  for (const name of properties) element.style.setProperty(name, "none");

  const sample = (event: PointerEvent, start: Point): DragSample => ({
    pointerId: event.pointerId,
    pointerType: event.pointerType,
    position: { x: event.clientX, y: event.clientY },
    start,
    delta: { x: event.clientX - start.x, y: event.clientY - start.y },
  });

  function release() {
    const last = active;
    active = undefined; // Clear before release: lostpointercapture must not cancel twice.
    if (last) {
      try {
        if (element.hasPointerCapture(last.pointerId)) element.releasePointerCapture(last.pointerId);
      } catch {
        // A detached element or already-ended pointer may no longer own capture.
      }
    }
    return last;
  }

  function cancel(reason: DragCancelReason = "manual") {
    const last = release();
    if (last) callbacks.onCancel?.(last, reason);
  }

  function down(event: PointerEvent) {
    if (destroyed || active || !event.isPrimary || event.button !== 0) return;
    try {
      element.setPointerCapture(event.pointerId);
    } catch {
      return; // Never start a drag whose release cannot be tracked.
    }
    active = sample(event, { x: event.clientX, y: event.clientY });
    try { callbacks.onStart?.(active); } catch (error) { release(); throw error; }
  }

  function move(event: PointerEvent) {
    if (!active || event.pointerId !== active.pointerId) return;
    active = sample(event, active.start);
    try { callbacks.onMove?.(active); } catch (error) { release(); throw error; }
  }

  function up(event: PointerEvent) {
    if (!active || event.pointerId !== active.pointerId) return;
    active = sample(event, active.start);
    const last = release();
    if (last) callbacks.onEnd?.(last);
  }

  function pointerCancel(event: PointerEvent) {
    if (event.pointerId === active?.pointerId) cancel("pointercancel");
  }
  function lost(event: PointerEvent) {
    if (event.pointerId === active?.pointerId) cancel("lostcapture");
  }
  function blur() { cancel("blur"); }
  function visibility() { if (doc.hidden) cancel("hidden"); }
  function key(event: KeyboardEvent) { if (event.key === "Escape") cancel("escape"); }
  function preventNative(event: Event) { event.preventDefault(); }

  element.addEventListener("pointerdown", down);
  element.addEventListener("pointermove", move);
  element.addEventListener("pointerup", up);
  element.addEventListener("pointercancel", pointerCancel);
  element.addEventListener("lostpointercapture", lost);
  element.addEventListener("dragstart", preventNative);
  element.addEventListener("selectstart", preventNative);
  win?.addEventListener("blur", blur);
  doc.addEventListener("visibilitychange", visibility);
  doc.addEventListener("keydown", key);

  return {
    cancel: () => cancel(),
    destroy() {
      if (destroyed) return;
      destroyed = true;
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", pointerCancel);
      element.removeEventListener("lostpointercapture", lost);
      element.removeEventListener("dragstart", preventNative);
      element.removeEventListener("selectstart", preventNative);
      win?.removeEventListener("blur", blur);
      doc.removeEventListener("visibilitychange", visibility);
      doc.removeEventListener("keydown", key);
      for (const { name, value, priority } of previous) {
        if (value) element.style.setProperty(name, value, priority);
        else element.style.removeProperty(name);
      }
      cancel("destroy");
    },
  };
}
