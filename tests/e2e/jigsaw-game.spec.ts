import { expect, test } from "@playwright/test";

test("correct placement celebrates at its cell and reduced motion keeps a quiet badge", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/play/jigsaw");
  await page.getByRole("button", { name: "Mảnh 1", exact: true }).click();
  await page.locator('[data-target="2"]').click();
  await expect(page.locator("[data-placement-burst]")).toHaveCount(0);
  await page.locator('[data-target="1"]').click();
  const burst = page.locator("[data-placement-burst]");
  await expect(burst).toHaveCount(1);
  await expect(burst).toHaveCSS("pointer-events", "none");
  await expect(burst.locator("i").first()).toBeHidden();
  await expect(burst.locator("span")).toHaveCSS("animation-name", "none");
  const cell = (await page.locator('[data-target="1"]').boundingBox())!;
  const effect = (await burst.boundingBox())!;
  expect(Math.abs(effect.x - cell.x - cell.width / 2)).toBeLessThan(2);
  expect(Math.abs(effect.y - cell.y - cell.height / 2)).toBeLessThan(2);
  await expect(burst).toHaveCount(0);
});

test("free rearrangement stays on the mat, cancellation preserves it, tidy recovers pieces and library drafts cancel", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/play/jigsaw");
  const piece = page.getByRole("button", { name: "Mảnh 1", exact: true });
  await expect(piece).toBeVisible();
  const original = await piece.getAttribute("style");
  await piece.scrollIntoViewIfNeeded();
  const originalPosition = await piece.evaluate((el) => [(el as HTMLElement).style.left, (el as HTMLElement).style.top]);
  const mat = (await page.locator("[data-scatter]").boundingBox())!, start = (await piece.boundingBox())!;
  await page.mouse.move(start.x + start.width / 2, start.y + start.height / 2); await page.mouse.down();
  await page.mouse.move(mat.x + mat.width * .3, mat.y + mat.height * .65, { steps: 5 }); await page.mouse.up();
  await expect(page.locator('[data-placed="true"]')).toHaveCount(0);
  await expect(piece).not.toHaveAttribute("style", original!);
  const moved = (await piece.boundingBox())!, saved = await piece.evaluate((el) => [(el as HTMLElement).style.left, (el as HTMLElement).style.top]);
  expect(moved.x).toBeGreaterThanOrEqual(mat.x); expect(moved.y + moved.height).toBeLessThanOrEqual(mat.y + mat.height + 1);
  await page.mouse.move(moved.x + 30, moved.y + 30); await page.mouse.down(); await page.mouse.move(5, 5);
  await page.keyboard.press("Escape"); await page.mouse.up();
  expect(await piece.evaluate((el) => [(el as HTMLElement).style.left, (el as HTMLElement).style.top])).toEqual(saved);
  await piece.focus(); await piece.press("ArrowLeft");
  expect(await piece.evaluate((el) => (el as HTMLElement).style.left)).not.toBe(saved[0]);
  await page.getByRole("button", { name: "Xếp gọn" }).click();
  expect(await piece.evaluate((el) => [(el as HTMLElement).style.left, (el as HTMLElement).style.top])).toEqual(originalPosition);
  await page.getByRole("button", { name: "🖼️ Chọn tranh", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "24 mảnh", exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "🖼️ Chọn tranh", exact: true })).toBeFocused();
  await expect(page.locator("[data-target]")).toHaveCount(4);
});

