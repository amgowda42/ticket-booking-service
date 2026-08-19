"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useSyncExternalStore } from "react";

import { getSession, type Session } from "@/lib/auth/session";

function AuthenticatedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: Session["role"] }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session === null) router.replace("/login");
    else if (session && requiredRole && session.role !== requiredRole) router.replace("/");
  }, [requiredRole, router, session]);

  if (session === undefined || !session || (requiredRole && session.role !== requiredRole)) return <RouteLoading />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session) router.replace("/");
  }, [router, session]);

  if (session === undefined || session) return <RouteLoading />;
  return <>{children}</>;
}

function useSession(): Session | null | undefined {
  return useSyncExternalStore(
    subscribeToSession,
    getSession,
    getServerSession,
  );
}

function subscribeToSession(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function getServerSession(): undefined {
  return undefined;
}

function RouteLoading() {
  return <main className="grid min-h-screen place-items-center bg-background text-sm text-muted-foreground">Loading your workspace…</main>;
}

export { AuthenticatedRoute, GuestRoute };
