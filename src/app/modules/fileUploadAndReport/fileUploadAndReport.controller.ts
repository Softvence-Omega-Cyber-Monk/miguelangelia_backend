import { Request, Response } from "express";
import { FileReportService } from "./fileUploadAndReport.service";
import { success } from "zod";

export const FileReportController = {
  fileExplore: async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await FileReportService.fileExplore({
        userId,
        file,
      });

      res.status(201).json({
        success: true,
        message: "file explored successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  },
  getReportAndSummry: async (req: Request, res: Response) => {
    try {
      const { userId ,fileId} = req.body;
   
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const result = await FileReportService.getReportAndSummry({
        userId,
        fileId,
        file,
      });

      res.status(201).json({
        success: true,
        message: " file report generated successfully",
        data: result,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  },

  getAllReportsByUser: async (_req: Request, res: Response) => {
    try {
      const {userId} = _req.params;
      const reports = await FileReportService.getAllReportsByUser( userId);
      res.status(200).json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getSummaryReportAndDashboardDataByUser: async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const reports = await FileReportService.getSummaryReportAndDashboardDataByUser(fileId);
      res.status(200).json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

};
