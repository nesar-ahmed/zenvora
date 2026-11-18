import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BusinessCard } from "@/components/business-card";
import type { components } from "@/types/api";

const business: components["schemas"]["BusinessSummary"] = {
  id: "business-1",
  name: "Bella's Kitchen",
  slug: "bellas-kitchen",
  description: "Neighbourhood comfort food.",
  category: "restaurant",
  address: "12 Market Street",
  phone: null,
  email: null,
  country_code: "IE",
  country_name: "Ireland",
  city: "Dublin",
  rating: 4.8,
  delivery_fee_cents: 199,
  delivery_time_minutes: 25,
  created_at: "2026-11-18T12:00:00Z",
};

describe("BusinessCard", () => {
  it("links to the business and shows its key details", () => {
    render(<BusinessCard business={business} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/businesses/bellas-kitchen");
    expect(
      screen.getByRole("heading", { level: 2, name: /bella's kitchen/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Restaurant")).toBeInTheDocument();
    expect(screen.getByText(/4\.8/)).toBeInTheDocument();
    expect(screen.getByText("Dublin")).toBeInTheDocument();
  });
});
