type ApiErrorPayload = {
  error?: {
    code?: string;
    message?: string;
  };
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (typeof error === "object" && error !== null) {
    const payload = error as ApiErrorPayload;
    if (payload.error?.message) {
      return payload.error.message;
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }
  }

  return fallback;
}
