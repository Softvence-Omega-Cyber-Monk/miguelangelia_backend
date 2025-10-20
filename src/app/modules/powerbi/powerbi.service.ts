import axios from "axios";
import { getAccessToken } from "../../utils/powerbiAuth";
import qs from "qs";
const baseUrl = "https://api.powerbi.com/v1.0/myorg";

const tenantId = process.env.TENANT_ID!;
const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const redirectUri = process.env.REDIRECTURI;

export const getPowerBIAccessToken = async (): Promise<string> => {
  try {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = qs.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://analysis.windows.net/powerbi/api/.default",
    });

    const response = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return response.data.access_token;
  } catch (error: any) {
    console.error(
      "Power BI Token Error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to generate Power BI access token");
  }
};

export const PowerBIService = {
  async getReports(workspaceId: string) {
    const token = await getAccessToken();

    console.log("token:", token);

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

  async getDashboards(workspaceId: string) {
    const token = await getAccessToken();

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

  // 1️⃣ Generate OAuth authorization URL
  getAuthUrl() {
    const scope = encodeURIComponent(
      "https://analysis.windows.net/powerbi/api/.default offline_access"
    );
    const redirect = encodeURIComponent(redirectUri as string);
    
    console.log(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=secure_random_state_123`
    );

    return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=secure_random_state_123`;
  },

  // 2️⃣ Exchange authorization code for tokens
  async exchangeCodeForToken(code: string) {
    const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

    const data = qs.stringify({
      grant_type: "authorization_code",
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    });

    const response = await axios.post(tokenUrl, data, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    };
  },
};