test("character pictures, explicit piece-count changes, visual hints and a complete 24-piece round", async ({ page }) => {
  test.setTimeout(60000); // Four layouts plus 48 taps and short celebrations on tablet WebKit.
  await page.goto("/play/jigsaw");
  await expect(page.locator("[data-target]")).toHaveCount(4);
  await page.getByRole("button", { name: "🖼️ Chọn tranh", exact: true }).click();
  await page.getByRole("navigation", { name: "Bộ tranh" }).getByRole("button", { name: "Cảnh sát trưởng Labrador", exact: true }).click();
  await page.getByRole("button", { name: "Cùng qua đường", exact: true }).click();
  await page.getByRole("button", { name: "24 mảnh", exact: true }).click();
  await expect(page.locator("[data-target]")).toHaveCount(4);
  await page.getByRole("button", { name: "▶ Bắt đầu ghép" }).click();
  await expect(page.locator("[data-target]")).toHaveCount(24);
  await expect(page.locator('[data-target="1"] image')).toHaveAttribute("href", /labrador/);
  const tray = page.getByRole("group", { name: "Khay mảnh ghép" });
  await expect(tray.getByRole("button")).toHaveCount(24);
  await page.getByRole("button", { name: "Ảnh gợi ý: Bật" }).click();
  await expect(page.locator('[data-target="1"] image')).toHaveCount(0);
  await page.getByRole("button", { name: "Ảnh gợi ý: Tắt" }).click();
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(() => tray.evaluate((el) => (el as HTMLElement).style.getPropertyValue("--scatter-rows"))).toBe(width >= 1000 ? "2" : width >= 700 ? "3" : "6");
    await page.evaluate(() => window.scrollTo(0, 0));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width >= 700) {
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
      const boardBounds = (await page.locator("[data-jigsaw-board]").boundingBox())!;
      const trayBounds = (await tray.boundingBox())!;
      expect(trayBounds.y).toBeGreaterThan(boardBounds.y + boardBounds.height);
      expect(trayBounds.height).toBeLessThan(260);
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    }
    const matBounds = (await page.locator("[data-scatter]").boundingBox())!;
    for (const piece of await tray.getByRole("button").all()) {
      const box = (await piece.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(matBounds.x);
      expect(box.y).toBeGreaterThanOrEqual(matBounds.y);
      expect(box.x + box.width).toBeLessThanOrEqual(matBounds.x + matBounds.width + 1);
      expect(box.y + box.height).toBeLessThanOrEqual(matBounds.y + matBounds.height + 1);
    }
    for (const target of await page.locator("[data-target]").all()) {
      const box = (await target.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(47.9); expect(box.height).toBeGreaterThanOrEqual(48);
    }
  }
  await expect(page.getByRole("button", { name: "Mảnh trang sau" })).toHaveCount(0);
  await page.screenshot({ path: `test-results/jigsaw-characters-${test.info().project.name}.png`, fullPage: true });
  for (let i = 0; i < 24; i++) {
    const piece = tray.getByRole("button").first();
    const number = (await piece.getAttribute("aria-label"))!.split(" ")[1];
    await piece.click(); await page.locator(`[data-target="${number}"]`).click();
  }
  await expect(page.getByRole("heading", { name: "Con làm được rồi!" })).toBeVisible();
  await page.getByRole("button", { name: "Ghép lại" }).click();
  await expect(page.locator("[data-target]")).toHaveCount(24);
  await expect(tray.getByRole("button")).toHaveCount(24);
});

test("uses the active age band, retains placements across rotation and recovers an image failure", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("bibo-play:profiles", JSON.stringify({
    version: 1, data: { activeId: "older", profiles: [{ id: "older", nickname: "Bé", ageBand: "7+", avatar: "cat" }] },
  })));
  let failed = true;
  await page.route("**/images/themes/doraemon/garden.webp", (route) => failed ? route.abort() : route.continue());
  await page.goto("/play/jigsaw");
  await expect(page.getByRole("button", { name: "Mở lại tranh" })).toBeVisible();
  failed = false;
  await page.getByRole("button", { name: "Mở lại tranh" }).click();
  await expect(page.locator("[data-target]")).toHaveCount(9);
  await page.getByRole("button", { name: "Mảnh 1", exact: true }).click();
  await page.locator('[data-target="1"]').click();
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    await expect(page.locator('[data-placed="true"]')).toHaveCount(1);
    if (width >= 700) await expect.poll(() => page.evaluate(() => document.documentElement.scrollHeight <= innerHeight + 1)).toBe(true);
    else await expect(page.locator('[data-jigsaw-board]').locator('..')).not.toHaveAttribute("style", /max-width/);
    // Read related bounds in one frame while the responsive board refits.
    await expect.poll(() => page.evaluate(() => {
      const board = document.querySelector('[data-jigsaw-board]')!.getBoundingClientRect();
      const placed = document.querySelector('[data-target="1"] svg')!.getBoundingClientRect();
      return Math.abs(placed.y - board.y) < .5 && Math.abs(placed.height - board.height / 3) < .5 &&
        [...document.querySelectorAll('[data-target]')].every((el) => Math.abs(el.getBoundingClientRect().height - board.height / 3) < .5);
    })).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole("button").all()) {
      const bounds = (await button.boundingBox())!;
      expect(bounds.width).toBeGreaterThanOrEqual(48);
      expect(bounds.height).toBeGreaterThanOrEqual(48);
    }
  }
  await page.screenshot({ path: `test-results/jigsaw-playing-${test.info().project.name}.png`, fullPage: true });
});

