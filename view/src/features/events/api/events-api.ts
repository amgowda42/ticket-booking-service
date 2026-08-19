import { baseApi } from "@/store/api/base-api";

export type Event = {
  _id: string;
  title: string;
  venue: string;
  startsAt: string;
  totalSeats: number;
  availableSeats: number;
};

export type Booking = {
  _id: string;
  quantity: number;
  status: "pending" | "confirmed" | "expired" | "cancelled";
  expiresAt: string;
  createdAt: string;
  event: Pick<Event, "_id" | "title" | "venue" | "startsAt">;
};

type EventsResponse = { success: true; events: Event[] };
type BookingsResponse = { success: true; bookings: Booking[] };
type BookingResponse = { success: true; booking: Booking };
type EventResponse = { success: true; event: Event };

export type CreateEventRequest = Pick<Event, "title" | "venue" | "startsAt" | "totalSeats">;

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listEvents: builder.query<EventsResponse, void>({
      query: () => "/events",
      providesTags: ["Events"],
    }),
    listMyBookings: builder.query<BookingsResponse, void>({
      query: () => "/bookings/me",
      providesTags: ["Bookings"],
    }),
    createBooking: builder.mutation<
      BookingResponse,
      { eventId: string; quantity: number }
    >({
      query: (body) => ({ url: "/bookings", method: "POST", body }),
      invalidatesTags: ["Bookings", "Events"],
    }),
    confirmBooking: builder.mutation<BookingResponse, string>({
      query: (bookingId) => ({
        url: `/bookings/${bookingId}/confirm`,
        method: "POST",
      }),
      invalidatesTags: ["Bookings"],
    }),
    createEvent: builder.mutation<EventResponse, CreateEventRequest>({
      query: (body) => ({ url: "/events", method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
  }),
});

export const {
  useListEventsQuery,
  useListMyBookingsQuery,
  useCreateBookingMutation,
  useConfirmBookingMutation,
  useCreateEventMutation,
} = eventsApi;
