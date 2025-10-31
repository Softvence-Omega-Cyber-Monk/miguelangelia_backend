"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerBIService = void 0;
const axios_1 = __importDefault(require("axios"));
const qs_1 = __importDefault(require("qs"));
const powerbi_model_1 = require("./powerbi.model");
const baseUrl = "https://api.powerbi.com/v1.0/myorg";
// const tenantId = process.env.TENANT_ID!;
const tenantId = "common";
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECTURI;
exports.PowerBIService = {
    getValidAccessToken(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1️⃣ Get token from DB
            const tokenDoc = yield powerbi_model_1.PowerBiTokenModel.findOne({ userId });
            if (!tokenDoc) {
                throw new Error("No token found for user. User needs to authenticate first.");
            }
            const now = Date.now();
            // 2️⃣ Check if access token is still valid (1 min buffer)
            if (tokenDoc.expires_in > now + 60000) {
                return tokenDoc.access_token;
            }
            console.log("Access token expired. Refreshing...");
            // 3️⃣ Refresh access token using refresh token
            const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
            const data = qs_1.default.stringify({
                grant_type: "refresh_token",
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: tokenDoc.refresh_token,
                redirect_uri: redirectUri,
            });
            const response = yield axios_1.default.post(tokenUrl, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            const { access_token, refresh_token, expires_in } = response.data;
            // Compute absolute expiration timestamp
            const expires_at = Date.now() + expires_in * 1000;
            // 4️⃣ Update DB with new token info
            tokenDoc.access_token = access_token;
            tokenDoc.refresh_token = refresh_token;
            tokenDoc.expires_in = expires_at;
            yield tokenDoc.save();
            console.log(`Refreshed and updated token for user: ${userId}`);
            return access_token;
        });
    },
    saveOrUpdateToken(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return powerbi_model_1.PowerBiTokenModel.findOneAndUpdate({ userId: token.userId }, token, {
                upsert: true,
                new: true,
            });
        });
    },
    // Get token by userId
    // 1️⃣ Generate OAuth authorization URL
    getAuthUrl(userId) {
        const scope = encodeURIComponent("https://analysis.windows.net/powerbi/api/Dashboard.Read.All https://analysis.windows.net/powerbi/api/Report.Read.All https://analysis.windows.net/powerbi/api/Workspace.Read.All offline_access openid profile email");
        const redirect = encodeURIComponent(redirectUri);
        // Include userId in the state parameter
        const state = encodeURIComponent(JSON.stringify({ userId }));
        const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=${state}`;
        console.log("Auth URL:", authUrl);
        return authUrl;
    },
    // 2️⃣ Exchange authorization code for tokens + fetch workspaceId
    exchangeCodeForToken(code, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new Error("userId is required to save tokens");
            }
            console.log("code received in exchangeCodeForToken:", code);
            const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
            const data = qs_1.default.stringify({
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            });
            // 🔹 1️⃣ Get tokens from Microsoft
            const response = yield axios_1.default.post(tokenUrl, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            const { access_token, refresh_token, expires_in } = response.data;
            const expires_at = Date.now() + expires_in * 1000;
            // 🔹 2️⃣ Fetch all workspaces
            const workspacesRes = yield axios_1.default.get("https://api.powerbi.com/v1.0/myorg/groups", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
            });
            // Extract workspace IDs and names
            const workspaces = (workspacesRes.data.value || []).map((ws) => ({
                id: ws.id,
                name: ws.name,
            }));
            console.log("Fetched workspaces:", workspaces);
            if (!workspaces.length) {
                console.warn("No Power BI workspaces found for user:", userId);
            }
            // 🔹 3️⃣ Save tokens and the first workspace ID (optional)
            yield powerbi_model_1.PowerBiTokenModel.findOneAndUpdate({ userId }, {
                userId,
                access_token,
                refresh_token,
                expires_in: expires_at,
                workspaces: workspaces,
            }, { upsert: true, new: true });
            console.log(`✅ Saved tokens for user: ${userId}`);
            // 🔹 4️⃣ Return all together
            return {
                access_token,
                refresh_token,
                expires_in: expires_at,
                workspaces, // ✅ now contains all workspace IDs and names
            };
        });
    },
    getReports(workspaceId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield exports.PowerBIService.getValidAccessToken(userId);
            console.log("Using workspace ID:", workspaceId);
            const response = yield axios_1.default.get(`${baseUrl}/groups/${workspaceId}/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("response:-----------____________________", response.data);
            return response.data.value;
        });
    },
    getDashboards(workspaceId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield exports.PowerBIService.getValidAccessToken(userId);
            console.log("token in dashboard", token);
            const response = yield axios_1.default.get(`${baseUrl}/groups/${workspaceId}/dashboards`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("dashboard response ", response.data);
            return response.data.value;
        });
    },
    getDatasets(workspaceId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                // 1️⃣ Get a valid access token
                const token = yield exports.PowerBIService.getValidAccessToken(userId);
                if (!token)
                    throw new Error("No valid token found for user.");
                console.log("🪙 Token retrieved for datasets request:", token);
                console.log("📂 Using workspace ID:", workspaceId);
                // 2️⃣ Call Power BI API for datasets
                const response = yield axios_1.default.get(`${baseUrl}/groups/${workspaceId}/datasets`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                // 3️⃣ Extract and format dataset list
                const datasets = (response.data.value || []).map((ds) => ({
                    id: ds.id,
                    name: ds.name,
                    webUrl: ds.webUrl,
                    createdDate: ds.createdDate,
                    isRefreshable: ds.isRefreshable,
                }));
                console.log("✅ Datasets fetched:", datasets);
                // 4️⃣ Return in a clean structure
                return {
                    success: true,
                    workspaceId,
                    count: datasets.length,
                    datasets,
                };
            }
            catch (error) {
                console.error("❌ Error fetching datasets:", error.message || error);
                return {
                    success: false,
                    message: ((_c = (_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message) || "Failed to fetch datasets",
                };
            }
        });
    },
};
