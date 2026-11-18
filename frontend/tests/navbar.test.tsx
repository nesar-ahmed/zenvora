import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Navbar } from "@/components/layout/navbar";
import { renderWithProviders } from "./test-utils";

describe("Navbar", () => {
  it("renders the brand, location control and navigation links", () => {
    renderWithProviders(<Navbar />);

    expect(
      screen.getByRole("navigation", { name: /main/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /zenvora/i }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: /^shops$/i }),
    ).toHaveAttribute("href", "/businesses");
    expect(
      screen.getByRole("button", { name: /deliver to/i }),
    ).toBeInTheDocument();
  });

  it("toggles the mobile menu", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />);

    expect(document.querySelector("#mobile-nav")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /open menu/i }));

    expect(document.querySelector("#mobile-nav")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close menu/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
