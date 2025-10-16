import axios from "axios";
import { getAccessToken } from "../../utils/powerbiAuth";

const baseUrl = "https://api.powerbi.com/v1.0/myorg";

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
};
