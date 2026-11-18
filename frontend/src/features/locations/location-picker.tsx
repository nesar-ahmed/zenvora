"use client";

import { useState } from "react";
import { MapPin, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocation } from "@/features/locations/location-provider";

export function LocationPicker() {
  const {
    countries,
    isLoading,
    error,
    refetch,
    selection,
    isPickerOpen,
    closePicker,
    selectLocation,
  } = useLocation();

  const [countryCode, setCountryCode] = useState(selection?.countryCode ?? "");
  const [city, setCity] = useState(selection?.city ?? "");

  if (!isPickerOpen) {
    return null;
  }

  const activeCountry =
    countries.find((country) => country.code === countryCode) ?? countries[0];
  const activeCity =
    activeCountry && activeCountry.cities.includes(city)
      ? city
      : (activeCountry?.cities[0] ?? "");

  function handleCountryChange(nextCode: string) {
    setCountryCode(nextCode);
    const nextCountry = countries.find((country) => country.code === nextCode);
    setCity(nextCountry?.cities[0] ?? "");
  }

  function handleConfirm() {
    if (!activeCountry || !activeCity) return;
    selectLocation({
      countryCode: activeCountry.code,
      countryName: activeCountry.name,
      city: activeCity,
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-picker-title"
        className="w-full max-w-md rounded-2xl border bg-background p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground">
              <MapPin className="size-5" />
            </span>
            <div>
              <h2
                id="location-picker-title"
                className="text-lg font-semibold tracking-tight"
              >
                Choose your delivery area
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                We will show food and shops available in your city.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close location picker"
            onClick={closePicker}
          >
            <X />
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-3">
            <div className="h-10 animate-pulse rounded-md bg-muted" />
            <div className="h-10 animate-pulse rounded-md bg-muted" />
          </div>
        ) : error ? (
          <div className="mt-6 rounded-lg bg-destructive/5 p-4 text-sm">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-3" onClick={refetch}>
              Try again
            </Button>
          </div>
        ) : countries.length === 0 ? (
          <p className="mt-6 rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            No delivery locations are seeded yet. Run the backend seed command.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="country"
                className="text-sm font-medium"
              >
                Country
              </label>
              <select
                id="country"
                value={activeCountry?.code ?? ""}
                onChange={(event) => handleCountryChange(event.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="city" className="text-sm font-medium">
                City
              </label>
              <select
                id="city"
                value={activeCity}
                onChange={(event) => setCity(event.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
              >
                {activeCountry?.cities.map((availableCity) => (
                  <option key={availableCity} value={availableCity}>
                    {availableCity}
                  </option>
                ))}
              </select>
            </div>

            <Button className="w-full" onClick={handleConfirm}>
              Show food in {activeCity || "this city"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
