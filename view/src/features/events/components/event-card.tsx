import { CalendarDays, MapPin, Minus, Plus, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Event } from "@/features/events/api/events-api";

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function EventCard({
  event,
  quantity,
  isBooking,
  onQuantityChange,
  onReserve,
}: {
  event: Event;
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
