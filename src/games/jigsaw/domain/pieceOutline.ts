import type { ImagePiece, JigsawImage } from "./imagePieces";

/** Shared seams use the same edge length and polarity on both neighbours. */
export function pieceOutline(piece: ImagePiece, image: JigsawImage): string {
  const { x, y, width: w, height: h } = piece.source;
  const horizontal = (row: number) => row % 2 ? 1 : -1;
  const vertical = (column: number) => column % 2 ? 1 : -1;
  const edges = [
    [x, y, w, 0, y === 0 ? 0 : -horizontal(piece.row)],
    [x + w, y, 0, h, x + w === image.width ? 0 : vertical(piece.column + 1)],
    [x + w, y + h, -w, 0, y + h === image.height ? 0 : horizontal(piece.row + 1)],
    [x, y + h, 0, -h, x === 0 ? 0 : -vertical(piece.column)],
  ];
  const path = [`M ${x} ${y}`];
  for (const [sx, sy, dx, dy, sign] of edges) {
    const point = (t: number, n: number) => `${sx + dx * t + dy * n * sign} ${sy + dy * t - dx * n * sign}`;
    if (!sign) { path.push(`L ${point(1, 0)}`); continue; }
    path.push(`L ${point(.36, 0)}`,
      `C ${point(.44, 0)} ${point(.44, .035)} ${point(.42, .07)}`,
      `C ${point(.32, .21)} ${point(.68, .21)} ${point(.58, .07)}`,
      `C ${point(.56, .035)} ${point(.56, 0)} ${point(.64, 0)}`,
      `L ${point(1, 0)}`);
  }
  return `${path.join(" ")} Z`;
}
