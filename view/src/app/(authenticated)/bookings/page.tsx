"use client";

import { Ticket } from "lucide-react";

import {
  useConfirmBookingMutation,
  useListMyBookingsQuery,
} from "@/features/events/api/events-api";
import { BookingCard } from "@/features/events/components/booking-card";
import {
  BookingSkeletons,
  EmptyBookings,
  StateCard,
} from "@/features/events/components/event-states";
import { getApiErrorMessage } from "@/lib/api/get-api-error-message";
import { toast } from "sonner";

export default function BookingsPage() {
  const bookingsQuery = useListMyBookingsQuery();
  const [confirmBooking, confirmState] = useConfirmBookingMutation();
  const bookings = bookingsQuery.data?.bookings ?? [];

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
      <section aria-labelledby="bookings-heading">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-accent">Your plans</p>
            <h1
              id="bookings-heading"
              className="mt-1 text-3xl font-semibold tracking-tight"
            >
              My bookings
            </h1>
          </div>
          <Ticket className="size-7 text-muted-foreground" aria-hidden="true" />
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
          <div className="mt-6 grid max-w-2xl gap-3">
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
  );
}
