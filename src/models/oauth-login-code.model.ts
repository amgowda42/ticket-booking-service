import { Schema, model, Types } from "mongoose";

export interface IOAuthLoginCode {
  _id: Types.ObjectId;
  codeHash: string;
  user: Types.ObjectId;
  expiresAt: Date;
  usedAt?: Date;
}

const oauthLoginCodeSchema = new Schema<IOAuthLoginCode>(
  {
    codeHash: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date },
  },
  { timestamps: true },
);

export const OAuthAccountLogin = model<IOAuthLoginCode>(
  "OAuthAccountLogin",
  oauthLoginCodeSchema,
);

// Backwards-compatible name for callers that describe this as a one-time code.
export const OAuthLoginCode = OAuthAccountLogin;
