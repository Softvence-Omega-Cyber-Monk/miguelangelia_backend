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
exports.PowerBIController = exports.generatePowerBIToken = void 0;
const powerbi_service_1 = require("./powerbi.service");
const generatePowerBIToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = yield (0, powerbi_service_1.getPowerBIAccessToken)();
        return res.status(200).json({
            success: true,
            message: "Power BI access token generated successfully",
            token,
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate Power BI access token",
        });
    }
});
exports.generatePowerBIToken = generatePowerBIToken;
exports.PowerBIController = {
    getReports(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const workspaceId = process.env.WORKSPACE_ID;
                const reports = yield powerbi_service_1.PowerBIService.getReports(workspaceId);
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
                const workspaceId = process.env.WORKSPACE_ID;
                const dashboards = yield powerbi_service_1.PowerBIService.getDashboards(workspaceId);
                res.json({ success: true, data: dashboards });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: error.message });
            }
        });
    },
    getAuthUrl(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authUrl = powerbi_service_1.PowerBIService.getAuthUrl();
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
                const { code, error, error_description } = req.query;
                if (error) {
                    console.error("Callback Error:", { error, error_description });
                    return res.status(400).json({ error, error_description });
                }
                if (!code) {
                    return res.status(400).json({ message: "Authorization code missing" });
                }
                const token = yield powerbi_service_1.PowerBIService.exchangeCodeForToken(code);
                res.status(200).json({
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
};
