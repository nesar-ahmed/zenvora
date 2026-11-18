import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "@/app/page";
import { renderWithProviders } from "./test-utils";

describe("HomePage", () => {
  it("renders the food delivery hero and search", () => {
    renderWithProviders(<HomePage />);

    expect(
      screen.getByRole("heading", { level: 1, name: /good food, nearby/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /search food/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /all food/i }),
    ).toBeInTheDocument();
  });
});
