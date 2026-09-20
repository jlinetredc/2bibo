// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";
import { expect, it } from "vitest";
import { JIGSAW_THEME_PACKS, generateThemedPuzzle, getJigsawThemePack } from "./themePacks";
import { JIGSAW_DIFFICULTIES } from "../domain/difficultyPresets";

it("provides immutable original and character packs with distinct local pictures", async () => {
  expect(JIGSAW_THEME_PACKS.map((p) => p.id)).toEqual(["doraemon", "labrador", "princess", "animals", "dinosaurs", "vehicles", "ocean", "space", "farm"]);
  const pictures = JIGSAW_THEME_PACKS.flatMap((p) => p.pictures);
  expect(new Set(pictures.map((p) => p.id)).size).toBe(24);
  expect(new Set(pictures.map((p) => p.image.src)).size).toBe(24);
  expect(getJigsawThemePack("princess")?.pictures).toHaveLength(4);
  expect(getJigsawThemePack("doraemon")?.pictures).toHaveLength(4);
  expect(getJigsawThemePack("labrador")?.pictures).toHaveLength(4);
  expect(Object.isFrozen(JIGSAW_THEME_PACKS)).toBe(true);
  for (const pack of JIGSAW_THEME_PACKS) {
    expect(getJigsawThemePack(pack.id)).toBe(pack);
    expect(pack.pictures.length).toBeGreaterThan(0);
    expect(Object.isFrozen(pack)).toBe(true);
    expect(Object.isFrozen(pack.pictures)).toBe(true);
    for (const picture of pack.pictures) {
      expect(Object.isFrozen(picture)).toBe(true);
      expect(Object.isFrozen(picture.image)).toBe(true);
      expect(picture.title.length).toBeGreaterThan(0);
      expect(picture.image.alt.length).toBeGreaterThan(10);
      expect(picture.image.src).toMatch(/^\/images\/themes\/[a-z-]+\/[a-z-]+\.(svg|webp|png)$/);
      if (!picture.image.src.endsWith(".svg")) {
        const path = resolve("public", picture.image.src.slice(1));
        const metadata = await sharp(path).metadata();
        expect([metadata.width, metadata.height]).toEqual([picture.image.width, picture.image.height]);
        expect(readFileSync(path).byteLength).toBeLessThan(picture.image.src.endsWith(".png") ? 1000000 : 500000);
        continue;
      }
      const svg = readFileSync(resolve("public", picture.image.src.slice(1)), "utf8");
      expect(svg).toContain('width="640" height="480" viewBox="0 0 640 480"');
      expect(svg).toContain("<title");
      expect(svg).toContain("<desc");
      expect(svg).not.toMatch(/<script|<foreignObject|<image|<animate|\bon\w+=|href=/i);
      expect(Buffer.byteLength(svg)).toBeLessThan(8000);
    }
  }
});

it.each(JIGSAW_THEME_PACKS)("generates all supported counts from every image in $id", (pack) => {
  for (const picture of pack.pictures) for (const config of Object.values(JIGSAW_DIFFICULTIES)) for (const pieceCount of config.counts) {
    const puzzle = generateThemedPuzzle({ id: picture.id, themeId: pack.id, pictureId: picture.id, level: config.level, pieceCount });
    expect(puzzle.pieces).toHaveLength(pieceCount);
    expect(puzzle.image).toEqual(picture.image);
    expect(puzzle.pieces.reduce((area, p) => area + p.source.width * p.source.height, 0)).toBe(picture.image.width * picture.image.height);
  }
});

it("rejects missing or cross-pack pictures rather than silently replacing the choice", () => {
  expect(getJigsawThemePack("__proto__")).toBeUndefined();
  for (const [themeId, pictureId] of [["missing", "animals-fox"], ["animals", "missing"], ["ocean", "animals-fox"]]) {
    expect(() => generateThemedPuzzle({ id: "test", themeId, pictureId })).toThrow("Unknown picture");
  }
  expect(generateThemedPuzzle({ id: "guest", themeId: "animals", pictureId: "animals-fox" }).pieces).toHaveLength(4);
});
