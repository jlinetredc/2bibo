import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CountingGame } from "./CountingGame";

afterEach(cleanup);
const config = { id: "test", target: 2, instruction: "Đặt hai hình vào ô.", destinationLabel: "Ô đếm",
  items: [1, 2, 3].map((i) => ({ id: `item-${i}`, label: `Hình ${i}`, symbol: "●" })) };
it.each(["standalone", "quest"] as const)("supports tap retry, removal, single completion and replay in %s", (mode) => {
  const onComplete = vi.fn();
  render(<CountingGame mode={mode} config={config} onComplete={onComplete} />);
  fireEvent.click(screen.getByText("Xong rồi")); expect(screen.getByRole("status")).toHaveTextContent("Gần đúng rồi!");
  for (let i = 1; i <= 3; i++) fireEvent.click(screen.getByRole("button", { name: `Đặt vào: Hình ${i}` }));
  fireEvent.click(screen.getByText("Xong rồi")); expect(onComplete).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Lấy ra: Hình 3" }));
  fireEvent.click(screen.getByText("Xong rồi")); fireEvent.click(screen.getByText("Xong rồi"));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete).toHaveBeenLastCalledWith({ id: "test", count: 2, placedIds: ["item-1", "item-2"] });
  expect(screen.getByRole("status")).toHaveTextContent("Con làm được rồi!");
  fireEvent.click(screen.getByText("Chơi lại"));
  expect(screen.getByLabelText("Số vật đã đặt")).toHaveTextContent("Đã đặt: 0");
  for (let i = 1; i <= 2; i++) fireEvent.click(screen.getByRole("button", { name: `Đặt vào: Hình ${i}` }));
  fireEvent.click(screen.getByText("Xong rồi")); expect(onComplete).toHaveBeenCalledTimes(2);
});
it("starts fresh for a new definition ID without emitting completion", () => {
  const complete = vi.fn();
  const view = render(<CountingGame mode="standalone" config={config} onComplete={complete} />);
  fireEvent.click(screen.getByRole("button", { name: "Đặt vào: Hình 1" }));
  view.rerender(<CountingGame mode="standalone" config={{ ...config, id: "other" }} onComplete={complete} />);
  expect(screen.getByLabelText("Số vật đã đặt")).toHaveTextContent("Đã đặt: 0"); expect(complete).not.toHaveBeenCalled();
});
