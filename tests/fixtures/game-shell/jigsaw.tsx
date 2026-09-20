import { useState } from "react";
import { createRoot } from "react-dom/client";
import { generateImagePieces } from "../../../src/games/jigsaw/domain/imagePieces";
import { JigsawImagePiece } from "../../../src/games/jigsaw/JigsawImagePiece";

// Local synthetic raster with a unique color at each coordinate. Not a theme pack.
const canvas = document.createElement("canvas"); canvas.width = 101; canvas.height = 67;
const context = canvas.getContext("2d")!;
const pixels = context.createImageData(101, 67);
for (let y = 0; y < 67; y++) for (let x = 0; x < 101; x++) {
  const offset = (y * 101 + x) * 4;
  pixels.data.set([x * 2, y * 3, 80 + ((x + y) % 2) * 100, 255], offset);
}
context.putImageData(pixels, 0, 0);
const image = { src: canvas.toDataURL("image/png"), width: 101, height: 67, alt: "Ảnh kiểm tra màu" };

function Fixture() {
  const [grid, setGrid] = useState("2x3");
  const [rows, columns] = grid.split("x").map(Number);
  const result = generateImagePieces({ id: "fixture", image, rows, columns });
  const widths = result.pieces.slice(0, columns).map((piece) => piece.source.width);
  const tiles = result.pieces.map((piece) => <JigsawImagePiece key={piece.id} image={result.image} piece={piece} />);
  return <main>
    <style>{`body{margin:16px;font-family:Arial,sans-serif}main{max-width:640px;margin:auto}select{min-height:48px;font:inherit}h1{font-size:22px}.proofs{display:flex;gap:16px;margin:16px 0}.proofs img{display:block}h2{font-size:18px}`}</style>
    <h1>Mảnh ảnh Jigsaw — kiểm tra riêng</h1>
    <label htmlFor="grid">Lưới </label><select id="grid" value={grid} onChange={(event) => setGrid(event.target.value)}>
      {["2x2", "2x3", "3x3", "3x4", "4x4", "4x6"].map((value) => <option key={value}>{value}</option>)}
    </select>
    <div className="proofs">
      {/* Test-only reference: the same source raster, never a production asset. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img data-reference src={image.src} alt="Ảnh gốc kiểm tra" width={101} height={67} />
      <div data-assembled style={{ display: "grid", width: 101, gridTemplateColumns: widths.map((width) => `${width}px`).join(" ") }}>{tiles}</div>
    </div>
    <h2>Ảnh ghép phóng to</h2>
    <div data-responsive style={{ display: "grid", width: "100%", gridTemplateColumns: widths.map((width) => `${width}fr`).join(" ") }}>{tiles}</div>
    <h2>Mảnh có tai ghép</h2>
    <div data-interlocking style={{ display: "grid", width: "100%", gridTemplateColumns: widths.map((width) => `${width}fr`).join(" ") }}>
      {result.pieces.map((piece) => <JigsawImagePiece key={piece.id} image={result.image} piece={piece} interlocking />)}
    </div>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
