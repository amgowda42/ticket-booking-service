import mongoose from "mongoose";
import { Booking } from "../models/booking.model.ts";
import { Event } from "../models/event.model.ts";
import logger from "../logger/logger.ts";

export const expirePendingBookings = async (): Promise<void> => {
  const now = new Date();

  const candidates = await Booking.find({
    status: "pending",
    expiresAt: { $lte: now },
  }).select("_id");

  for (const { _id } of candidates) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();
      const claimed = await Booking.findOneAndUpdate(
        { _id, status: "pending", expiresAt: { $lte: now } },
        { status: "expired" },
        { new: true, session },
      );

      if (!claimed) {
        await session.abortTransaction();
        continue;
      }

      await Event.updateOne(
        { _id: claimed.event },
        { $inc: { availableSeats: claimed.quantity } },
        { session },
      );

      await session.commitTransaction();

      logger.info(
        { bookingId: claimed._id },
        "Booking expired, seats restored",
      );
    } catch (err) {
      await session.abortTransaction();
      logger.error({ err, bookingId: _id }, "Failed to expire booking");
    } finally {
      session.endSession();
    }
  }
};
