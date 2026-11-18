"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { apiClient } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import type { components } from "@/types/api";

export type Country = components["schemas"]["CountryResponse"];

export type LocationSelection = {
  countryCode: string;
  countryName: string;
  city: string;
};

export type LocationContextValue = {
  countries: Country[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  selection: LocationSelection | null;
  ready: boolean;
  isPickerOpen: boolean;
  openPicker: () => void;
  closePicker: () => void;
  selectLocation: (selection: LocationSelection) => void;
};

const STORAGE_KEY = "zenvora.location";
const LocationContext = createContext<LocationContextValue | null>(null);

function readStoredSelection(): LocationSelection | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<LocationSelection>;
    if (
      typeof parsed.countryCode === "string" &&
      typeof parsed.countryName === "string" &&
      typeof parsed.city === "string"
    ) {
      return {
        countryCode: parsed.countryCode,
        countryName: parsed.countryName,
        city: parsed.city,
      };
    }
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  return null;
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [selection, setSelection] = useState<LocationSelection | null>(null);
  const [ready, setReady] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const requiresLocation = pathname === "/" || pathname === "/businesses";

  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/api/v1/locations");
      if (error) {
        throw new Error(getApiErrorMessage(error));
      }
      return data ?? [];
    },
    staleTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });

  useEffect(() => {
    async function restoreSelection() {
      setSelection(readStoredSelection());
      setReady(true);
    }

    void restoreSelection();
  }, []);

  const selectLocation = useCallback((next: LocationSelection) => {
    setSelection(next);
    setManualOpen(false);
    setDismissed(false);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const openPicker = useCallback(() => {
    setManualOpen(true);
    setDismissed(false);
  }, []);

  const closePicker = useCallback(() => {
    setManualOpen(false);
    setDismissed(true);
  }, []);

  const value = useMemo(
    () => ({
      countries: data,
      isLoading,
      error: isError ? getApiErrorMessage(error) : null,
      refetch: () => {
        void refetch();
      },
      selection,
      ready,
      isPickerOpen:
        ready &&
        (manualOpen || (requiresLocation && !selection && !dismissed)),
      openPicker,
      closePicker,
      selectLocation,
    }),
    [
      data,
      isLoading,
      isError,
      error,
      refetch,
      selection,
      ready,
      manualOpen,
      requiresLocation,
      dismissed,
      openPicker,
      closePicker,
      selectLocation,
    ],
  );

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error("useLocation must be used inside a LocationProvider.");
  }
  return context;
}
