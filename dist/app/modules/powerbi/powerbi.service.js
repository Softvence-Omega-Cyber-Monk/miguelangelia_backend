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
exports.PowerBIService = exports.getPowerBIAccessToken = void 0;
const axios_1 = __importDefault(require("axios"));
const powerbiAuth_1 = require("../../utils/powerbiAuth");
const qs_1 = __importDefault(require("qs"));
const baseUrl = "https://api.powerbi.com/v1.0/myorg";
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECTURI;
const getPowerBIAccessToken = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
        const data = qs_1.default.stringify({
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
            scope: "https://analysis.windows.net/powerbi/api/.default",
        });
        const response = yield axios_1.default.post(tokenUrl, data, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return response.data.access_token;
    }
    catch (error) {
        console.error("Power BI Token Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new Error("Failed to generate Power BI access token");
    }
});
exports.getPowerBIAccessToken = getPowerBIAccessToken;
exports.PowerBIService = {
    getReports(workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield (0, powerbiAuth_1.getAccessToken)();
            console.log("token:", token);
            console.log("Using workspace ID:", workspaceId);
            const response = yield axios_1.default.get(`${baseUrl}/groups/${workspaceId}/reports`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("response:-----------____________________", response.data);
            return response.data.value;
        });
    },
    getDashboards(workspaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            const token = yield (0, powerbiAuth_1.getAccessToken)();
            console.log("token in dashboard", token);
            const response = yield axios_1.default.get(`${baseUrl}/groups/${workspaceId}/dashboards`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("dashboard response ", response.data);
            return response.data.value;
        });
    },
    // 1️⃣ Generate OAuth authorization URL
    getAuthUrl() {
        const scope = encodeURIComponent("https://analysis.windows.net/powerbi/api/.default offline_access");
        const redirect = encodeURIComponent(redirectUri);
        console.log(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=secure_random_state_123`);
        return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirect}&response_mode=query&scope=${scope}&state=secure_random_state_123`;
    },
    // 2️⃣ Exchange authorization code for tokens
    exchangeCodeForToken(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
            const data = qs_1.default.stringify({
                grant_type: "authorization_code",
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            });
            const response = yield axios_1.default.post(tokenUrl, data, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            });
            return {
                access_token: response.data.access_token,
                refresh_token: response.data.refresh_token,
                expires_in: response.data.expires_in,
            };
        });
    },
};
