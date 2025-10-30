import mongoose, { Schema, Document } from "mongoose";

export interface TPowerBiToken extends Document {
  userId: string;
  access_token: string;
  refresh_token: string;
  expires_in: number; // timestamp in ms when token expires
}

const PowerBiTokenSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    expires_in: { type: Number, required: true },
  },
  { timestamps: true }
);

export const PowerBiTokenModel = mongoose.model<TPowerBiToken>(
  "PowerBiToken",
  PowerBiTokenSchema
);
