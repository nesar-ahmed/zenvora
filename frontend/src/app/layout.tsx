import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Zenvora — Local commerce, delivered",
    template: "%s | Zenvora",
  },
  description:
    "Discover local restaurants, grocery stores and retailers, order online and follow every delivery in one place.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
