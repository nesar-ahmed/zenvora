import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FoodCard } from "@/components/food-card";
import type { components } from "@/types/api";

const product: components["schemas"]["ProductFeedItem"] = {
  id: "product-1",
  name: "Margherita Pizza",
  description: "Tomato, mozzarella and basil.",
  category: "Pizza",
  price_cents: 1250,
  business_id: "business-1",
  business_name: "Bella's Kitchen",
  business_slug: "bellas-kitchen",
  business_rating: 4.8,
  business_delivery_fee_cents: 199,
  business_delivery_time_minutes: 25,
  business_city: "Dublin",
  business_country_code: "IE",
};

describe("FoodCard", () => {
  it("shows the dish, shop, delivery information and price", () => {
    render(<FoodCard product={product} />);

    expect(
      screen.getByRole("heading", { level: 3, name: /margherita pizza/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/bella's kitchen/i)).toBeInTheDocument();
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
    expect(screen.getByText(/25 min/)).toBeInTheDocument();
    expect(screen.getByText(/12\.50/)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/businesses/bellas-kitchen",
    );
  });
});
