import { Request, Response } from "express";
import { FileReportService } from "./fileUploadAndReport.service";

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
        message: "File uploaded to Cloudinary and stored in DB",
        data: result,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  },
  getReportAndSummry: async (req: Request, res: Response) => {
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
        message: "File uploaded to Cloudinary and stored in DB",
        data: result,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message || "Upload failed" });
    }
  },

  getAllReports: async (_req: Request, res: Response) => {
    try {
      const reports = await FileReportService.getAll();
      res.status(200).json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },

  getUserReports: async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const reports = await FileReportService.getByUser(userId);
      res.status(200).json(reports);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  },
};
