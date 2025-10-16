import { Request, Response } from "express";
import { PowerBIService } from "./powerbi.service";

export const PowerBIController = {
  async getReports(req: Request, res: Response) {
    try {
      const workspaceId = process.env.WORKSPACE_ID!;
      const reports = await PowerBIService.getReports(workspaceId);
      res.json({ success: true, data: reports });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getDashboards(req: Request, res: Response) {
    try {
      const workspaceId = process.env.WORKSPACE_ID!;
      const dashboards = await PowerBIService.getDashboards(workspaceId);
      res.json({ success: true, data: dashboards });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
};
