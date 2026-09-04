import { AlertTriangle, CalendarDays, RefreshCw, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function StateCard({
  title,
  message,
  actionLabel,
  isRetrying,
  onRetry,
  className,
}: {
  title: string;
  message: string;
  actionLabel: string;
  isRetrying: boolean;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <Card
      className={`mt-6 border-destructive/30 bg-destructive/4 p-6 ${className ?? ""}`}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle />
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      <Button
        className="mt-5"
        variant="outline"
        size="sm"
        onClick={onRetry}
        disabled={isRetrying}
      >
        <RefreshCw
          className={isRetrying ? "animate-spin" : ""}
          aria-hidden="true"
        />
        {isRetrying ? "Trying again..." : actionLabel}
      </Button>
    </Card>
  );
}

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

export function EventSkeletons() {
  return (
    <div
      className="mt-6 grid gap-4 sm:grid-cols-2"
      aria-label="Loading events"
      role="status"
    >
      {[1, 2].map((item) => (
        <Card key={item} className="space-y-4 p-5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-7 h-9 w-full" />
        </Card>
      ))}
    </div>
  );
}

export function BookingSkeletons() {
  return (
    <div
      className="mt-6 grid gap-3"
      aria-label="Loading bookings"
      role="status"
    >
      {[1, 2].map((item) => (
        <Card key={item} className="space-y-3 p-4">
          <div className="flex justify-between gap-4">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </Card>
      ))}
    </div>
  );
}

export function EmptyState() {
  return (
    <Card className="mt-6 p-8 text-center">
      <CalendarDays className="mx-auto size-8 text-muted-foreground" />
      <p className="mt-3 font-medium">The calendar is quiet for now.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        New events will appear here as soon as they are published.
      </p>
    </Card>
  );
}

export function EmptyBookings() {
  return (
    <Card className="p-6">
      <Ticket className="size-7 text-muted-foreground" />
      <p className="mt-4 font-medium">No bookings yet.</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">
        Choose an event and hold your first seat. It will show up here.
      </p>
    </Card>
  );
}
