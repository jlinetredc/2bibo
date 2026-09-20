"use client";
import { useEffect, useState, type CSSProperties } from "react";
import type { ImagePiece, JigsawImage } from "./domain/imagePieces";
import styles from "./JigsawGame.module.css";

/** One short celebration per committed piece; unmounting cancels its lifetime. */
export function PlacementBurst({ piece, image }: { piece: ImagePiece; image: JigsawImage }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 900);
    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return <span aria-hidden="true" data-placement-burst={piece.id} className={styles.placementBurst}
    style={{ left: `${(piece.source.x + piece.source.width / 2) / image.width * 100}%`, top: `${(piece.source.y + piece.source.height / 2) / image.height * 100}%` }}>
    <span className={styles.burstBadge}>★</span>
    {Array.from({ length: 8 }, (_, index) => <i key={index} style={{ "--burst-angle": `${index * 45}deg` } as CSSProperties}>✦</i>)}
  </span>;
}
