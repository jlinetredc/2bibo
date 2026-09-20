// @vitest-environment node
import { expect, it } from "vitest";
import { scatterColumns, scatterDrop, scatterPosition, nudgeScatter } from "./scatter";

it.each([4, 6, 9, 12, 16, 24])("keeps all %i initial pieces distinct and reachable on a narrow mat", (count) => {
  const positions = Array.from({ length: count }, (_, i) => scatterPosition(i, count));
  expect(new Set(positions.map((p) => JSON.stringify(p))).size).toBe(count);
  for (const p of positions) {
    expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(1);
    expect(p.y).toBeGreaterThanOrEqual(0); expect(p.y).toBeLessThanOrEqual(1);
  }
  const rows = Math.ceil(count / scatterColumns(count));
  const size = count === 4 ? 112 : count <= 12 ? 80 : 64;
  const height = count === 4 ? 280 : count <= 12 ? rows * 94 + 16 : Math.max(170, rows * 78 + 20);
  for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
    const dx = Math.abs(positions[i].x - positions[j].x) * (280 - size);
    const dy = Math.abs(positions[i].y - positions[j].y) * (height - size);
    expect(dx >= size || dy >= size).toBe(true);
  }
});
it("clamps rearranged pieces to the mat and preserves normalized location after resizing", () => {
  const area = { x: 100, y: 200, width: 400, height: 300 };
  expect(scatterDrop({ x: -1000, y: 2000 }, area, 64)).toEqual({ x: 0, y: 1 });
  expect(scatterDrop({ x: 300, y: 350 }, area, 64)).toEqual({ x: .5, y: .5 });
  expect(scatterDrop({ x: 500, y: 500 }, { ...area, width: 800, height: 600 }, 64)).toEqual({ x: .5, y: .5 });
  expect(nudgeScatter({ x: .98, y: .01 }, .05, -.05)).toEqual({ x: 1, y: 0 });
});
it.each([4, 6, 9, 12, 16, 24])("tablet tray keeps %i pieces separate in shallow rows", (count) => {
  const positions = Array.from({ length: count }, (_, i) => scatterPosition(i, count, true));
  const rows = Math.ceil(count / scatterColumns(count, true));
  const size = count === 4 ? 128 : count <= 12 ? 88 : 64;
  const height = count === 4 ? 148 : rows * (count <= 12 ? 102 : 78) + 16;
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
    const dx = Math.abs(positions[i].x - positions[j].x) * (660 - size);
    const dy = Math.abs(positions[i].y - positions[j].y) * (height - size);
    expect(dx >= size || dy >= size).toBe(true);
  }
});
it.each([16, 24])("landscape tray keeps %i pieces separate in two rows", (count) => {
  const positions = Array.from({ length: count }, (_, i) => scatterPosition(i, count, true, true));
  expect(Math.ceil(count / scatterColumns(count, true, true))).toBe(2);
  for (let i = 0; i < count; i++) for (let j = i + 1; j < count; j++) {
    const dx = Math.abs(positions[i].x - positions[j].x) * (964 - 64);
    const dy = Math.abs(positions[i].y - positions[j].y) * (172 - 64);
    expect(dx >= 64 || dy >= 64).toBe(true);
  }
});
