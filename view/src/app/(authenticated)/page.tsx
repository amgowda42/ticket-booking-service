"use client";

import { CalendarDays, Ticket, Users } from "lucide-react";
import { useState } from "react";

import {
  useCreateBookingMutation,
  useConfirmBookingMutation,
  useListEventsQuery,
  useListMyBookingsQuery,
} from "@/features/events/api/events-api";
import { BookingCard } from "@/features/events/components/booking-card";
import { EventCard as EventCardView } from "@/features/events/components/event-card";
import {
  BookingSkeletons,
  EmptyBookings,
  EmptyState,
  EventSkeletons,
  StateCard,
} from "@/features/events/components/event-states";
import { Summary } from "@/features/events/components/summary";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { toast } from "sonner";

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
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full border-32 border-accent/10" />
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
                <EventCardView
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
