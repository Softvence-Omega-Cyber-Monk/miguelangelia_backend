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
exports.FileReportService = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const fileUploadAndReport_model_1 = require("./fileUploadAndReport.model");
// 🔧 Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.FileReportService = {
    uploadToCloudinary: (filePath) => __awaiter(void 0, void 0, void 0, function* () {
        const uploadResult = yield cloudinary_1.v2.uploader.upload(filePath, {
            resource_type: "raw", // ⚡ important for non-image files
            folder: "reports",
        });
        // Remove local temp file
        fs_1.default.unlinkSync(filePath);
        return uploadResult;
    }),
    fileExplore: (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log(data.file, data.userId);
        const uploaded = yield exports.FileReportService.uploadToCloudinary(data.file.path);
        console.log("cloudnary uploaded link : ", uploaded.secure_url);
        // 3️⃣ Call the AI report API
        const aiReportUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/file-explore?file_url=${encodeURIComponent(uploaded.secure_url)}`;
        const response1 = yield fetch(aiReportUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const fileExplore = yield response1.json();
        console.log("🤖 Report AI API response:", fileExplore);
        const newReport = yield fileUploadAndReport_model_1.FileUploadAndReportModel.create({
            userId: data.userId,
            fileExplore: fileExplore,
            fileUrl: uploaded.secure_url,
            fileName: data.file.originalname,
            fileType: data.file.mimetype,
            fileSize: data.file.size,
        });
        return {
            data: newReport,
        };
    }),
    getReportAndSummry: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const uploaded = yield exports.FileReportService.uploadToCloudinary(data.file.path);
        console.log("cloudnary uploaded link : ", uploaded.secure_url);
        const summaryUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/summary?file_url=${encodeURIComponent(uploaded.secure_url)}`;
        const response2 = yield fetch(summaryUrl, {
            method: "POST", // keep POST if API expects it
            headers: {
                "Content-Type": "application/json",
            },
        });
        const summaryData = yield response2.json();
        // console.log("🤖 Summary AI API response:", summaryData);
        // 3️⃣ Call the AI report API
        const aiReportUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/generate-report`;
        const response1 = yield fetch(aiReportUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ file_url: uploaded.secure_url }),
        });
        const report = yield response1.json();
        // console.log("🤖 Report AI API response:", report);
        const DashboardDataUrl = `https://financialanalyticalchatbot-9osk.onrender.com/ai/generate-dashboard?file_url=${encodeURIComponent(uploaded.secure_url)}`;
        const response3 = yield fetch(DashboardDataUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ file_url: uploaded.secure_url }),
        });
        const DashboardData = yield response3.json();
        console.log("🤖 Dashboard data API response:", DashboardData);
        let newFileReport;
        if (data.fileId) {
            newFileReport = yield fileUploadAndReport_model_1.FileUploadAndReportModel.findByIdAndUpdate(data.fileId, {
                summary: summaryData,
                report: report,
                dashboardData: DashboardData,
            }, { new: true });
        }
        else {
            newFileReport = yield fileUploadAndReport_model_1.FileUploadAndReportModel.create({
                userId: data.userId,
                fileUrl: uploaded.secure_url,
                summary: summaryData,
                report: report,
                dashboardData: DashboardData,
                fileName: data.file.originalname,
                fileType: data.file.mimetype,
                fileSize: data.file.size,
            });
        }
        return {
            summary: summaryData,
            report: report,
            dashboardData: DashboardData,
        };
    }),
    getAllReportsByUser: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield fileUploadAndReport_model_1.FileUploadAndReportModel.find({ userId: userId }).sort({
            createdAt: -1,
        });
    }),
    getSummaryReportAndDashboardDataByUser: (fileId) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log('file id ', fileId);
        return yield fileUploadAndReport_model_1.FileUploadAndReportModel.find({ _id: fileId }).select("summary report dashboardData");
    }),
    deleteFile: (fileId) => __awaiter(void 0, void 0, void 0, function* () {
        // console.log('file id ', fileId);
        const res = yield fileUploadAndReport_model_1.FileUploadAndReportModel.deleteOne({ _id: fileId });
        console.log(res);
        return res;
    }),
};
