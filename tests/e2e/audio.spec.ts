import { expect, test } from "@playwright/test";

declare global { interface Window { audioEvents: string[] } }

test("audio plays after activation or degrades safely when Web Audio is unavailable", async ({ page, isMobile }) => {
  await page.addInitScript(() => {
    window.audioEvents = [];
    if (typeof AudioBufferSourceNode === "undefined") return;
    const start = AudioBufferSourceNode.prototype.start;
    const stop = AudioBufferSourceNode.prototype.stop;
    AudioBufferSourceNode.prototype.start = function (...args) {
      window.audioEvents.push("start");
      return start.apply(this, args);
    };
    AudioBufferSourceNode.prototype.stop = function (...args) {
      window.audioEvents.push("stop");
      return stop.apply(this, args);
    };
  });
  await page.goto("http://127.0.0.1:3101/audio.html");
  expect(await page.evaluate(() => window.audioEvents)).toEqual([]);
  for (const width of [320, 375, 768, 1024]) {
    await page.setViewportSize({ width, height: width === 1024 ? 768 : 1024 });
    await expect(page.getByRole("button", { name: "Phát voice" })).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const play = page.getByRole("button", { name: "Phát voice" });
  if (isMobile) await play.tap(); else await play.click();
  if (!await page.evaluate(() => typeof AudioContext !== "undefined")) {
    await expect(page.getByRole("status")).toHaveText("locked");
    expect(await page.evaluate(() => window.audioEvents)).toEqual([]);
    await page.getByRole("button", { name: "Chơi lại" }).click();
    await expect(page.getByRole("status")).toHaveText("stopped");
    return;
  }
  await expect(page.getByRole("status")).toHaveText("started");
  await play.click();
  await expect.poll(() => page.evaluate(() => window.audioEvents)).toEqual(["start", "stop", "start"]);
  await page.getByRole("button", { name: "Tắt âm thanh" }).click();
  await expect.poll(() => page.evaluate(() => window.audioEvents)).toEqual(["start", "stop", "start", "stop"]);
  await play.click();
  await expect(page.getByRole("status")).toHaveText("muted");
  await page.getByRole("button", { name: "Tắt âm thanh" }).click();
  await page.getByRole("button", { name: "Phát music" }).click();
  await expect(page.getByRole("status")).toHaveText("started");
  await page.getByRole("button", { name: "Chơi lại" }).click();
  await expect(page.getByRole("status")).toHaveText("stopped");
  expect(await page.evaluate(() => window.audioEvents.slice(-2))).toEqual(["start", "stop"]);
});
