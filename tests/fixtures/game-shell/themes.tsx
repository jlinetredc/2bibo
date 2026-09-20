import { createRoot } from "react-dom/client";
import { JIGSAW_THEME_PACKS, generateThemedPuzzle } from "../../../src/games/jigsaw/data/themePacks";
import { JigsawImagePiece } from "../../../src/games/jigsaw/JigsawImagePiece";

function Fixture() {
  return <main>
    <style>{`body{margin:16px;background:#faf6ed;font-family:Arial;color:#34385e}main{max-width:1100px;margin:auto}.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(260px,100%),1fr));gap:20px}figure{margin:0}img{width:100%;height:auto;display:block;border-radius:16px}.pieces{display:grid;grid-template-columns:repeat(6,1fr)}h1{font-size:24px}figcaption{padding:8px 0}h2{font-size:18px}`}</style>
    <h1>Các bộ tranh Jigsaw</h1>
    <div className="gallery">{JIGSAW_THEME_PACKS.flatMap((pack) => pack.pictures.map((picture) => {
      const puzzle = generateThemedPuzzle({ id: picture.id, themeId: pack.id, pictureId: picture.id, level: "advanced", pieceCount: 24 });
      return <figure key={picture.id} data-picture={picture.id}>
        {/* Isolated browser reference for the original local artwork. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={picture.image.src} alt={picture.image.alt} width={picture.image.width} height={picture.image.height} />
        <figcaption>{pack.title} · {picture.title}</figcaption>
        <div className="pieces" style={{ gridTemplateColumns: puzzle.pieces.slice(0, 6).map((p) => `${p.source.width}fr`).join(" ") }}>
          {puzzle.pieces.map((piece) => <JigsawImagePiece key={piece.id} piece={piece} image={puzzle.image} />)}
        </div>
      </figure>;
    }))}</div>
  </main>;
}
createRoot(document.getElementById("root")!).render(<Fixture />);
