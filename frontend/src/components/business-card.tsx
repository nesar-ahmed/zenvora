import Link from "next/link";
import { ArrowRight, Clock3, MapPin, Star } from "lucide-react";

import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatLabel,
  formatRating,
} from "@/lib/format";
import { getBusinessVisual } from "@/lib/product-visuals";
import type { components } from "@/types/api";

type Business = components["schemas"]["BusinessSummary"];

export function BusinessCard({ business }: { business: Business }) {
  const visual = getBusinessVisual(business.category);

  return (
    <Link
      href={`/businesses/${business.slug}`}
      className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div
        className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${visual.gradient}`}
      >
        <span className="text-5xl drop-shadow-sm" aria-hidden="true">
          {visual.emoji}
        </span>
        <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
          {formatLabel(business.category)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-snug">
            {business.name}
          </h2>
          <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium">
            <Star className="size-4 fill-amber-400 text-amber-400" />
            {formatRating(business.rating)}
          </span>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {business.description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" />
            {formatDeliveryTime(business.delivery_time_minutes)}
          </span>
          <span>{formatDeliveryFee(business.delivery_fee_cents)}</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {business.city}
          </span>
        </div>

        <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary">
          View menu
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
