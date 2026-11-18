import type { Metadata } from "next";

import { HomeFeed } from "@/features/marketplace/home-feed";

export const metadata: Metadata = {
  title: "Food delivery",
};

export default function HomePage() {
  return (
    <main>
      <HomeFeed />
    </main>
  );
}
