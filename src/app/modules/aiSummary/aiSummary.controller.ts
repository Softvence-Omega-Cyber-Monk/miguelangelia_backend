import { Request, Response } from "express";
import { AiSummaryService } from "./aiSummary.service";

export const AiSummaryController = {
  createUsage: async (req: Request, res: Response) => {
    try {
      const usage = await AiSummaryService.createUsage(req.body);
      res.status(201).json({ success: true, data: usage });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getAllUsages: async (_req: Request, res: Response) => {
    try {
      const usages = await AiSummaryService.getAllUsages();
      res.json({ success: true, data: usages });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  getUsageByUserId: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const usage = await AiSummaryService.getUsageByUserId(userId);
      if (!usage) return res.status(404).json({ success: false, message: "User not found" });
      res.json({ success: true, data: usage });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

};
