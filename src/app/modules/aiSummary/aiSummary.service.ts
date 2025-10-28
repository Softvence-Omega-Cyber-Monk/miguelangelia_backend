import { AiUsageModel } from "./aiSummary.model";

export const AiSummaryService = {
  createUsage: async (data: any) => {
    const usage = new AiUsageModel(data);
    return await usage.save();
  },

  getAllUsages: async () => {
    return await AiUsageModel.find().sort({ createdAt: -1 });
  },

  getUsageByUserId: async (userId: string) => {
    return await AiUsageModel.find({ userId });
  },
};
