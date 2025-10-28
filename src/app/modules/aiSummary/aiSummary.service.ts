import { AiUsageModel } from "./aiSummary.model";

export const AiSummaryService = {
  createUsage: async (data: any) => {
    const usage = await AiUsageModel.create({
      ...data,
    });
    return usage;
  },

  getAllUsages: async () => {
    const res = await AiUsageModel.find();

    // const totalTokenUsed = res.singleApiTokenUsed;
    // return {
    //   totalApiCall: res.length,
    // };
  },

  getUsageByUserId: async (userId: string) => {
    return await AiUsageModel.find({ userId });
  },
};
