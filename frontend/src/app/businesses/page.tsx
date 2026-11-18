import type { Metadata } from "next";

import { BusinessesList } from "@/features/businesses/businesses-list";
import { ShopsHeading } from "@/features/businesses/shops-heading";

export const metadata: Metadata = {
  title: "Shops",
};

export default function BusinessesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <ShopsHeading />
      <div className="mt-8">
        <BusinessesList />
      </div>
    </main>
  );
}
