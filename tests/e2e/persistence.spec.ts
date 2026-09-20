import { expect, test } from "@playwright/test";

test("both stores survive reload, migrate, reject newer data, and remove entries", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/persistence.html");
  await expect(page.locator("#status")).toHaveText("ready");
  await page.evaluate(async () => {
    const { local, large } = window.persistenceFixture;
    await local.set("saved", { text: "preference" });
    await large.set("saved", { text: "creation", bytes: new Uint8Array([1, 2, 255]).buffer });
  });
  await page.reload();
  await expect(page.locator("#status")).toHaveText("ready");
  expect(await page.evaluate(async () => {
    const { local, large } = window.persistenceFixture;
    const value = await large.get("saved");
    return { small: await local.get("saved"), large: value?.text, bytes: Array.from(new Uint8Array(value!.bytes!)) };
  })).toEqual({ small: { text: "preference" }, large: "creation", bytes: [1, 2, 255] });
  expect(await page.evaluate(async () => {
    const { local, large, localRaw, largeRaw } = window.persistenceFixture;
    const result = [];
    for (const [store, raw] of [[local, localRaw], [large, largeRaw]] as const) {
      await raw.set("old", { version: 1, data: "old value" });
      result.push(await store.get("old"));
      await raw.set("future", { version: 99, data: "future value" });
      try { await store.get("future"); } catch (error) { result.push((error as { code: string }).code); }
      result.push(await raw.get("future"));
      await store.remove("saved");
      result.push(await store.get("saved"));
    }
    return result;
  })).toEqual(Array(2).fill([{ text: "old value" }, "version", { version: 99, data: "future value" }, null]).flat());
});

test("IndexedDB rejects uncloneable writes and remains usable", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/persistence.html");
  await expect(page.locator("#status")).toHaveText("ready");
  expect(await page.evaluate(async () => {
    const { largeRaw } = window.persistenceFixture;
    await largeRaw.set("one", { kept: true });
    let code = "";
    try { await largeRaw.set("one", { notCloneable: () => 1 }); } catch (error) { code = (error as { code: string }).code; }
    return { code, value: await largeRaw.get("one") };
  })).toEqual({ code: "storage", value: { kept: true } });
});

test("audio mute survives reload through shared local preferences", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/audio.html");
  const mute = page.getByRole("button", { name: "Tắt âm thanh" });
  await mute.click();
  await expect(page.getByTestId("storage")).toHaveText("saved");
  await page.reload();
  await expect(mute).toHaveAttribute("aria-pressed", "true");
  await mute.click();
  await expect(page.getByTestId("storage")).toHaveText("saved");
  await page.reload();
  await expect(mute).toHaveAttribute("aria-pressed", "false");
});

test("Blob writes either round-trip or report an unsupported backend without data loss", async ({ page, browserName }) => {
  await page.goto("http://127.0.0.1:3101/persistence.html");
  await expect(page.locator("#status")).toHaveText("ready");
  const result = await page.evaluate(async () => {
    const store = window.persistenceFixture.largeRaw;
    await store.set("blob", "previous");
    try {
      await store.set("blob", new Blob(["creation"]));
      return { text: await (await store.get("blob") as Blob).text() };
    } catch (error) {
      return { code: (error as { code: string }).code, previous: await store.get("blob"), cause: ((error as Error).cause as Error)?.name };
    }
  });
  if (browserName === "webkit" && "code" in result) {
    expect(result).toEqual({ code: "storage", previous: "previous", cause: "UnknownError" });
  } else expect(result).toEqual({ text: "creation" });
});

test("does not report success for a request whose transaction later aborts", async ({ page }) => {
  await page.goto("http://127.0.0.1:3101/persistence.html");
  await expect(page.locator("#status")).toHaveText("ready");
  expect(await page.evaluate(async () => {
    const store = window.persistenceFixture.largeRaw;
    await store.set("atomic", "before");
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function (...args) {
      const request = original.apply(this, args);
      request.addEventListener("success", () => this.transaction.abort());
      return request;
    };
    let code = "";
    try { await store.set("atomic", "after"); } catch (error) { code = (error as { code: string }).code; }
    finally { IDBObjectStore.prototype.put = original; }
    return { code, value: await store.get("atomic") };
  })).toEqual({ code: "storage", value: "before" });
});
