export type ProductVisual = {
  emoji: string;
  gradient: string;
};

const visuals: Record<string, ProductVisual> = {
  Pizza: { emoji: "🍕", gradient: "from-orange-100 to-amber-50" },
  Burgers: { emoji: "🍔", gradient: "from-amber-100 to-yellow-50" },
  Salads: { emoji: "🥗", gradient: "from-emerald-100 to-lime-50" },
  Desserts: { emoji: "🍰", gradient: "from-rose-100 to-pink-50" },
  Produce: { emoji: "🍌", gradient: "from-yellow-100 to-lime-50" },
  Bakery: { emoji: "🥐", gradient: "from-amber-100 to-orange-50" },
  Dairy: { emoji: "🥚", gradient: "from-yellow-100 to-amber-50" },
  Homeware: { emoji: "☕", gradient: "from-stone-100 to-amber-50" },
  Stationery: { emoji: "📓", gradient: "from-sky-100 to-indigo-50" },
  Indian: { emoji: "🍛", gradient: "from-orange-100 to-red-50" },
  Sides: { emoji: "🍟", gradient: "from-yellow-100 to-orange-50" },
  Drinks: { emoji: "🥤", gradient: "from-cyan-100 to-sky-50" },
  Healthy: { emoji: "🥑", gradient: "from-lime-100 to-emerald-50" },
  Breakfast: { emoji: "🍳", gradient: "from-yellow-100 to-orange-50" },
  Grill: { emoji: "🍤", gradient: "from-sky-100 to-blue-50" },
  Cafe: { emoji: "☕", gradient: "from-amber-100 to-stone-50" },
  Curry: { emoji: "🍛", gradient: "from-orange-100 to-rose-50" },
  Noodles: { emoji: "🍜", gradient: "from-red-100 to-orange-50" },
  Doner: { emoji: "🌯", gradient: "from-orange-100 to-yellow-50" },
};

const fallback: ProductVisual = {
  emoji: "🍽️",
  gradient: "from-slate-100 to-slate-50",
};

export function getProductVisual(category: string): ProductVisual {
  return visuals[category] ?? fallback;
}

export function getBusinessVisual(category: string): ProductVisual {
  switch (category) {
    case "grocery":
      return { emoji: "🥬", gradient: "from-lime-100 to-emerald-50" };
    case "retail":
      return { emoji: "🛍️", gradient: "from-sky-100 to-indigo-50" };
    default:
      return { emoji: "🍽️", gradient: "from-orange-100 to-amber-50" };
  }
}
