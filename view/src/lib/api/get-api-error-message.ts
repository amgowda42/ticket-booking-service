type ApiErrorPayload = {
  data?: { message?: string; errors?: Record<string, string[]> };
  error?: string;
};

export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiErrorPayload;
    return apiError.data?.message ?? apiError.error ?? "Something went wrong. Please try again.";
  }

  return "Something went wrong. Please try again.";
}

export function getApiFieldErrors(error: unknown): Record<string, string[]> {
  if (typeof error === "object" && error !== null) {
    return (error as ApiErrorPayload).data?.errors ?? {};
  }
  return {};
}
