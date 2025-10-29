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
    const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSIsImtpZCI6InlFVXdtWFdMMTA3Q2MtN1FaMldTYmVPYjNzUSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMWJlMjhjZWEtNGIwNC00YmQxLWEyNTgtMjhjOGUwMmRmMThhLyIsImlhdCI6MTc2MTcxNTA1OCwibmJmIjoxNzYxNzE1MDU4LCJleHAiOjE3NjE3MTk1ODcsImFjY3QiOjAsImFjciI6IjEiLCJhaW8iOiJBWlFBYS84YUFBQUEwN2VJV0RHelhCUHQxOS9yQ0hEd25QSTFPMDNTNVJUaDN3cmJSMG9zZUdmS0ExL1RiN0xrTUZBaWJQTjFwWkhXdnVUZnlRbW93aWUwWWVBZ1hZMG9POEhuc1V6aW5zOXg4bjZ3ZnVXWmZCRjhReUczYUhCaGYxdm1pa1h3c0VTMi9qU1VyWFZzTVZmRVMwalA4ai81STZMWk1jYU9WZ1J0MElkVVVtaXBrL21WeTlUVk9TMkJ3bUhtTHdFMjlSWGQiLCJhbXIiOlsicHdkIiwibWZhIl0sImFwcGlkIjoiZjQ4Y2IwNTgtOTZiZi00ZGYyLWE1NTktNmM2Y2Q4ZjY3YjY0IiwiYXBwaWRhY3IiOiIxIiwiZmFtaWx5X25hbWUiOiJMdXF1ZSBCcmF2byIsImdpdmVuX25hbWUiOiJNaWd1ZWwiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDMuMTc0LjE4OS4yNDEiLCJuYW1lIjoiTWlndWVsIEx1cXVlIEJyYXZvIiwib2lkIjoiMGM3NTcwMzgtZDc5Ni00YzRmLWIwMjMtYmNlZjQ2NzQ3YWEwIiwicHVpZCI6IjEwMDMyMDA1NDNDM0FGNDQiLCJyaCI6IjEuQVJNQjZvemlHd1JMMFV1aVdDakk0QzN4aWdrQUFBQUFBQUFBd0FBQUFBQUFBQUE2QWNRVEFRLiIsInNjcCI6IkRhc2hib2FyZC5SZWFkLkFsbCBEYXNoYm9hcmQuUmVhZFdyaXRlLkFsbCBEYXRhc2V0LlJlYWQuQWxsIFJlcG9ydC5SZWFkLkFsbCBSZXBvcnQuUmVhZFdyaXRlLkFsbCIsInNpZCI6IjAwOWNlNDI5LTBkNzMtNWMxMS0yNmI5LWIzNjMzYTkzOTMwMSIsInNpZ25pbl9zdGF0ZSI6WyJrbXNpIl0sInN1YiI6IjgtekxJbUhjVFV1Sk1JNFlYaGwxcTIxQ25tT3hxVjhrYVAzR2xUY18xck0iLCJ0aWQiOiIxYmUyOGNlYS00YjA0LTRiZDEtYTI1OC0yOGM4ZTAyZGYxOGEiLCJ1bmlxdWVfbmFtZSI6Ik1pZ3VlbEx1cXVlQnJhdm9AQW5hbnR5YzA4Mi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJNaWd1ZWxMdXF1ZUJyYXZvQEFuYW50eWMwODIub25taWNyb3NvZnQuY29tIiwidXRpIjoiN2p1U0ZudnpSMHFZemNPY0FGYnZBQSIsInZlciI6IjEuMCIsIndpZHMiOlsiNjJlOTAzOTQtNjlmNS00MjM3LTkxOTAtMDEyMTc3MTQ1ZTEwIiwiYjc5ZmJmNGQtM2VmOS00Njg5LTgxNDMtNzZiMTk0ZTg1NTA5Il0sInhtc19hY3RfZmN0IjoiOSAzIiwieG1zX2Z0ZCI6ImQ5NTNIY05yR05lcUJmbzVHSXdPNW5adkY2ellhbEtnUkRVaEZZV0gtcVVCYzNkbFpHVnVZeTFrYzIxeiIsInhtc19pZHJlbCI6IjEgMTYiLCJ4bXNfcGwiOiJlcyIsInhtc19zdWJfZmN0IjoiMiAzIn0.JCsnEKjizZ6rBuARVAShdQGGsAvPeJaZ6tGhvADjzcELpJqWdJ-DbaBuR2bx-lTpjq-8arIUQs60Ot-IlsOqPkHWsN0A2LV7eCQ5nM8YbWMkhUXPUdJsxdr0ysQxLRv74wWs9qAd8cROxf70SO94p5EbycJVCWVS7sLcox1v97SXbccamV3491zZXv6Uytu9dJ1WAXouPtML2hDoIIwdatsDghO8BNeouwl2AYSlei_nDj0dm0jEQstbrcQJUjX640USeIfxzgZifhE0ZAhsjOfYQSlrp-vr8uD8ZRndpM05J1PP2xZVhuoly7LudTQwg-hJcauLM0HOIc0TgZZrvA"


    console.log("Using workspace ID:", workspaceId);

    const response = await axios.get(
      `${baseUrl}/groups/${workspaceId}/reports`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // console.log("response:-----------____________________", response.data);
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
