import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  venue: z.string().trim().min(1, "Venue is required"),
  startsAt: z.coerce.date(),
  totalSeats: z.number().int().positive(),
});
