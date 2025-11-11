
import { Schema, model, Document } from "mongoose";
import { GeneralChatHistory } from "./generalChatHistory.interface";



const generalChatHistorySchema = new Schema<GeneralChatHistory>(
  {
    userId: { type: String, required: true },
    thread_id: { type: String, required: true },
    response: { type: String, required: true },
  },
  { timestamps: true }
);

export const GeneralChatHistoryModel = model<GeneralChatHistory>(
  "GeneralChatHistory",
  generalChatHistorySchema
);
