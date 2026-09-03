const ACCESS_TOKEN_KEY = "ticket-booking.access-token";
let cachedToken: string | null | undefined;
let cachedSession: Session | null = null;

export type Session = {
  userId: string;
  email: string;
  name: string;
  role: "user" | "admin";
  expiresAt: number;
};

type JwtClaims = {
  sub?: string;
  email?: string;
  name?: string;
  role?: "user" | "admin";
  exp?: number;
};

/** Browser-only token store. The API currently returns a bearer token in JSON. */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveAccessToken(token: string): void {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  cachedToken = undefined;
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  cachedToken = undefined;
}

/** Reads non-sensitive display/route claims. The API still authorizes every request. */
export function getSession(): Session | null {
  const token = getAccessToken();
  if (token === cachedToken) return cachedSession;

  cachedToken = token;
  cachedSession = null;
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const claims = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as JwtClaims;
    if (
      !claims.sub ||
      !claims.email ||
      !claims.exp ||
      (claims.role !== "user" && claims.role !== "admin")
    )
      return null;
    if (claims.exp * 1000 <= Date.now()) {
      clearAccessToken();
      return null;
    }
    cachedSession = {
      userId: claims.sub,
      email: claims.email,
      name: claims.name?.trim() || claims.email.split("@")[0],
      role: claims.role,
      expiresAt: claims.exp * 1000,
    };
    return cachedSession;
  } catch {
    clearAccessToken();
    return null;
  }
}
