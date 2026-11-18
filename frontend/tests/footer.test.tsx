import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Footer } from "@/components/layout/footer";

describe("Footer", () => {
  it("renders the footer content and links", () => {
    render(<Footer />);

    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(
      screen.getByText(/built locally for local commerce/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /^shops$/i }),
    ).toHaveAttribute("href", "/businesses");
    expect(
      screen.getByRole("link", { name: /my account/i }),
    ).toHaveAttribute("href", "/account");
  });
});
