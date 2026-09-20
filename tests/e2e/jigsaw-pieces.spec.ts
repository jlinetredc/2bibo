import { expect, test } from "@playwright/test";

test("rectangular crops reconstruct the exact source raster and resize without distortion", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/jigsaw.html");
  const assembled = page.locator("[data-assembled]");
  await expect(page.locator("[data-reference]")).toBeVisible();
  await page.locator("[data-reference]").evaluate((element) => (element as HTMLImageElement).decode());
  for (const grid of ["2x2", "2x3", "3x3", "3x4", "4x4", "4x6"]) {
    await page.getByLabel("Lưới", { exact: true }).selectOption(grid);
    const [rows, columns] = grid.split("x").map(Number);
    await expect(assembled.getByRole("img")).toHaveCount(rows * columns);
    // Screenshot buffers compare actual browser rasterization, including crop edges.
    const source = await page.locator("[data-reference]").screenshot();
    await expect.poll(async () => (await assembled.screenshot()).equals(source)).toBe(true);
    // Uneven source dimensions exercise shared seams, including 24 pieces.
    const coverage = await page.locator("[data-interlocking]").evaluate((root) => {
      const context = document.createElement("canvas").getContext("2d")!;
      const paths = [...root.querySelectorAll("svg > path")].map((path) => new Path2D(path.getAttribute("d")!));
      let gaps = 0, overlaps = 0;
      for (let y = .5; y < 67; y++) for (let x = .5; x < 101; x++) {
        const count = paths.filter((path) => context.isPointInPath(path, x, y)).length;
        if (!count) gaps++; if (count > 1) overlaps++;
      }
      return { gaps, overlaps, count: paths.length };
    });
    expect(coverage).toEqual({ gaps: 0, overlaps: 0, count: rows * columns });
  }
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const bounds = (await page.locator("[data-responsive]").boundingBox())!;
    expect(bounds.width / bounds.height).toBeCloseTo(101 / 67, 2);
    for (const piece of await page.locator("[data-responsive]").getByRole("img").all()) {
      await expect(piece).toHaveAttribute("aria-label", /Ảnh kiểm tra màu — mảnh hàng \d, cột \d/);
      const box = (await piece.boundingBox())!;
      expect(box.width).toBeGreaterThan(0); expect(box.height).toBeGreaterThan(0);
    }
  }
});
