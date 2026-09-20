import type { ImagePiece, JigsawImage } from "./domain/imagePieces";
import { useId } from "react";
import { pieceOutline } from "./domain/pieceOutline";

/** Presentation only. The host supplies a generated piece and its source image. */
export function JigsawImagePiece({ image, piece, interlocking = false, fitted = false }: { image: JigsawImage; piece: ImagePiece; interlocking?: boolean; fitted?: boolean }) {
  const clipId = useId().replace(/:/g, "");
  const { x, y, width, height } = piece.source;
  const margin = interlocking && fitted ? Math.max(width, height) * .21 : 0;
  const outline = interlocking ? pieceOutline(piece, image) : undefined;
  return <svg xmlns="http://www.w3.org/2000/svg" role="img" focusable="false"
    aria-label={`${image.alt} — mảnh hàng ${piece.row + 1}, cột ${piece.column + 1}`}
    viewBox={`${x - margin} ${y - margin} ${width + margin * 2} ${height + margin * 2}`} width={width + margin * 2} height={height + margin * 2}
    style={{ display: "block", width: "100%", height: "auto", overflow: interlocking ? "visible" : "hidden", pointerEvents: "none" }}>
    {outline && <defs><clipPath id={clipId}><path d={outline} /></clipPath></defs>}
    <image clipPath={outline ? `url(#${clipId})` : undefined} href={image.src} x={0} y={0} width={image.width} height={image.height} preserveAspectRatio="none" />
    {outline && <path d={outline} fill="none" stroke="var(--bibo-text, #34385e)" strokeOpacity=".6" strokeWidth="1" vectorEffect="non-scaling-stroke" />}
  </svg>;
}
