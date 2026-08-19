import type { ReactNode } from "react";

import { CalendarDays, ShieldCheck, Sparkles } from "lucide-react";

import { BrandMark } from "@/components/brand/brand-mark";

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative grid min-h-screen overflow-hidden bg-background md:h-screen md:min-h-0 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,color-mix(in_oklch,var(--primary),transparent_78%),transparent_30%),radial-gradient(circle_at_86%_78%,color-mix(in_oklch,var(--accent),transparent_86%),transparent_30%)]" />
      <section className="relative flex min-h-screen flex-col px-6 py-7 sm:px-10 md:min-h-0 md:py-5 lg:px-16">
        <BrandMark />
        <div className="mx-auto flex w-full max-w-md flex-1 items-center py-12 md:min-h-0 md:py-4">{children}</div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Seatwise. Book with confidence.</p>
      </section>
      <aside className="relative hidden border-l border-border/70 bg-card/30 p-16 lg:flex lg:h-screen lg:flex-col lg:justify-between">
        <div className="max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden="true" /> Better event nights start here
          </span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-tight text-foreground">Your next seat is waiting.</h1>
          <p className="mt-6 max-w-sm text-lg leading-8 text-muted-foreground">Discover moments worth showing up for, with bookings that stay simple from first click to confirmation.</p>
        </div>
        <div className="grid gap-4">
          <Feature icon={<ShieldCheck />} text="Secure account access" />
          <Feature icon={<CalendarDays />} text="Events arranged around you" />
        </div>
      </aside>
    </main>
  );
}

function Feature({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <span className="flex size-9 items-center justify-center rounded-lg bg-accent/15 text-accent">{icon}</span>
      {text}
    </div>
  );
}

export { AuthShell };
