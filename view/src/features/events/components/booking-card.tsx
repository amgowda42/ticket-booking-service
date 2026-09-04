import { AlertTriangle, BadgeCheck, CheckCircle2, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Booking } from "@/features/events/api/events-api";
import { formatDate } from "@/features/events/components/event-card";

const statusCardStyles = {
  pending: "border-accent/35 bg-accent/[0.04]",
  confirmed: "border-primary/35 bg-primary/[0.04]",
  expired: "border-destructive/30 bg-destructive/[0.04]",
  cancelled: "border-border/80 bg-card/90",
};

export function BookingCard({
  booking,
  isConfirming,
  onConfirm,
}: {
  booking: Booking;
  isConfirming: boolean;
  onConfirm: (bookingId: string) => Promise<void>;
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(() =>
    getSecondsRemaining(booking.expiresAt),
  );
  const isPending = booking.status === "pending" && secondsRemaining > 0;
  const displayStatus = isPending
    ? booking.status
    : secondsRemaining === 0 && booking.status === "pending"
      ? "expired"
      : booking.status;

  useEffect(() => {
    if (booking.status !== "pending") return;
    const timer = window.setInterval(
      () => setSecondsRemaining(getSecondsRemaining(booking.expiresAt)),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [booking.expiresAt, booking.status]);

  return (
    <Card className={`p-4 ${statusCardStyles[displayStatus]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{booking.event.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {booking.event.venue}
          </p>
        </div>
        <BookingStatus status={displayStatus} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(booking.event.startsAt)}</span>
        <span>
          {booking.quantity} {booking.quantity === 1 ? "seat" : "seats"}
        </span>
      </div>
      {isPending && (
        <div className="mt-4 rounded-lg border border-accent/20 bg-accent/10 p-3">
          <p className="flex items-center justify-between gap-1.5 text-xs text-accent">
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" aria-hidden="true" />
              Hold expires {formatDate(booking.expiresAt)}
            </span>
            <strong aria-live="polite">
              {formatCountdown(secondsRemaining)}
            </strong>
          </p>
          <Button
            className="mt-3 h-9 w-full"
            size="sm"
            disabled={isConfirming}
            onClick={() => onConfirm(booking._id)}
          >
            <BadgeCheck aria-hidden="true" />
            {isConfirming ? "Confirming..." : "Confirm booking"}
          </Button>
        </div>
      )}
      {displayStatus === "expired" && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-destructive">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          This seat hold expired. Choose the event again to reserve new seats.
        </p>
      )}
    </Card>
  );
}

function getSecondsRemaining(expiresAt: string) {
  return Math.max(
    0,
    Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );
}

function formatCountdown(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0")}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

function BookingStatus({ status }: { status: Booking["status"] | "expired" }) {
  const styles = {
    pending: "bg-accent/15 text-accent",
    confirmed: "bg-primary/15 text-primary",
    expired: "bg-destructive/10 text-destructive",
    cancelled: "bg-muted text-muted-foreground",
  };
  const icons = {
    pending: <Clock3 className="size-3" aria-hidden="true" />,
    confirmed: <CheckCircle2 className="size-3" aria-hidden="true" />,
    expired: <AlertTriangle className="size-3" aria-hidden="true" />,
    cancelled: null,
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}
