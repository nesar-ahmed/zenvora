"use client";

import { useQuery } from "@tanstack/react-query";
import { Store } from "lucide-react";

import { BusinessCard } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/features/locations/location-provider";
import { apiClient } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";

export function BusinessesList() {
  const { selection } = useLocation();
  const location = selection;

  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["businesses", location?.countryCode, location?.city],
    enabled: Boolean(location),
    queryFn: async () => {
      if (!location) return [];
      const { data, error } = await apiClient.GET("/api/v1/businesses", {
        params: {
          query: {
            country_code: location.countryCode,
            city: location.city,
            limit: 50,
          },
        },
      });

      if (error) {
        throw new Error(getApiErrorMessage(error));
      }

      return data ?? [];
    },
  });

  return (
    <div className="space-y-8">
      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-72 animate-pulse rounded-2xl border bg-muted/40"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <h2 className="font-semibold">Could not load shops</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {getApiErrorMessage(error)}
          </p>
          <Button className="mt-4" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Store className="mx-auto size-8 text-muted-foreground" />
          <h2 className="mt-3 font-semibold">No shops here yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try another city or check back soon.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {data.length} {data.length === 1 ? "shop" : "shops"} in{" "}
            {location?.city}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
