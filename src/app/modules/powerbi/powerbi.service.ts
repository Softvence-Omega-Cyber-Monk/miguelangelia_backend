import axios from "axios";
import { getAccessToken } from "../../utils/powerbiAuth";
import qs from "qs";
const baseUrl = "https://api.powerbi.com/v1.0/myorg";

// const tenantId = process.env.TENANT_ID!;
const tenantId = "common";

const clientId = process.env.CLIENT_ID!;
const clientSecret = process.env.CLIENT_SECRET!;
const redirectUri = process.env.REDIRECTURI;

export const PowerBIService = {
  async getReports(workspaceId: string) {
    const token =
      "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSIsImtpZCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMWJlMjhjZWEtNGIwNC00YmQxLWEyNTgtMjhjOGUwMmRmMThhLyIsImlhdCI6MTc2MTczMDQxMywibmJmIjoxNzYxNzMwNDEzLCJleHAiOjE3NjE3MzU5NzUsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBWlFBYS84YUFBQUEvZzF2cDJOWGpIV01nYkcvUURsOXVVaTE3WEFsQk9URFZaU0d2YlhKZ0sxOXlPQVNnVFB3bTYrdkhDTnlVM2JXVHlicFcxZnpYRjhpWnJocUpTUE9MNHBqNjd0R3NTME9DSHJjOEpPV3FFN0xRMVg3cm43eDlqNzJzOGREbm1SM05TSHdLa01ZalE5VnRobHo4dXFyU3R6L2ZxNFN0UkhyWHZkWW5jQW8zT05zZ1Rha2ErSDNjSGUvT0pxUGVEYW0iLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiZjQ4Y2IwNTgtOTZiZi00ZGYyLWE1NTktNmM2Y2Q4ZjY3YjY0IiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJMdXF1ZSBCcmF2byIsImdpdmVuX25hbWUiOiJNaWd1ZWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDMuMTc0LjE4OS4yNDEiLCJuYW1lIjoiTWlndWVsIEx1cXVlIEJyYXZvIiwib2lkIjoiMGM3NTcwMzgtZDc5Ni00YzRmLWIwMjMtYmNlZjQ2NzQ3YWEwIiwicHVpZCI6IjEwMDMyMDA1NDNDM0FGNDQiLCJyaCI6IjEuQVJNQjZvemlHd1JMMFV1aVdDakk0QzN4aWdrQUFBQUFBQUFBd0FBQUFBQUFBQUE2QWNRVEFRLiIsInNjcCI6IkRhc2hib2FyZC5SZWFkLkFsbCBEYXNoYm9hcmQuUmVhZFdyaXRlLkFsbCBEYXRhc2V0LlJlYWQuQWxsIFJlcG9ydC5SZWFkLkFsbCBSZXBvcnQuUmVhZFdyaXRlLkFsbCIsInNpZCI6IjAwOWNlNDI5LTBkNzMtNWMxMS0yNmI5LWIzNjMzYTkzOTMwMSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjgtekxJbUhjVFV1Sk1JNFlYaGwxcTIxQ25tT3hxVjhrYVAzR2xUY18xck0iLCJ0aWQiOiIxYmUyOGNlYS00YjA0LTRiZDEtYTI1OC0yOGM4ZTAyZGYxOGEiLCJ1bmlxdWVfbmFtZSI6Ik1pZ3VlbEx1cXVlQnJhdm9AQW5hbnR5YzA4Mi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJNaWd1ZWxMdXF1ZUJyYXZvQEFuYW50eWMwODIub25taWNyb3NvZnQuY29tIiwidXRpIjoicXR3YTY0aUhXay1FZlo3cGRtSUNBUSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIiwiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19hY3RfZmN0IjoiMyA5IiwieG1zX2Z0ZCI6IkNHWXljZWxVSHRhQnB2a1hfcmF0XzlqN3JGMkR2eVdOOGxKS0NTTnNFakVCWlhWeWIzQmxibTl5ZEdndFpITnRjdyIsInhtc19pZHJlbCI6IjEgMzIiLCJ4bXNfcGwiOiJlcyIsInhtc19zdWJfZmN0IjoiNCAzIn0.Qp-s5d4gZIAmga7qiFqP3clOtELT3RssH3NZCuJkIg-i3NBu7eKA9uBmtw_ow_pCT8GvGQbtupfevgTl-pdQl3hUGwREQwRvdbGpqBeF2t-RVaioIh5f7ZJDW7jibyYkJZXjZWncJCrrlo1ennnhY5hOW1_1r2LhjpZ2T6kTLvKA7ssFb0UusRyDDuO7onvMwn8sDtaFRSwtvq9yU-HOfanU3vi9biUMj6BmA0vLn9s4IFihpEFUOewRVpTS_VvGId5KqZGkvXDvNzYfW43qwes9VUzaM7kknqVP34gJBdNWNMyGYmaQy8dbSimLFLkigddD1HUB4o3M_OkNQIYFDw";

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

    // console.log('Token Response:', response.data);
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_in: response.data.expires_in,
    };
  },
};