test("one-pointer tap/keyboard completion, replay, picture selection and responsive layout", async ({ page, isMobile }) => {
  await page.goto("/play");
  await page.getByRole("link", { name: "Bibo Jigsaw" }).click();
  const piece = (i: number) => page.getByRole("button", { name: `Mảnh ${i}`, exact: true });
  const target = (i: number) => page.getByRole("button", { name: `Ô ${i}`, exact: true });
  await expect(piece(1)).toBeVisible();
  for (const [width, height] of [[320, 700], [375, 812], [768, 1024], [1024, 768], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const button of await page.getByRole("button").all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(48); expect(box.height).toBeGreaterThanOrEqual(48);
    }
  }
  await piece(1).focus(); await expect(piece(1)).toHaveCSS("outline-style", "solid");
  await piece(1).press("Enter"); await target(2).press("Enter");
  await expect(page.getByRole("status")).toContainText("Thử lại nhé!");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (let i = 1; i <= 4; i++) {
    if (isMobile) { await piece(i).tap(); await target(i).tap(); }
    else { await piece(i).press("Enter"); await target(i).press("Enter"); }
  }
  await expect(page.getByRole("heading", { name: "Con làm được rồi!" })).toBeFocused();
  await expect(page.locator("[data-jigsaw-board] > img")).toBeVisible();
  await expect(page.getByRole("group", { name: "Khay mảnh ghép" })).toHaveCount(0);
  expect(await page.locator('[aria-hidden="true"]').filter({ hasText: "⭐ 🌟 ⭐" }).evaluate((el) => getComputedStyle(el).animationName)).toBe("none");
  await page.screenshot({ path: `test-results/jigsaw-complete-${test.info().project.name}.png`, fullPage: true });
  await page.getByRole("button", { name: "Ghép lại" }).click(); await expect(piece(1)).toBeVisible();
  await page.getByRole("button", { name: "🖼️ Chọn tranh", exact: true }).click();
  await page.getByRole("navigation", { name: "Bộ tranh" }).getByRole("button", { name: "Đại dương", exact: true }).click();
  await page.getByRole("button", { name: "Rùa biển", exact: true }).click();
  await expect(page.locator("svg image").first()).toHaveAttribute("href", /doraemon\/garden.webp/);
  await page.getByRole("button", { name: "▶ Bắt đầu ghép" }).click();
  await expect(page.locator("svg image").first()).toHaveAttribute("href", /turtle.svg/);
  await piece(1).click(); await target(1).click();
  await page.getByRole("button", { name: "Chơi lại", exact: true }).click();
  await expect(page.locator('[data-placed="true"]')).toHaveCount(0);
  await page.reload(); await expect(piece(1)).toBeVisible();
});

test("twenty cancelled/outside drags, valid snapping, resize cancellation and quick tap recovery", async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/play/jigsaw");
  const piece = page.getByRole("button", { name: "Mảnh 1", exact: true });
  await expect(piece).toBeVisible();
  for (let i = 0; i < 20; i++) {
    const box = (await piece.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(2, 2, { steps: 2 });
    if (i % 2) await page.keyboard.press("Escape");
    await page.mouse.up();
  }
  await expect(page.locator('[data-placed="true"]')).toHaveCount(0);
  const box = (await piece.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.down();
  await page.mouse.move(200, 220, { steps: 3 });
  await expect(page.locator("[data-jigsaw-ghost]")).toBeVisible();
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator("[data-jigsaw-ghost]")).toHaveCount(0);
  await page.mouse.up();
  await piece.scrollIntoViewIfNeeded();
  const fresh = (await piece.boundingBox())!, cell = (await page.locator('[data-target="1"]').boundingBox())!;
  await page.mouse.move(fresh.x + 30, fresh.y + 30); await page.mouse.down();
  await page.mouse.move(cell.x + cell.width / 2 + 10, cell.y + cell.height / 2, { steps: 5 });
  await expect(page.locator('[data-snap="true"]')).toHaveCount(1);
  await page.mouse.up();
  await expect(page.locator('[data-placed="true"]')).toHaveCount(1);
  await page.getByRole("button", { name: "Mảnh 2", exact: true }).click();
  await page.locator('[data-target="2"]').click();
  await expect(page.locator('[data-placed="true"]')).toHaveCount(2);
});

test("native single-touch drag cancels, snaps without document scrolling and allows the next tap", async ({ browser, browserName }) => {
  test.skip(browserName !== "chromium", "CDP touch injection; WebKit single taps and pointer cancellation are covered separately.");
  const context = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 768, height: 1024 } });
  try {
    const page = await context.newPage(); await page.goto("http://127.0.0.1:3100/play/jigsaw");
    const piece = page.getByRole("button", { name: "Mảnh 1", exact: true });
    await expect(piece).toBeVisible();
    const box = (await piece.boundingBox())!, target = (await page.locator('[data-target="1"]').boundingBox())!;
    const cdp = await context.newCDPSession(page), scroll = await page.evaluate(() => scrollY);
    for (const cancel of [true, false]) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: box.x + 30, y: box.y + 30 }] });
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: target.x + target.width / 2, y: target.y + target.height / 2 + 56 }] });
      await expect(page.locator("[data-jigsaw-ghost]")).toBeVisible();
      expect(await page.evaluate(() => scrollY)).toBe(scroll);
      expect(await page.evaluate(() => getSelection()?.toString())).toBe("");
      await cdp.send("Input.dispatchTouchEvent", { type: cancel ? "touchCancel" : "touchEnd", touchPoints: [] });
      await expect(page.locator('[data-placed="true"]')).toHaveCount(cancel ? 0 : 1);
      await expect(page.locator("[data-jigsaw-ghost]")).toHaveCount(0);
    }
    await page.getByRole("button", { name: "Mảnh 2", exact: true }).tap();
    await page.locator('[data-target="2"]').tap();
    await expect(page.locator('[data-placed="true"]')).toHaveCount(2);
  } finally { await context.close(); }
});
