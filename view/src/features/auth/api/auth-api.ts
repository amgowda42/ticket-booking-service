import { baseApi } from "@/store/api/base-api";

export type AuthResponse = {
  success: true;
  token: string;
};

export type LogoutResponse = {
  success: true;
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  name: string;
};

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth", "Bookings", "Events"],
    }),
    exchangeGoogleOAuthCode: builder.mutation<AuthResponse, { code: string }>({
      query: (body) => ({
        url: "/auth/oauth/google/exchange",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useExchangeGoogleOAuthCodeMutation,
} = authApi;
