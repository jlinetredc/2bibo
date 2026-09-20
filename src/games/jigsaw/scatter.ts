export interface ScatterPosition { readonly x: number; readonly y: number }
const clamp = (value: number) => Math.max(0, Math.min(1, value));
export const scatterColumns = (count: number, wide = false, landscape = false) => wide ? (count <= 6 ? count : count <= 12 ? 6 : landscape ? 12 : 8) : count <= 4 ? 2 : count <= 12 ? 3 : 4;

/** Stable, slightly scattered slots: pieces do not jump when another is placed. */
export function scatterPosition(index: number, count: number, wide = false, landscape = false): ScatterPosition {
  const columns = scatterColumns(count, wide, landscape);
  const rows = Math.ceil(count / columns);
  // Reversing alternating rows mixes the source order without randomness on render.
  const row = Math.floor(index / columns);
  const column = row % 2 ? columns - 1 - index % columns : index % columns;
  return {
    x: .04 + column / (columns - 1) * .92,
    y: rows === 1 ? .45 + (index % 2) * .1 : .04 + row / (rows - 1) * .9 + (index % 2) * .025,
  };
}

/** Coordinates represent a fraction of the available travel, so resizing preserves reachability. */
export function scatterDrop(point: { x: number; y: number }, area: { x: number; y: number; width: number; height: number }, size: number): ScatterPosition {
  return {
    x: clamp((point.x - area.x - size / 2) / Math.max(1, area.width - size)),
    y: clamp((point.y - area.y - size / 2) / Math.max(1, area.height - size)),
  };
}
export function nudgeScatter(position: ScatterPosition, dx: number, dy: number): ScatterPosition {
  return { x: clamp(position.x + dx), y: clamp(position.y + dy) };
}
