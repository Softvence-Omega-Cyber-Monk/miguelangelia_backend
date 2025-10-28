import mongoose, { Schema, Document } from "mongoose";
import { IAIUsage } from "./aiSummary.interface";

const AiUsageSchema = new Schema<IAIUsage>(
  {
    userId: { type: String, required: true },
    totalApiCalls: { type: Number, default: 0 },
    monthlyCost: { type: Number, default: 0 },
    tokenUsed: { type: Number, default: 0 },
    tokenLeft: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AiUsageModel = mongoose.model<IAIUsage>("AiUsage", AiUsageSchema);
