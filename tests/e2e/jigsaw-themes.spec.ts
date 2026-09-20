import { expect, test } from "@playwright/test";

test("all local theme images decode and render as responsive 24-piece puzzles", async ({ page }) => {
  const failures: string[] = [];
  page.on("requestfailed", (request) => failures.push(request.url()));
  await page.goto("http://127.0.0.1:3101/themes.html");
  await expect(page.locator("figure")).toHaveCount(24);
  for (const figure of await page.locator("figure").all()) {
    const img = figure.locator(":scope > img");
    const dimensions = await img.evaluate(async (element) => {
      const image = element as HTMLImageElement;
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    });
    expect(dimensions[0]).toBeGreaterThanOrEqual(640);
    const rendered = (await img.boundingBox())!;
    expect(rendered.width / rendered.height).toBeCloseTo(dimensions[0] / dimensions[1], 2);
    await expect(figure.locator(".pieces svg")).toHaveCount(24);
    // Each SVG references the same decoded, local source.
    expect(await figure.locator(".pieces image").first().getAttribute("href")).toBe(await img.getAttribute("src"));
  }
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const grid of await page.locator(".pieces").all()) {
      const bounds = (await grid.boundingBox())!;
      const ratio = await grid.evaluate((element) => {
        const image = element.parentElement!.querySelector("img")!;
        return image.naturalWidth / image.naturalHeight;
      });
      expect(bounds.width / bounds.height).toBeCloseTo(ratio, 2);
    }
  }
  expect(failures).toEqual([]);
  await page.screenshot({ path: `test-results/jigsaw-themes-${test.info().project.name}.png`, fullPage: true });
});
