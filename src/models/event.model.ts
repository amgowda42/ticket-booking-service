import { Schema, model, Types } from "mongoose";

export interface IEvent {
  _id: Types.ObjectId;
  title: string;
  venue: string;
  startsAt: Date;
  totalSeats: number;
  availableSeats: number;
  createdBy: Types.ObjectId;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    startsAt: { type: Date, required: true },
    totalSeats: { type: Number, required: true, min: 1 },
    availableSeats: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const Event = model<IEvent>("Event", eventSchema);
