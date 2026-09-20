import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import JigsawGame from "./JigsawGame";
import { generateThemedPuzzle } from "./data/themePacks";

let failImage = false;
beforeEach(() => {
  failImage = false;
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("Image", class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    set src(_: string) { queueMicrotask(() => failImage ? this.onerror?.() : this.onload?.()); }
  });
});
afterEach(() => vi.unstubAllGlobals());
const puzzle = generateThemedPuzzle({ id: "test", themeId: "animals", pictureId: "animals-fox" });
async function fill() {
  for (let i = 1; i <= 4; i++) {
    fireEvent.click(await screen.findByRole("button", { name: `Mảnh ${i}` }));
    fireEvent.click(screen.getByRole("button", { name: `Ô ${i}` }));
  }
}
it("reveals the complete image, focuses gentle feedback and reports exactly once per replay in quest mode", async () => {
  const done = vi.fn(), choose = vi.fn();
  render(<JigsawGame mode="quest" config={puzzle} onComplete={done} onChoosePicture={choose} />);
  await fill();
  expect(done).toHaveBeenCalledExactlyOnceWith({ puzzleId: "test", pieces: 4 });
  expect(screen.getByRole("heading", { name: "Con làm được rồi!" })).toHaveFocus();
  expect(screen.getByRole("img", { name: puzzle.image.alt })).toBeVisible();
  expect(document.querySelectorAll("[data-placement-burst]")).toHaveLength(4);
  expect(screen.queryByRole("group", { name: "Khay mảnh ghép" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Chọn tranh khác" }));
  expect(choose).toHaveBeenCalledOnce();
  expect(done).toHaveBeenCalledOnce();
  fireEvent.click(screen.getByRole("button", { name: "Ghép lại" }));
  expect(document.querySelectorAll("[data-placement-burst]")).toHaveLength(0);
  await fill();
  expect(done).toHaveBeenCalledTimes(2);
});
it("rejects a wrong target without consuming a piece and commits legal tap placement", async () => {
  render(<JigsawGame mode="standalone" config={puzzle} />);
  fireEvent.click(await screen.findByRole("button", { name: "Mảnh 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Ô 2" }));
  expect(screen.getByRole("status")).toHaveTextContent("Thử lại nhé!");
  expect(document.querySelectorAll("[data-placement-burst]")).toHaveLength(0);
  expect(screen.getByRole("button", { name: "Mảnh 1" })).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Ô 1" }));
  expect(screen.getByRole("button", { name: "Ô 1, đã ghép" })).toBeDisabled();
  expect(screen.queryByRole("button", { name: "Mảnh 1" })).not.toBeInTheDocument();
  expect(document.querySelectorAll("[data-placement-burst]")).toHaveLength(1);
  await waitFor(() => expect(document.querySelectorAll("[data-placement-burst]")).toHaveLength(0), { timeout: 1500 });
});
it("provides image-load recovery before exposing empty draggable pieces", async () => {
  failImage = true;
  render(<JigsawGame mode="standalone" config={puzzle} />);
  const retry = await screen.findByRole("button", { name: "Mở lại tranh" });
  expect(screen.queryByRole("group")).not.toBeInTheDocument();
  failImage = false;
  fireEvent.click(retry);
  await waitFor(() => expect(screen.getByRole("button", { name: "Mảnh 1" })).toBeVisible());
});
