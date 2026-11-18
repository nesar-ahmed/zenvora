"use client";

import { useLocation } from "@/features/locations/location-provider";

export function ShopsHeading() {
  const { selection, openPicker } = useLocation();

  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-sm font-semibold tracking-widest text-primary uppercase">
        Shops
      </p>
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {selection ? `Shops delivering in ${selection.city}` : "Shops near you"}
      </h1>
      <p className="text-muted-foreground">
        Explore restaurants, cafés, grocery stores and local retailers in your
        selected delivery area.{" "}
        <button
          type="button"
          onClick={openPicker}
          className="font-medium text-primary hover:underline"
        >
          Change location
        </button>
      </p>
    </div>
  );
}
