import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import ShapeFillGame from "./ShapeFillGame";

it("reports completion once per round in quest mode, permits replay and resets on target change", () => {
  const onComplete = vi.fn();
  render(<ShapeFillGame mode="quest" onComplete={onComplete} />);
  function fill() {
    for (const button of within(screen.getByRole("group", { name: "Hình Trái tim" })).getAllByRole("button")) fireEvent.click(button);
  }
  fill();
  expect(onComplete).toHaveBeenCalledExactlyOnceWith({ targetId: "heart", filledCells: 16 });
  fireEvent.click(screen.getByRole("button", { name: "Hàng 1, cột 2, đã lấp" }));
  expect(onComplete).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("status")).toHaveTextContent("Tuyệt quá!");
  fireEvent.click(screen.getByRole("button", { name: "Lấp lại" })); fill();
  expect(onComplete).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByRole("button", { name: "Ngôi sao" }));
  expect(screen.getByRole("group", { name: "Hình Ngôi sao" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Hoàn tác" })).toBeDisabled();
});
