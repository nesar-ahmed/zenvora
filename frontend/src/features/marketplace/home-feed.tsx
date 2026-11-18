"use client";

import { useDeferredValue, useState } from "react";
import { MapPin, Search, SlidersHorizontal, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { FoodCard } from "@/components/food-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "@/features/locations/location-provider";
import { apiClient } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { getProductVisual } from "@/lib/product-visuals";
import type { components } from "@/types/api";

type ProductSort = components["schemas"]["ProductSort"];

const sortOptions: { value: ProductSort; label: string }[] = [
  { value: "recommended", label: "Recommended" },
  { value: "rating_desc", label: "Top rated" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

const priceBands = [
  { value: "any", label: "Any price" },
  { value: "under10", label: "Up to €10", maxPrice: 1000 },
  { value: "10to20", label: "€10 – €20", minPrice: 1000, maxPrice: 2000 },
  { value: "over20", label: "Over €20", minPrice: 2000 },
] as const;

type PriceBandValue = (typeof priceBands)[number]["value"];

export function HomeFeed() {
  const { selection, openPicker } = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<ProductSort>("recommended");
  const [priceBand, setPriceBand] = useState<PriceBandValue>("any");
  const deferredSearch = useDeferredValue(search);
  const location = selection;

  const categoriesQuery = useQuery({
    queryKey: [
      "product-categories",
      location?.countryCode,
      location?.city,
    ],
    enabled: Boolean(location),
    queryFn: async () => {
      if (!location) return [];
      const { data, error } = await apiClient.GET(
        "/api/v1/products/categories",
        {
          params: {
            query: {
              country_code: location.countryCode,
              city: location.city,
            },
          },
        },
      );
      if (error) {
        throw new Error(getApiErrorMessage(error));
      }
      return data ?? [];
    },
  });

  const productsQuery = useQuery({
    queryKey: [
      "products",
      location?.countryCode,
      location?.city,
      category,
      sort,
      priceBand,
      deferredSearch,
    ],
    enabled: Boolean(location),
    queryFn: async () => {
      if (!location) return [];

      const band =
        priceBands.find((item) => item.value === priceBand) ?? priceBands[0];
      const query: {
        country_code: string;
        city: string;
        limit: number;
        sort: ProductSort;
        category?: string;
        q?: string;
        min_price?: number;
        max_price?: number;
      } = {
        country_code: location.countryCode,
        city: location.city,
        limit: 60,
        sort,
      };

      if (category !== "all") query.category = category;
      if (deferredSearch.trim()) query.q = deferredSearch.trim();
      if ("minPrice" in band) query.min_price = band.minPrice;
      if ("maxPrice" in band) query.max_price = band.maxPrice;

      const { data, error } = await apiClient.GET("/api/v1/products", {
        params: { query },
      });
      if (error) {
        throw new Error(getApiErrorMessage(error));
      }
      return data ?? [];
    },
  });

  const products = productsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const activeFilters =
    search.trim().length > 0 ||
    category !== "all" ||
    sort !== "recommended" ||
    priceBand !== "any";

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setSort("recommended");
    setPriceBand("any");
  }

  return (
    <div>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-20 size-80 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 size-96 rounded-full bg-black/10 blur-3xl"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium tracking-wide text-primary-foreground/75 uppercase">
              {location
                ? `${location.city}, ${location.countryName}`
                : "Local food delivery"}
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              {location
                ? `Good food, delivered in ${location.city}.`
                : "Good food, nearby."}
            </h1>
            <p className="mt-4 max-w-xl text-primary-foreground/80">
              Discover dishes from local restaurants, cafés and food shops and
              have them delivered to your door.
            </p>
          </div>

          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search dishes, shops or cravings..."
                aria-label="Search food"
                className="h-14 rounded-xl border-0 bg-background pr-12 pl-12 text-base text-foreground shadow-xl"
              />
              {search ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            {!location ? (
              <Button
                variant="secondary"
                className="mt-4"
                onClick={openPicker}
              >
                <MapPin />
                Choose delivery location
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="-mx-1 flex gap-2 overflow-x-auto py-4">
            <Button
              type="button"
              size="sm"
              variant={category === "all" ? "default" : "outline"}
              className="shrink-0 rounded-full"
              onClick={() => setCategory("all")}
            >
              All food
            </Button>
            {categories.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={category === item ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => setCategory(item)}
              >
                <span aria-hidden="true">{getProductVisual(item).emoji}</span>
                {item}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {category === "all" ? "All food" : category}
              {location ? ` in ${location.city}` : ""}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {productsQuery.isLoading
                ? "Finding something tasty..."
                : `${products.length} ${
                    products.length === 1 ? "dish" : "dishes"
                  } available`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 text-sm">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value as ProductSort)
                }
                aria-label="Sort food"
                className="h-10 bg-transparent pr-1 text-sm focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={priceBand}
              onChange={(event) =>
                setPriceBand(event.target.value as PriceBandValue)
              }
              aria-label="Filter by price"
              className="h-10 rounded-md border bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none"
            >
              {priceBands.map((band) => (
                <option key={band.value} value={band.value}>
                  {band.label}
                </option>
              ))}
            </select>

            {activeFilters ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            ) : null}
          </div>
        </div>

        {productsQuery.isLoading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl border bg-muted/40"
              />
            ))}
          </div>
        ) : productsQuery.isError ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center">
            <h3 className="font-semibold">Could not load food</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {getApiErrorMessage(productsQuery.error)}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => productsQuery.refetch()}
            >
              Try again
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-card p-10 text-center">
            <span className="text-4xl" aria-hidden="true">
              🍽️
            </span>
            <h3 className="mt-3 font-semibold">No dishes match yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search, category or price range.
            </p>
            {activeFilters ? (
              <Button className="mt-4" variant="outline" onClick={resetFilters}>
                Clear filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <FoodCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
