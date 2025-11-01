"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadAndReportRoute = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fileUploadAndReport_controller_1 = require("./fileUploadAndReport.controller");
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
const uploadFolder = path_1.default.join(__dirname, "uploads");
// Create uploads folder if it doesn't exist
if (!fs_1.default.existsSync(uploadFolder)) {
    fs_1.default.mkdirSync(uploadFolder, { recursive: true });
}
// Multer config — store temp file locally before uploading to Cloudinary
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadFolder); // use the created folder
    },
    filename: (_req, file, cb) => {
        cb(null, Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
// Routes
router.post("/create/fileExplore", upload.single("file"), fileUploadAndReport_controller_1.FileReportController.fileExplore);
router.post("/create/getReportAndSummry", upload.single("file"), fileUploadAndReport_controller_1.FileReportController.getReportAndSummry);
router.get("/file/:userId", fileUploadAndReport_controller_1.FileReportController.getAllReportsByUser);
router.get("/getSingleFile/:fileId", fileUploadAndReport_controller_1.FileReportController.getSummaryReportAndDashboardDataByUser);
router.delete("/delete/:fileId", fileUploadAndReport_controller_1.FileReportController.deleteFile);
exports.fileUploadAndReportRoute = router;
