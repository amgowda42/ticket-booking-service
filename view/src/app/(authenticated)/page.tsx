"use client";

import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Minus,
  MapPin,
  Plus,
  RefreshCw,
  Ticket,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  useCreateBookingMutation,
  useConfirmBookingMutation,
  useListEventsQuery,
  useListMyBookingsQuery,
} from "@/features/events/api/events-api";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { toast } from "sonner";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function HomePage() {
  const eventsQuery = useListEventsQuery();
  const bookingsQuery = useListMyBookingsQuery();
  const [createBooking, bookingState] = useCreateBookingMutation();
  const [confirmBooking, confirmState] = useConfirmBookingMutation();
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const events = eventsQuery.data?.events ?? [];
  const bookings = bookingsQuery.data?.bookings ?? [];
  async function reserveSeat(eventId: string, quantity: number) {
    try {
      await createBooking({ eventId, quantity }).unwrap();
      setQuantities((current) => ({ ...current, [eventId]: 1 }));
      toast.success("Seat held for 10 minutes");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    }
  }

  async function confirmHeldBooking(bookingId: string) {
    try {
      await confirmBooking(bookingId).unwrap();
      await bookingsQuery.refetch();
      toast.success("Booking confirmed. Your seat is secured.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 lg:py-12">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-card px-6 py-8 shadow-2xl shadow-black/10 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border-[32px] border-accent/10" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Your event desk
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Make room for something memorable.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Find the night you have been waiting for, hold your seats, and keep
            every booking in one calm place.
          </p>
        </div>
        <div className="relative mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
          <Summary
            icon={<CalendarDays />}
            label="Upcoming events"
            value={String(events.length)}
          />
          <Summary
            icon={<Ticket />}
            label="Your bookings"
            value={String(bookings.length)}
          />
          <Summary
            className="col-span-2 sm:col-span-1"
            icon={<Users />}
            label="Seats held"
            value={String(
              bookings.reduce((total, booking) => total + booking.quantity, 0),
            )}
          />
        </div>
      </section>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="events-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-accent">
                Browse the calendar
              </p>
              <h2
                id="events-heading"
                className="mt-1 text-2xl font-semibold tracking-tight"
              >
                Events worth showing up for
              </h2>
            </div>
            <span className="text-sm text-muted-foreground">
              {events.length} listed
            </span>
          </div>
          {eventsQuery.isLoading && <EventSkeletons />}
          {eventsQuery.isError && (
            <StateCard
              icon={<AlertTriangle />}
              title="Events are taking a moment"
              message="We could not reach the event calendar. Check the API connection and try again."
              actionLabel="Retry events"
              isRetrying={eventsQuery.isFetching}
              onRetry={() => void eventsQuery.refetch()}
            />
          )}
          {!eventsQuery.isLoading &&
            !eventsQuery.isError &&
            events.length === 0 && <EmptyState />}
          {!eventsQuery.isError && events.length > 0 && (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  quantity={quantities[event._id] ?? 1}
                  isBooking={bookingState.isLoading}
                  onQuantityChange={(quantity) =>
                    setQuantities((current) => ({
                      ...current,
                      [event._id]: quantity,
                    }))
                  }
                  onReserve={reserveSeat}
                />
              ))}
            </div>
          )}
        </section>

        <section id="bookings" aria-labelledby="bookings-heading">
          <div>
            <p className="text-sm font-medium text-accent">Your plans</p>
            <h2
              id="bookings-heading"
              className="mt-1 text-2xl font-semibold tracking-tight"
            >
              My bookings
            </h2>
          </div>
          {bookingsQuery.isLoading && <BookingSkeletons />}
          {bookingsQuery.isError && (
            <StateCard
              className="mt-6"
              icon={<AlertTriangle />}
              title="Bookings are unavailable"
              message="Your events are still safe. We could not load your booking list right now."
              actionLabel="Retry bookings"
              isRetrying={bookingsQuery.isFetching}
              onRetry={() => void bookingsQuery.refetch()}
            />
          )}
          {!bookingsQuery.isLoading &&
            !bookingsQuery.isError &&
            bookings.length === 0 && <EmptyBookings />}
          {!bookingsQuery.isError && bookings.length > 0 && (
            <div className="mt-6 grid gap-3">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  isConfirming={confirmState.isLoading}
                  onConfirm={confirmHeldBooking}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EventCard({
  event,
  quantity,
  isBooking,
  onQuantityChange,
  onReserve,
}: {
  event: import("@/features/events/api/events-api").Event;
  quantity: number;
  isBooking: boolean;
  onQuantityChange: (quantity: number) => void;
  onReserve: (eventId: string, quantity: number) => Promise<void>;
}) {
  const canDecrease = quantity > 1;
  const canIncrease = quantity < event.availableSeats;

  return (
    <Card className="flex flex-col justify-between p-5 transition-transform hover:-translate-y-0.5">
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
            {event.availableSeats} seats left
          </span>
          <CalendarDays
            className="size-5 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <h3 className="mt-6 text-xl font-semibold">{event.title}</h3>
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4" aria-hidden="true" />
          {event.venue}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {formatDate(event.startsAt)}
        </p>
        <div className="mt-7 flex items-center gap-3">
          <div
            className="flex items-center rounded-lg border border-border/80 bg-background/70 p-1"
            aria-label={`Quantity for ${event.title}`}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Decrease seat quantity"
              disabled={!canDecrease || isBooking}
              onClick={() => onQuantityChange(quantity - 1)}
            >
              <Minus aria-hidden="true" />
            </Button>
            <output
              className="min-w-8 text-center text-sm font-semibold"
              aria-live="polite"
            >
              {quantity}
            </output>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Increase seat quantity"
              disabled={!canIncrease || isBooking}
              onClick={() => onQuantityChange(quantity + 1)}
            >
              <Plus aria-hidden="true" />
            </Button>
          </div>
          <Button
            className="min-w-0 flex-1"
            onClick={() => onReserve(event._id, quantity)}
            disabled={event.availableSeats < 1 || isBooking}
          >
            <Ticket aria-hidden="true" />
            {isBooking
              ? "Holding..."
              : `Hold ${quantity} ${quantity === 1 ? "seat" : "seats"}`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function BookingCard({
  booking,
  isConfirming,
  onConfirm,
}: {
  booking: import("@/features/events/api/events-api").Booking;
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

    const timer = window.setInterval(() => {
      setSecondsRemaining(getSecondsRemaining(booking.expiresAt));
    }, 1000);

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
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const statusCardStyles = {
  pending: "border-accent/35 bg-accent/[0.04]",
  confirmed: "border-primary/35 bg-primary/[0.04]",
  expired: "border-destructive/30 bg-destructive/[0.04]",
  cancelled: "border-border/80 bg-card/90",
};

function BookingStatus({
  status,
}: {
  status: "pending" | "confirmed" | "expired" | "cancelled";
}) {
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

function Summary({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-border/70 bg-background/60 p-3 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function StateCard({
  icon,
  title,
  message,
  actionLabel,
  isRetrying,
  onRetry,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel: string;
  isRetrying: boolean;
  onRetry: () => void;
  className?: string;
}) {
  return (
    <Card
      className={`mt-6 border-destructive/30 bg-destructive/[0.04] p-6 ${className ?? ""}`}
    >
      <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        {icon}
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

function EventSkeletons() {
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

function BookingSkeletons() {
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

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className}`} />;
}

function EmptyState() {
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

function EmptyBookings() {
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
