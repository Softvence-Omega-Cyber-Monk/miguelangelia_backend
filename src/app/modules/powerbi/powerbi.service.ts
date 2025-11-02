import axios from "axios";
import { getAccessToken } from "../../utils/powerbiAuth";
import qs from "qs";
import { PowerBiTokenModel } from "./powerbi.model";
import { TPowerBiToken } from "./powerbi.interface";
const baseUrl = "https://api.powerbi.com/v1.0/myorg";

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

  async saveOrUpdateToken(token: TPowerBiToken) {
    return PowerBiTokenModel.findOneAndUpdate({ userId: token.userId }, token, {
      upsert: true,
      new: true,
    });
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
    const token = await PowerBIService.getValidAccessToken(userId);
    console.log("Using workspace ID:", workspaceId);

    const response = await axios.get(
      `${baseUrl}/groups/${workspaceId}/reports`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("response:-----------____________________", response.data);

    return response.data.value;
  },

  async getDashboards(workspaceId: string, userId: string) {
    const token = await PowerBIService.getValidAccessToken(userId);

    console.log("token in dashboard", token);

    const response = await axios.get(
      `${baseUrl}/groups/${workspaceId}/dashboards`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("dashboard response ", response.data);

    return response.data.value;
  },

  async getDatasets(workspaceId: string, userId: string) {
    try {
      const token = await PowerBIService.getValidAccessToken(userId);
      if (!token) throw new Error("No valid token found for user.");

      const response = await axios.get(
        `${baseUrl}/groups/${workspaceId}/datasets`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const datasets = response.data.value || [];

      const datasetsWithDetails = [];

      for (const ds of datasets) {
        const datasetDetails: any = {
          id: ds.id,
          name: ds.name,
          webUrl: ds.webUrl,
          createdDate: ds.createdDate,
          isRefreshable: ds.isRefreshable,
          tables: [],
        };

        try {
          const tablesResponse = await axios.get(
            `${baseUrl}/groups/${workspaceId}/datasets/${ds.id}/tables`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const tables = tablesResponse.data.value || [];
          datasetDetails.tables = tables.map((t: any) => t.name);

          if (tables.length > 0) {
            const firstTableName = tables[0].name;
            const daxQuery = {
              queries: [
                {
                  query: `EVALUATE TOPN(10, '${firstTableName}')`,
                },
              ],
            };

            const queryResponse = await axios.post(
              `${baseUrl}/groups/${workspaceId}/datasets/${ds.id}/executeQueries`,
              daxQuery,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            datasetDetails.dataPreview =
              queryResponse.data.results?.[0]?.tables?.[0]?.rows || [];
          } else {
            datasetDetails.note =
              "No tables found (likely a Push dataset without data).";
          }
        } catch (innerErr: any) {
          // Handle "Not Push API" datasets gracefully
          if (innerErr.response?.status === 404) {
            datasetDetails.note =
              "This is an imported or DirectQuery dataset — tables are not accessible via REST API.";
          } else {
            datasetDetails.error =
              innerErr.response?.data?.error?.message ||
              "Failed to fetch table list.";
          }
        }

        datasetsWithDetails.push(datasetDetails);
      }

      return {
        success: true,
        workspaceId,
        count: datasetsWithDetails.length,
        datasets: datasetsWithDetails,
      };
    } catch (error: any) {
      console.error("❌ Error fetching datasets:", error.message || error);
      return {
        success: false,
        message:
          error.response?.data?.error?.message || "Failed to fetch datasets",
      };
    }
  },
  
};
