"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays, LogOut, Plus, Ticket } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { clearAccessToken, getSession } from "@/lib/auth/session";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { toast } from "sonner";

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentTime, setCurrentTime] = useState(() => new Date());

  const session = getSession();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  useEffect(() => {
    const clock = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  async function signOut() {
    try {
      const result = await logout().unwrap();
      clearAccessToken();
      toast.success(result.message);
      router.replace("/login");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Seatwise home">
            <BrandMark />
          </Link>
          <nav
            className="flex items-center gap-1 rounded-xl border border-border/70 bg-card/60 p-1"
            aria-label="Main navigation"
          >
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              Discover
            </Link>
            <Link
              href="/bookings"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/bookings" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
            >
              <Ticket className="size-4" aria-hidden="true" />
              My bookings
            </Link>
            {session?.role === "admin" && (
              <Link
                href="/events/new"
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create event
              </Link>
            )}
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="text-right">
              <p className="text-sm font-semibold leading-tight">
                {session?.name}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Welcome back
              </p>
            </div>
            <time
              className="rounded-lg border border-border/70 bg-card/60 px-3 py-2 font-mono text-sm font-medium tabular-nums text-foreground shadow-sm"
              dateTime={currentTime.toISOString()}
              title={currentTime.toLocaleDateString(undefined, {
                dateStyle: "full",
              })}
            >
              {currentTime.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </time>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            disabled={isLoggingOut}
            aria-label="Sign out"
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Signing out..." : "Sign out"}
            </span>
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export { AuthenticatedShell };
