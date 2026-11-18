import type { Metadata } from "next";

import { BusinessDetail } from "@/features/businesses/business-detail";

export const metadata: Metadata = {
  title: "Business",
};

export default function BusinessPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <BusinessDetail />
    </main>
  );
}
