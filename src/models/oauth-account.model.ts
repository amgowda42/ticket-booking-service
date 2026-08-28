import { Schema, model, Types } from "mongoose";

export interface IOAuthAccount {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  provider: "google";
  providerAccountId: string;
  email: string;
}

const oauthAccountSchema = new Schema<IOAuthAccount>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: String, enum: ["google"], required: true },
    providerAccountId: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
  },
  { timestamps: true },
);

oauthAccountSchema.index(
  { provider: 1, providerAccountId: 1 },
  { unique: true },
);
oauthAccountSchema.index({ user: 1, provider: 1 }, { unique: true });

export const OAuthAccount = model<IOAuthAccount>(
  "OAuthAccount",
  oauthAccountSchema,
);
