import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("renders the welcome page with a named heading inside the main landmark", () => {
  render(<Home />);
  expect(screen.getByRole("main")).toContainElement(
    screen.getByRole("heading", { name: "Bibo Play", level: 1 }),
  );
});
