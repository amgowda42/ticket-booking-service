import { type Response } from "express";
import mongoose from "mongoose";
import { Event } from "../../models/event.model.ts";
import { Booking } from "../../models/booking.model.ts";
import { createBookingSchema } from "../../schemas/booking.schema.ts";
import { AppError } from "../../utils/app-error.ts";
import { type AuthedRequest } from "../../middlewares/auth.middleware.ts";

const HOLD_MINUTES = 10;

export const createBooking = async (req: AuthedRequest, res: Response) => {
  const { eventId, quantity } = createBookingSchema.parse(req.body);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const event = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: quantity } },
      { $inc: { availableSeats: -quantity } },
      { new: true, session },
    );

    if (!event) {
      throw new AppError(409, "Not enough seats available");
    }

    const [booking] = await Booking.create(
      [
        {
          user: req.user!.sub,
          event: eventId,
          quantity,
          status: "pending",
          expiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
        },
      ],
      { session },
    );

    await session.commitTransaction();

    res.status(201).json({ success: true, booking });
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const listMyBookings = async (req: AuthedRequest, res: Response) => {
  const bookings = await Booking.find({ user: req.user!.sub })
    .populate("event", "title venue startsAt")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, bookings });
};

export const confirmBooking = async (req: AuthedRequest, res: Response) => {
  const bookingId = req.params.bookingId;
  if (typeof bookingId !== "string" || !mongoose.isObjectIdOrHexString(bookingId)) {
    throw new AppError(400, "Invalid booking identifier", {
      bookingId: ["Booking ID is invalid"],
    });
  }

  const booking = await Booking.collection.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(bookingId),
      user: new mongoose.Types.ObjectId(req.user!.sub),
      status: "pending",
      expiresAt: { $gt: new Date() },
    },
    { $set: { status: "confirmed", updatedAt: new Date() } },
    { returnDocument: "after" },
  );

  if (!booking) {
    throw new AppError(404, "No pending, unexpired booking found to confirm");
  }

  res.status(200).json({ success: true, booking });
};
