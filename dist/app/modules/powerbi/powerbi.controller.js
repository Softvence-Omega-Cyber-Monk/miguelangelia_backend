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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PowerBIController = void 0;
const powerbi_service_1 = require("./powerbi.service");
exports.PowerBIController = {
    saveToken(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, access_token, refresh_token, expires_in } = req.body;
                if (!userId || !access_token || !refresh_token || !expires_in) {
                    return res.status(400).json({ message: "Missing required fields" });
                }
                const token = yield powerbi_service_1.PowerBIService.saveOrUpdateToken({
                    userId,
                    access_token,
                    refresh_token,
                    expires_in,
                });
                res.status(200).json({ success: true, token });
            }
            catch (err) {
                console.error(err);
                res.status(500).json({ success: false, message: err.message });
            }
        });
    },
    getAuthUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                console.log("Generating auth URL for user ID:", userId);
                const authUrl = powerbi_service_1.PowerBIService.getAuthUrl(userId);
                return res.redirect(authUrl);
            }
            catch (error) {
                console.error("Auth URL Error:", error);
                res.status(500).json({ success: false, message: error.message });
            }
        });
    },
    callback(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { code, state, error, error_description } = req.query;
                if (error) {
                    console.error("Callback Error:", { error, error_description });
                    return res.status(400).json({ error, error_description });
                }
                if (!code) {
                    return res.status(400).json({ message: "Authorization code missing" });
                }
                let userId;
                if (state) {
                    try {
                        const parsedState = JSON.parse(decodeURIComponent(state));
                        userId = parsedState.userId;
                    }
                    catch (err) {
                        console.warn("Failed to parse state:", err);
                    }
                }
                // console.log("User ID from state:", userId);
                const token = yield powerbi_service_1.PowerBIService.exchangeCodeForToken(code, userId);
                // console.log("Obtained Tokens:", token);
                res.status(200).send({
                    success: true,
                    message: "Power BI connected successfully!",
                    token,
                });
            }
            catch (err) {
                console.error("Callback Handler Error:", err.message);
                res.status(500).json({ error: err.message });
            }
        });
    },
    getReports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const workspaceId = process.env.WORKSPACE_ID;
                const reports = yield powerbi_service_1.PowerBIService.getReports(workspaceId, userId);
                res.json({ success: true, data: reports });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        });
    },
    getDashboards(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const workspaceId = process.env.WORKSPACE_ID;
                const dashboards = yield powerbi_service_1.PowerBIService.getDashboards(workspaceId, userId);
                res.json({ success: true, data: dashboards });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        });
    },
    getDatasets(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                const workspaceId = req.params.workspaceId;
                const dashboards = yield powerbi_service_1.PowerBIService.getDatasets(workspaceId, userId);
                res.json({ success: true, data: dashboards });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        });
    },
};
