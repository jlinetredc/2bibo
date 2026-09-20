import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { createGameRegistry } from "../../game-core/registry";
import { GameGrid } from "./GameGrid";

it("derives cards and order from registry metadata without loading games", () => {
  const load = vi.fn();
  const registry = createGameRegistry([
    { id: "fixture-b", name: "Thẻ B", icon: "🌻", category: "puzzle", minAge: 3, load },
    { id: "fixture-a", name: "Thẻ A", category: "puzzle", minAge: 3, load },
  ]);
  render(<GameGrid games={registry.list()} />);
  expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(["🌻Thẻ B", "🎲Thẻ A"]);
  expect(screen.getByRole("link", { name: "Thẻ B" })).toHaveAttribute("href", "/play/fixture-b");
  expect(load).not.toHaveBeenCalled();
});

it("shows an honest empty state with no pretend game links", () => {
  render(<GameGrid games={createGameRegistry([]).list()} />);
  expect(screen.getByText("Hiện chưa có trò chơi để chọn.")).toBeVisible();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

it("updates cards when the supplied catalogue changes and encodes route segments", () => {
  const { rerender } = render(<GameGrid games={[{ id: "a/b?", name: "Tên dài" }]} />);
  expect(screen.getByRole("link")).toHaveAttribute("href", "/play/a%2Fb%3F");
  rerender(<GameGrid games={[]} />);
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
});

