import { formatLabel, formatPrice } from "@/lib/format";
import { getProductVisual } from "@/lib/product-visuals";
import type { components } from "@/types/api";

type Product = components["schemas"]["ProductResponse"];

export function ProductCard({ product }: { product: Product }) {
  const visual = getProductVisual(product.category);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <div
        className={`flex h-32 items-center justify-center bg-gradient-to-br ${visual.gradient}`}
      >
        <span className="text-4xl" aria-hidden="true">
          {visual.emoji}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className="text-xs font-medium tracking-wide text-primary uppercase">
          {formatLabel(product.category)}
        </span>
        <h3 className="mt-2 font-semibold">{product.name}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <p className="mt-auto pt-4 text-lg font-semibold">
          {formatPrice(product.price_cents)}
        </p>
      </div>
    </article>
  );
}
