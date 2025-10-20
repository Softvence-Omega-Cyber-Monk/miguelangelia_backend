import { Request, Response } from "express";
import { getPowerBIAccessToken, PowerBIService } from "./powerbi.service";

export const generatePowerBIToken = async (req: Request, res: Response) => {
  try {
    const token = await getPowerBIAccessToken();
    return res.status(200).json({
      success: true,
      message: "Power BI access token generated successfully",
      token,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate Power BI access token",
    });
  }
};

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

  async getAuthUrl(req: Request, res: Response) {
    try {
      const authUrl = PowerBIService.getAuthUrl();
      return res.redirect(authUrl);
    } catch (error: any) {
      console.error("Auth URL Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async callback(req: Request, res: Response) {
    try {
      const { code, error, error_description } = req.query;

      if (error) {
        console.error("Callback Error:", { error, error_description });
        return res.status(400).json({ error, error_description });
      }

      if (!code) {
        return res.status(400).json({ message: "Authorization code missing" });
      }

      const token = await PowerBIService.exchangeCodeForToken(code as string);

      res.status(200).json({
        success: true,
        message: "Power BI connected successfully!",
        token,
      });
    } catch (err: any) {
      console.error("Callback Handler Error:", err.message);
      res.status(500).json({ error: err.message });
    }
  },
};
