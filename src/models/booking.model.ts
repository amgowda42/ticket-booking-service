// src/models/booking.model.ts
import { Schema, model, Types } from "mongoose";

export interface IBooking {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  event: Types.ObjectId;
  quantity: number;
  status: "pending" | "confirmed" | "expired" | "cancelled";
  expiresAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "expired", "cancelled"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Booking = model<IBooking>("Booking", bookingSchema);
