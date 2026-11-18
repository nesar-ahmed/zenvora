"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/features/auth/auth-provider";
import { LocationPicker } from "@/features/locations/location-picker";
import { LocationProvider } from "@/features/locations/location-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <AuthProvider>{children}</AuthProvider>
        <LocationPicker />
      </LocationProvider>
    </QueryClientProvider>
  );
}
