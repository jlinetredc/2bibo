import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import PuzzleGame from "./PuzzleGame";

it("keeps finite pieces, supports recovery and emits one quest completion per round", () => {
  const onComplete = vi.fn();
  render(<PuzzleGame mode="quest" onComplete={onComplete} />);
  fireEvent.click(screen.getByRole("button", { name: "Khối 1, 3 ô" }));
  fireEvent.click(screen.getByRole("button", { name: "Hàng 2, cột 1, trống" }));
  expect(screen.queryByRole("button", { name: "Khối 1, 3 ô" })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Gợi ý" }));
  expect(screen.getByRole("status")).toHaveTextContent("hoàn tác");
  fireEvent.click(screen.getByRole("button", { name: "Hoàn tác" }));
  expect(screen.getByRole("button", { name: "Khối 1, 3 ô" })).toBeVisible();
  function finish() {
    for (const [piece, row, column] of [[1,1,1],[2,2,1],[3,2,2]]) {
      fireEvent.click(screen.getByRole("button", { name: `Khối ${piece}, 3 ô` }));
      fireEvent.click(screen.getByRole("button", { name: new RegExp(`^Hàng ${row}, cột ${column},`) }));
    }
  }
  finish();
  expect(onComplete).toHaveBeenCalledExactlyOnceWith({ puzzleId: "puzzle-1", piecesPlaced: 3 });
  fireEvent.click(screen.getByRole("button", { name: "Hàng 1, cột 1, đã lấp" }));
  expect(onComplete).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Ghép lại" })); finish();
  expect(onComplete).toHaveBeenCalledTimes(2);
});
