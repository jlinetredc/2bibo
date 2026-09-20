import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { GameShell } from "./GameShell";

it("renders a named game region and delegates back/restart without submitting a form", () => {
  const onBack = vi.fn();
  const onRestart = vi.fn();
  const onSubmit = vi.fn();
  render(<form onSubmit={onSubmit}>
    <GameShell title="Trò chơi" muted={false} onMutedChange={vi.fn()} onBack={onBack} onRestart={onRestart}>
      <p>Nội dung game</p>
    </GameShell>
  </form>);
  expect(screen.getByRole("region", { name: "Trò chơi" })).toContainElement(screen.getByText("Nội dung game"));
  fireEvent.click(screen.getByRole("button", { name: "Quay lại" }));
  fireEvent.click(screen.getByRole("button", { name: "Chơi lại" }));
  expect(onBack).toHaveBeenCalledTimes(1);
  expect(onRestart).toHaveBeenCalledTimes(1);
  expect(onSubmit).not.toHaveBeenCalled();
});

it("requests mute changes and reflects the host's state", () => {
  const props = { title: "Game", onBack: vi.fn(), onRestart: vi.fn(), onMutedChange: vi.fn(), children: null };
  const { rerender } = render(<GameShell {...props} muted={false} />);
  const button = screen.getByRole("button", { name: "Tắt âm thanh" });
  fireEvent.click(button);
  expect(props.onMutedChange).toHaveBeenLastCalledWith(true);
  expect(button).toHaveAttribute("aria-pressed", "false");
  rerender(<GameShell {...props} muted />);
  expect(button).toHaveAttribute("aria-pressed", "true");
  fireEvent.click(button);
  expect(props.onMutedChange).toHaveBeenLastCalledWith(false);
});
