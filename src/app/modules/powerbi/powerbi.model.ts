import mongoose, { Schema, Document } from "mongoose";

export interface TWorkspace {
  id: string;
  name: string;
}

export interface TPowerBiToken extends Document {
  userId: string;
  access_token: string;
  refresh_token: string;
  workspaces?: TWorkspace[];
  expires_in: number; // absolute timestamp (in ms)
}

const WorkspaceSchema = new Schema<TWorkspace>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
  { _id: false } // prevent MongoDB from creating an _id for each workspace
);

const PowerBiTokenSchema = new Schema<TPowerBiToken>(
  {
    userId: { type: String, required: true, unique: true },
    access_token: { type: String, required: true },
    refresh_token: { type: String, required: true },
    workspaces: { type: [WorkspaceSchema], default: [] },
    expires_in: { type: Number, required: true },
  },
  { timestamps: true }
);

export const PowerBiTokenModel = mongoose.model<TPowerBiToken>(
  "PowerBiToken",
  PowerBiTokenSchema
);
