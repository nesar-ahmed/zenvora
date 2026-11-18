const currencyFormatter = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
});

export function formatPrice(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

export function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replaceAll("_", " ");
}

export function formatDeliveryFee(cents: number): string {
  return cents === 0 ? "Free delivery" : `${formatPrice(cents)} delivery`;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDeliveryTime(minutes: number): string {
  return `${minutes} min`;
}
