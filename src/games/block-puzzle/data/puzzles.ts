import { definePuzzle, type PuzzleDefinition } from "../domain/puzzle";

// Authored partitions supply varied pieces, not solver answers. The runtime
// solver must still prove these fixed-orientation sets can tile their boards.
function fromPartition(id: string, rows: readonly string[]): PuzzleDefinition {
  const labels = [...new Set(rows.join(""))];
  return definePuzzle({ id, rows: rows.length, columns: rows[0].length, pieces: labels.map((label) => {
    const cells = rows.flatMap((row, r) => [...row].flatMap((value, c) => value === label ? [{ row: r, column: c }] : []));
    const top = Math.min(...cells.map((cell) => cell.row)), left = Math.min(...cells.map((cell) => cell.column));
    return { id: label, cells: cells.map((cell) => ({ row: cell.row - top, column: cell.column - left })) };
  }) });
}

export const blockPuzzles = Object.freeze([
  fromPartition("puzzle-1", ["AAA", "BBC", "BCC"]),
  fromPartition("puzzle-2", ["AABB", "ACCB", "ACCC"]),
  fromPartition("puzzle-3", ["AABB", "AABC", "DDCC", "DDDC"]),
]);

export function getBlockPuzzle(id = "puzzle-1"): PuzzleDefinition {
  const puzzle = blockPuzzles.find((item) => item.id === id);
  if (!puzzle) throw new RangeError(`Unknown puzzle: ${id}`);
  return puzzle;
}
