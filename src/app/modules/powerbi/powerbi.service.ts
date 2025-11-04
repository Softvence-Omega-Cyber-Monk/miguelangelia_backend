import axios from "axios";
import { getAccessToken } from "../../utils/powerbiAuth";
import qs from "qs";
import { PowerBiTokenModel } from "./powerbi.model";
import { TPowerBiToken } from "./powerbi.interface";
const baseUrl = "https://api.powerbi.com/v1.0/myorg";
import fs from "fs";
import FormData from "form-data";
// const tenantId = process.env.TENANT_ID!;
const tenantId = "common";

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const redirectUri = process.env.REDIRECTURI;

export const PowerBIService = {
  async getValidAccessToken(userId: string) {
    // 1️⃣ Get token from DB
    const tokenDoc = await PowerBiTokenModel.findOne({ userId });
    if (!tokenDoc) {
      throw new Error(
        "No token found for user. User needs to authenticate first."
      );
    }

    const now = Date.now();

    // 2️⃣ Check if access token is still valid (1 min buffer)
    if (tokenDoc.expires_in > now + 60_000) {
      return tokenDoc.access_token;
    }

    console.log("Access token expired. Refreshing...");

    // 3️⃣ Refresh access token using refresh token
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = qs.stringify({
      grant_type: "refresh_token",
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: tokenDoc.refresh_token,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Compute absolute expiration timestamp
    const expires_at = Date.now() + expires_in * 1000;

    // 4️⃣ Update DB with new token info
    tokenDoc.access_token = access_token;
    tokenDoc.refresh_token = refresh_token;
    tokenDoc.expires_in = expires_at;

    await tokenDoc.save();

    console.log(`Refreshed and updated token for user: ${userId}`);

    return access_token;
  },

  async getEmbedReportToken(
    workspaceId: string,
    reportId: string,
    userId: string
  ) {
    const accessToken = await PowerBIService.getValidAccessToken(userId);

    const response = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
      {
        accessLevel: "View",
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data; // contains token, expiration
  },

  async getDashboardEmbedToken(
    workspaceId: string,
    dashboardId: string,
    userId: string
  ) {
    const accessToken = await PowerBIService.getValidAccessToken(userId);

    const response = await axios.post(
      `https://api.powerbi.com/v1.0/myorg/groups/${workspaceId}/dashboards/${dashboardId}/GenerateToken`,
      {
        accessLevel: "View", // or "Edit" if you need edit access
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    return response.data; // contains token + expiration
  },
  async generateDatasetEmbedToken(
    workspaceId: string,
    datasetId: string,
    userId: string
  ) {
    const token = await PowerBIService.getValidAccessToken(userId);

    const response = await axios.post(
      `${baseUrl}/groups/${workspaceId}/datasets/${datasetId}/GenerateToken`,
      { accessLevel: "View" },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // token + expiration
  },

  async saveOrUpdateToken(token: TPowerBiToken) {
    return PowerBiTokenModel.findOneAndUpdate({ userId: token.userId }, token, {
      upsert: true,
      new: true,
    });
  },
  async getSavedToken(userId: string | { userId: string }) {
    try {
      // Extract string if userId is an object
      const id = typeof userId === "string" ? userId : userId.userId;

      console.log("Fetching saved token for user ID:", id);

      const token = await PowerBiTokenModel.findOne({ userId: id });
      console.log("Retrieved token:", token);

      return token; // can be null if not found
    } catch (error) {
      console.error("Error fetching saved token:", error);
      throw new Error("Failed to fetch saved token");
    }
  },

  // Get token by userId

  // 1️⃣ Generate OAuth authorization URL
  getAuthUrl(userId: string) {
    const scope = encodeURIComponent(
      "https://analysis.windows.net/powerbi/api/Dashboard.Read.All https://analysis.windows.net/powerbi/api/Report.Read.All https://analysis.windows.net/powerbi/api/Workspace.Read.All offline_access openid profile email"
    );

    const redirect = encodeURIComponent(redirectUri as string);

    // Include userId in the state parameter
    const state = encodeURIComponent(JSON.stringify({ userId }));

    const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=${state}`;

    console.log("Auth URL:", authUrl);
    return authUrl;
  },

  // 2️⃣ Exchange authorization code for tokens + fetch workspaceId
  async exchangeCodeForToken(code: string, userId?: string) {
    if (!userId) {
      throw new Error("userId is required to save tokens");
    }

    console.log("code received in exchangeCodeForToken:", code);

    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = qs.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    // 🔹 1️⃣ Get tokens from Microsoft
    const response = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, refresh_token, expires_in } = response.data;
    const expires_at = Date.now() + expires_in * 1000;

    // 🔹 2️⃣ Fetch all workspaces
    const workspacesRes = await axios.get(
      "https://api.powerbi.com/v1.0/myorg/groups",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    // Extract workspace IDs and names
    const workspaces = (workspacesRes.data.value || []).map((ws: any) => ({
      id: ws.id,
      name: ws.name,
    }));

    console.log("Fetched workspaces:", workspaces);

    if (!workspaces.length) {
      console.warn("No Power BI workspaces found for user:", userId);
    }

    // 🔹 3️⃣ Save tokens and the first workspace ID (optional)
    await PowerBiTokenModel.findOneAndUpdate(
      { userId },
      {
        userId,
        access_token,
        refresh_token,
        expires_in: expires_at,
        workspaces: workspaces,
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Saved tokens for user: ${userId}`);

    // 🔹 4️⃣ Return all together
    return {
      access_token,
      refresh_token,
      expires_in: expires_at,
      workspaces, // ✅ now contains all workspace IDs and names
    };
  },

  async getReports(workspaceId: string, userId: string) {
    // Step 1: Get Power BI access token
    const accessToken = await PowerBIService.getValidAccessToken(userId);
    console.log("Using workspace ID:", workspaceId);

    // Step 2: Get list of reports from the workspace
    const response = await axios.get(
      `${baseUrl}/groups/${workspaceId}/reports`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const reports = response.data.value;

    // Step 3: Generate embed tokens for each report
    const reportsWithTokens = await Promise.all(
      reports.map(async (report: any) => {
        try {
          const embedToken = await PowerBIService.getEmbedReportToken(
            workspaceId,
            report.id,
            userId
          );

          return {
            ...report,
            embedToken: embedToken.token, // assuming .token from your getEmbedToken response
            embedTokenExpiry: embedToken.expiration, // optional
          };
        } catch (err: any) {
          console.error(
            `Failed to get embed token for report ${report.name}:`,
            err.message
          );
          return report; // fallback without token
        }
      })
    );

    console.log("Reports with embed tokens:", reportsWithTokens);

    // Step 4: Return combined data
    return reportsWithTokens;
  },
  async getDashboards(workspaceId: string, userId: string) {
    try {
      // Step 1: Get Power BI access token (for REST API call)
      const accessToken = await PowerBIService.getValidAccessToken(userId);
      // console.log("Access token for dashboard request:", accessToken);

      // Step 2: Fetch dashboards in the workspace
      const response = await axios.get(
        `${baseUrl}/groups/${workspaceId}/dashboards`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      const dashboards = response.data.value || [];
      console.log("Dashboards fetched:", dashboards.length);

      // Step 3: Generate embed tokens for each dashboard
      const dashboardsWithTokens = await Promise.all(
        dashboards.map(async (dashboard: any) => {
          try {
            const embedToken = await PowerBIService.getDashboardEmbedToken(
              workspaceId,
              dashboard.id,
              userId
            );

            return {
              ...dashboard,
              embedToken: embedToken.token, // token string
              tokenExpiry: embedToken.expiration, // optional
            };
          } catch (err: any) {
            console.error(
              `❌ Failed to get embed token for dashboard "${dashboard.displayName}":`,
              err.message
            );
            return dashboard;
          }
        })
      );

      // Step 4: Return dashboards with embed tokens
      return dashboardsWithTokens;
    } catch (error: any) {
      console.error("Error fetching dashboards:", error.message);
      throw error;
    }
  },
  async uploadCsvToPowerBI(
    workspaceId: string,
    userId: string,
    filePath: string
  ) {
    const token = await PowerBIService.getValidAccessToken(userId);

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), {
      filename: filePath.split("/").pop(),
      contentType: "text/csv",
    });
    form.append("file", fs.createReadStream(filePath));

    const response = await axios.post(
      `${baseUrl}/groups/${workspaceId}/imports?datasetDisplayName=AI_CSV_Report&nameConflict=CreateOrOverwrite`,
      form,
      {
        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data; // Returns import ID, dataset ID, etc.
  },
};
