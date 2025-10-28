import mongoose, { Schema, Document } from "mongoose";
import { IAIUsage } from "./aiSummary.interface";

const AiUsageSchema = new Schema<IAIUsage>(
  {
    userId: { type: String, required: true },
    singleApiCallCost: { type: Number, default: 0 },
    singleApiTokenUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);



export const AiUsageModel = mongoose.model<IAIUsage>("AiUsage", AiUsageSchema);
