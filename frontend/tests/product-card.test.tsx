import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProductCard } from "@/components/product-card";
import type { components } from "@/types/api";

const product: components["schemas"]["ProductResponse"] = {
  id: "product-1",
  business_id: "business-1",
  name: "Margherita Pizza",
  description: "Tomato, mozzarella and basil.",
  category: "Pizza",
  price_cents: 1250,
  is_available: true,
  is_active: true,
  created_at: "2026-11-18T12:00:00Z",
  updated_at: "2026-11-18T12:00:00Z",
};

describe("ProductCard", () => {
  it("shows the product details and formatted price", () => {
    render(<ProductCard product={product} />);

    expect(
      screen.getByRole("heading", { level: 3, name: /margherita pizza/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText(/12\.50/)).toBeInTheDocument();
  });
});
