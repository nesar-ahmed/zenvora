import createClient from "openapi-fetch";

import type { paths } from "@/types/api";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
});

export function authHeaders(token: string | null): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}
