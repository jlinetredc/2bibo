import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CountingAdventure from "./CountingAdventure";
afterEach(cleanup);
it("switches scenarios cleanly and shell restart keeps the chosen scenario", () => {
  const view = render(<CountingAdventure mode="standalone" />);
  fireEvent.click(screen.getByRole("button", { name: "Đặt vào: Cà rốt 1" }));
  fireEvent.click(screen.getByRole("button", { name: "Táo vào giỏ" }));
  expect(screen.getByLabelText("Số vật đã đặt")).toHaveTextContent("Đã đặt: 0");
  fireEvent.click(screen.getByRole("button", { name: "Đặt vào: Táo 1" }));
  view.rerender(<CountingAdventure mode="standalone" restartKey={1} />);
  expect(screen.getByLabelText("Số vật đã đặt")).toHaveTextContent("Đã đặt: 0");
  expect(screen.getByRole("button", { name: "Táo vào giỏ" })).toHaveAttribute("aria-pressed", "true");
});
it("quest hosting uses selected data and reports one completion without a scenario chooser", () => {
  const onComplete = vi.fn();
  render(<CountingAdventure mode="quest" config={{ scenarioId: "collect-objects" }} onComplete={onComplete} />);
  expect(screen.queryByRole("group", { name: "Chọn hoạt động" })).not.toBeInTheDocument();
  for (let i = 1; i <= 3; i++) fireEvent.click(screen.getByRole("button", { name: `Đặt vào: Vỏ sò ${i}` }));
  fireEvent.click(screen.getByText("Xong rồi")); fireEvent.click(screen.getByText("Xong rồi"));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(onComplete.mock.calls[0][0]).toMatchObject({ id: "collect-objects-3", count: 3 });
});

it("offers varying new rounds before and after completion while retaining the activity", () => {
  render(<CountingAdventure mode="standalone" />);
  const observed: string[] = [];
  for (let round = 0; round < 6; round++) {
    observed.push(screen.getByRole("heading", { level: 2 }).textContent!);
    expect(screen.getByLabelText("Số vật đã đặt")).toHaveTextContent("Đã đặt: 0");
    fireEvent.click(screen.getByRole("button", { name: "Lượt mới" }));
  }
  expect(new Set(observed).size).toBe(5);
  expect(screen.getByRole("button", { name: "Cho thỏ ăn" })).toHaveAttribute("aria-pressed", "true");
});

it("keeps the completed scene until the child chooses to continue", () => {
  render(<CountingAdventure mode="standalone" />);
  for (let i = 1; i <= 3; i++) fireEvent.click(screen.getByRole("button", { name: `Đặt vào: Cà rốt ${i}` }));
  fireEvent.click(screen.getByRole("button", { name: "Xong rồi" }));
  expect(screen.getByRole("status")).toHaveTextContent("Con làm được rồi!");
  expect(screen.getByRole("button", { name: "Lấy ra: Cà rốt 1" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Chơi tiếp" }));
  expect(screen.getByLabelText("Số vật đã đặt")).toHaveTextContent("Đã đặt: 0");
  expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Cho thỏ 4 củ cà rốt.");
  expect(screen.getByRole("status")).toBeEmptyDOMElement();
});
