"use client";

import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, LogOut, Plus, Ticket } from "lucide-react";
import { type ReactNode } from "react";

import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "@/components/ui/button";
import { clearAccessToken, getSession } from "@/lib/auth/session";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { useLogoutMutation } from "@/features/auth/api/auth-api";
import { toast } from "sonner";

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const session = getSession();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

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
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Seatwise home"
          >
            <BrandMark />
          </button>
          <nav
            className="flex items-center gap-1 rounded-xl border border-border/70 bg-card/60 p-1"
            aria-label="Main navigation"
          >
            <button
              type="button"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${pathname === "/" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
              onClick={() => router.push("/")}
            >
              <CalendarDays className="size-4" aria-hidden="true" />
              Discover
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={() => router.push("/#bookings")}
            >
              <Ticket className="size-4" aria-hidden="true" />
              My bookings
            </button>
            {session?.role === "admin" && (
              <button
                type="button"
                className="hidden items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:flex"
                onClick={() => router.push("/events/new")}
              >
                <Plus className="size-4" aria-hidden="true" />
                Create event
              </button>
            )}
          </nav>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            disabled={isLoggingOut}
            aria-label="Sign out"
          >
            <LogOut aria-hidden="true" />
            <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Sign out"}</span>
          </Button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export { AuthenticatedShell };
