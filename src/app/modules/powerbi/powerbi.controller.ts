import { Request, Response } from "express";
import { PowerBIService } from "./powerbi.service";
import axios from "axios";
import fs from "fs";

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
  async addServicePrincipalToWorkspace(workspaceId: string, userId: string) {
    try {
      // 1. Get Service Principal info from token
      const token = await PowerBIService.getValidAccessToken(userId);
      const decoded = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      const servicePrincipalId = decoded.oid; // This is the Object ID

      console.log("🔧 Adding Service Principal to workspace:", {
        workspaceId,
        servicePrincipalId,
        applicationId: decoded.appid,
      });

      // 2. Make API call to add Service Principal to workspace
      const url = `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/users`;

      const requestBody = {
        identifier: servicePrincipalId,
        groupUserAccessRight: "Admin", // or "Member", "Contributor"
        principalType: "App", // This is crucial for Service Principals
      };

      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("✅ Service Principal successfully added to workspace");
      return response.data;
    } catch (error: any) {
      console.error("❌ Failed to add Service Principal to workspace:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      throw new Error(
        `Failed to add Service Principal: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  },
  async uploadCsvController(req: Request, res: Response) {
    try {
      const { workspaceId, userId } = req.body;
      const filePath = req.file?.path;

      console.log("CSV Upload Request from controller:", {
        workspaceId,
        userId,
        filePath,
        file: req.file, // Log file details
      });

      if (!filePath) {
        return res.status(400).json({ error: "CSV file missing" });
      }

      // Validate file extension
      if (!req.file?.originalname?.toLowerCase().endsWith(".csv")) {
        fs.unlinkSync(filePath); // Clean up
        return res.status(400).json({ error: "File must be a CSV" });
      }

      // 1️⃣ Upload CSV
      const uploadResult = await PowerBIService.uploadCsvToPowerBI(
        workspaceId,
        userId,
        filePath
      );

      if (!uploadResult?.datasets || uploadResult.datasets.length === 0) {
        throw new Error(
          "Upload succeeded but no dataset returned — check Power BI workspace permissions"
        );
      }

      const datasetId = uploadResult?.datasets?.[0]?.id || uploadResult?.id;

      if (!datasetId) {
        return res.status(500).json({
          error: "Dataset ID not found after upload",
          uploadResult,
        });
      }

      // 2️⃣ Generate embed token for dataset
      const embedToken = await PowerBIService.generateDatasetEmbedToken(
        workspaceId,
        datasetId,
        userId
      );

      console.log("Embed token generated successfully");

      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn("Could not clean up temporary file:", cleanupError);
      }

      res.json({
        message: "CSV uploaded and embed token generated successfully",
        datasetId,
        embedToken,
        uploadResult: {
          id: uploadResult.id,
          name: uploadResult.name,
          datasets: uploadResult.datasets,
        },
      });
    } catch (err: any) {
      // Clean up file on error
      if (req.file?.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn(
            "Could not clean up temporary file on error:",
            cleanupError
          );
        }
      }

      console.error("Upload controller error:", err);
      res.status(500).json({
        error: err.message || "Upload failed",
        details: err.response?.data,
      });
    }
  },
};
