import { expect, it } from "vitest";
import { nearestDrop, type DropCell } from "./dropTarget";

const cells: DropCell[] = [0, 1, 2].map((column) => ({ origin: { row: 0, column }, left: column * 54, right: column * 54 + 50, top: 0, bottom: 50 }));
it("snaps across small gaps and board edges, but not to a distant legal square", () => {
  expect(nearestDrop({ x: -10, y: 25 }, cells, () => true)).toEqual({ row: 0, column: 0 });
  expect(nearestDrop({ x: 52, y: 25 }, cells, ({ column }) => column === 1)).toEqual({ row: 0, column: 1 });
  expect(nearestDrop({ x: -15, y: 25 }, cells, () => true)).toBeNull();
  expect(nearestDrop({ x: 52, y: 25 }, cells, ({ column }) => column === 2)).toBeNull();
});
it("prefers an exact legal target and keeps invalid footprints invalid away from edges", () => {
  expect(nearestDrop({ x: 60, y: 25 }, cells, () => true)).toEqual({ row: 0, column: 1 });
  expect(nearestDrop({ x: 25, y: 25 }, cells, ({ column }) => column === 1)).toEqual({ row: 0, column: 0 });
  expect(nearestDrop({ x: 48, y: 25 }, cells, ({ column }) => column === 1)).toEqual({ row: 0, column: 1 });
});
