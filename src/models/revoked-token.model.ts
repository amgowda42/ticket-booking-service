import { createHash } from "node:crypto";
import { Schema, model } from "mongoose";

interface IRevokedToken {
  tokenHash: string;
  expiresAt: Date;
}

const revokedTokenSchema = new Schema<IRevokedToken>(
  {
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const hashAccessToken = (token: string): string =>
  createHash("sha256").update(token).digest("hex");

export const RevokedToken = model<IRevokedToken>("RevokedToken", revokedTokenSchema);
