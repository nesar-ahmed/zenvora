"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
} from "lucide-react";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatLabel,
  formatRating,
} from "@/lib/format";
import { getBusinessVisual } from "@/lib/product-visuals";

export function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["business", slug],
    enabled: Boolean(slug),
    queryFn: async () => {
      const [businessResult, productsResult] = await Promise.all([
        apiClient.GET("/api/v1/businesses/{slug}", {
          params: { path: { slug } },
        }),
        apiClient.GET("/api/v1/businesses/{slug}/products", {
          params: { path: { slug } },
        }),
      ]);

      if (businessResult.error) {
        throw new Error(getApiErrorMessage(businessResult.error));
      }

      if (productsResult.error) {
        throw new Error(getApiErrorMessage(productsResult.error));
      }

      return {
        business: businessResult.data,
        products: productsResult.data ?? [],
      };
    },
  });

  if (isLoading) {
    return <div className="h-96 animate-pulse rounded-2xl border bg-muted/40" />;
  }

  if (isError || !data?.business) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <h1 className="text-xl font-semibold">Business not available</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {getApiErrorMessage(error, "This business could not be found.")}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
          <Button asChild>
            <Link href="/businesses">Browse shops</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { business, products } = data;
  const visual = getBusinessVisual(business.category);

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/businesses"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All shops
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border bg-card">
        <div
          className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${visual.gradient}`}
        >
          <span className="text-7xl drop-shadow-sm" aria-hidden="true">
            {visual.emoji}
          </span>
          <span className="absolute top-4 left-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            {formatLabel(business.category)}
          </span>
          <span className="absolute top-4 right-4 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
            {business.city}, {business.country_name}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                {business.name}
              </h1>
              <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
                {business.description}
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {formatRating(business.rating)}
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              <Clock3 className="size-3.5 text-muted-foreground" />
              {formatDeliveryTime(business.delivery_time_minutes)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              {formatDeliveryFee(business.delivery_fee_cents)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5">
              <MapPin className="size-3.5 text-muted-foreground" />
              {business.address}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {business.phone ? (
              <a
                href={`tel:${business.phone}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Phone className="size-4" />
                {business.phone}
              </a>
            ) : null}
            {business.email ? (
              <a
                href={`mailto:${business.email}`}
                className="inline-flex items-center gap-2 hover:text-foreground"
              >
                <Mail className="size-4" />
                {business.email}
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              Menu
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">
              Available now
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? "item" : "items"}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="mt-6 rounded-2xl border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto size-8 text-muted-foreground" />
            <h3 className="mt-3 font-semibold">No products available</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              This shop has not listed any available products yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
