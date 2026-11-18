import Link from "next/link";
import { Clock3, Star } from "lucide-react";

import {
  formatDeliveryFee,
  formatDeliveryTime,
  formatLabel,
  formatPrice,
  formatRating,
} from "@/lib/format";
import { getProductVisual } from "@/lib/product-visuals";
import type { components } from "@/types/api";

type ProductFeedItem = components["schemas"]["ProductFeedItem"];

export function FoodCard({ product }: { product: ProductFeedItem }) {
  const visual = getProductVisual(product.category);

  return (
    <article className="group overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/businesses/${product.business_slug}`} className="block">
        <div
          className={`relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br ${visual.gradient}`}
        >
          <span className="text-6xl drop-shadow-sm" aria-hidden="true">
            {visual.emoji}
          </span>
          <span className="absolute top-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur">
            {formatLabel(product.category)}
          </span>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="leading-snug font-semibold">{product.name}</h3>
            <span className="shrink-0 font-semibold">
              {formatPrice(product.price_cents)}
            </span>
          </div>

          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {product.description}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {formatRating(product.business_rating)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock3 className="size-3.5" />
              {formatDeliveryTime(product.business_delivery_time_minutes)}
            </span>
            <span>{formatDeliveryFee(product.business_delivery_fee_cents)}</span>
          </div>

          <p className="mt-3 truncate text-xs font-medium text-primary">
            {product.business_name} · {product.business_city}
          </p>
        </div>
      </Link>
    </article>
  );
}
