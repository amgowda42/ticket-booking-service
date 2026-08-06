import { type Response } from "express";
import { Event } from "../../models/event.model.ts";
import { createEventSchema } from "../../schemas/event.schema.ts";
import type { AuthedRequest } from "../../middlewares/auth.middleware.ts";

export const createEvent = async (req: AuthedRequest, res: Response) => {
  const data = createEventSchema.parse(req.body);

  const event = await Event.create({
    ...data,
    availableSeats: data.totalSeats,
    createdBy: req.user!.sub,
  });

  res.status(201).json({ success: true, event });
};

export const listEvents = async (req: AuthedRequest, res: Response) => {
  const events = await Event.find().sort({ startsAt: 1 });
  res.status(200).json({ success: true, events });
};
