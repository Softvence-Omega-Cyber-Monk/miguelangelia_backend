import { Request, Response } from "express";
import { PowerBIService } from "./powerbi.service";
import axios from "axios";

export const PowerBIController = {
  async saveToken(req: Request, res: Response) {
    try {
      const { userId, access_token, refresh_token, expires_in } = req.body;

      if (!userId || !access_token || !refresh_token || !expires_in) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const token = await PowerBIService.saveOrUpdateToken({
        userId,
        access_token,
        refresh_token,
        expires_in,
      } as any);

      res.status(200).json({ success: true, token });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },
  async getSavedToken(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      // console.log('Fetching saved token for user ID:', userId);

      if (!userId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const token = await PowerBIService.getSavedToken({
        userId,
      } as any);

      res.status(200).json({ success: true, token });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getAuthUrl(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      console.log("Generating auth URL for user ID:", userId);
      const authUrl = PowerBIService.getAuthUrl(userId);
      return res.redirect(authUrl);
    } catch (error: any) {
      console.error("Auth URL Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async callback(req: Request, res: Response) {
    try {
      const { code, state, error, error_description } = req.query;

      if (error) {
        console.error("Callback Error:", { error, error_description });
        return res.status(400).json({ error, error_description });
      }

      if (!code) {
        return res.status(400).json({ message: "Authorization code missing" });
      }

      let userId: string | undefined;
      if (state) {
        try {
          const parsedState = JSON.parse(decodeURIComponent(state as string));
          userId = parsedState.userId;
        } catch (err) {
          console.warn("Failed to parse state:", err);
        }
      }

      // console.log("User ID from state:", userId);

      const token = await PowerBIService.exchangeCodeForToken(
        code as string,
        userId
      );

      res.redirect(`https://miguelangelia-client.vercel.app/user/integration`);

      // res.status(200).send({
      //   success: true,
      //   message: "Power BI connected successfully!",
      //   token,
      // });
    } catch (err: any) {
      console.error("Callback Handler Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  },

  async getReports(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const workspaceId = req.params.workspaceId;

      console.log(
        "Fetching reports for user:",
        userId,
        "in workspace:",
        workspaceId
      );
      const reports = await PowerBIService.getReports(workspaceId, userId);
      res.json({ success: true, data: reports });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getDashboards(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const workspaceId = req.params.workspaceId;
      const dashboards = await PowerBIService.getDashboards(
        workspaceId,
        userId
      );
      res.json({ success: true, data: dashboards });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  },
  async uploadCsvController(req: Request, res: Response) {
    try {
      const { workspaceId, userId } = req.body;
      const filePath = req.file?.path;
      console.log("CSV Upload Request from controller :", {
        workspaceId,
        userId,
        filePath,
      });

      if (!filePath) return res.status(400).json({ error: "CSV file missing" });

      // 1️⃣ Upload CSV
      const uploadResult = await PowerBIService.uploadCsvToPowerBI(
        workspaceId,
        userId,
        filePath
      );

      const datasetId = uploadResult?.datasets?.[0]?.id || uploadResult?.id;

      if (!datasetId)
        return res
          .status(500)
          .json({ error: "Dataset ID not found after upload" });

      // 2️⃣ Generate embed token for dataset
      const embedToken = await PowerBIService.generateDatasetEmbedToken(
        workspaceId,
        datasetId,
        userId
      );

      res.json({
        message: "CSV uploaded and embed token generated successfully",
        datasetId,
        embedToken,
        uploadResult,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || "Upload failed" });
    }
  },
};
