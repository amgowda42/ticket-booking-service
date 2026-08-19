import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { getAccessToken } from "@/lib/auth/session";

export type HealthResponse = { status: string };

/** Shared RTK Query entry point for backend requests. */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001",
    prepareHeaders: (headers) => {
      const token = getAccessToken();
      if (token) headers.set("authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ["Auth", "Bookings", "Events"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponse, void>({
      query: () => "/health",
    }),
  }),
});

export const { useGetHealthQuery } = baseApi;
