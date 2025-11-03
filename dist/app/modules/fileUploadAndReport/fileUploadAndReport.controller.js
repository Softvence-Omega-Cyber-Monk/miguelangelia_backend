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
exports.FileReportController = void 0;
const fileUploadAndReport_service_1 = require("./fileUploadAndReport.service");
exports.FileReportController = {
    fileExplore: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const result = yield fileUploadAndReport_service_1.FileReportService.fileExplore({
                userId,
                file,
            });
            res.status(201).json({
                success: true,
                message: "file explored successfully",
                data: result,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message || "Upload failed" });
        }
    }),
    getReportAndSummry: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId, fileId } = req.body;
            const file = req.file;
            if (!file) {
                return res.status(400).json({ message: "No file uploaded" });
            }
            const result = yield fileUploadAndReport_service_1.FileReportService.getReportAndSummry({
                userId,
                fileId,
                file,
            });
            res.status(201).json({
                success: true,
                message: " file report generated successfully",
                data: result,
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: error.message || "Upload failed" });
        }
    }),
    getAllReportsByUser: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = _req.params;
            const reports = yield fileUploadAndReport_service_1.FileReportService.getAllReportsByUser(userId);
            res.status(200).json(reports);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    getSummaryReportAndDashboardDataByUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { fileId } = req.params;
            const reports = yield fileUploadAndReport_service_1.FileReportService.getSummaryReportAndDashboardDataByUser(fileId);
            res.status(200).json(reports);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
    deleteFile: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { fileId } = req.params;
            const deleteFile = yield fileUploadAndReport_service_1.FileReportService.deleteFile(fileId);
            res.status(201).json({
                success: true,
                message: " file delete successfully",
                data: deleteFile,
            });
            // res.status(200).json(reports);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }),
};
