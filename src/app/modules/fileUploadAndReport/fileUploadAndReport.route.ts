import express from "express";
import multer from "multer";
import path from "path";
import { FileReportController } from "./fileUploadAndReport.controller";
import fs from "fs";

const router = express.Router();

const uploadFolder = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer config — store temp file locally before uploading to Cloudinary
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadFolder); // use the created folder
  },
  filename: (_req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/create/fileExplore",
  upload.single("file"),
  FileReportController.fileExplore
);
router.post(
  "/create/getReportAndSummry",
  upload.single("file"),
  FileReportController.getReportAndSummry
);

router.get("/getAllFile", FileReportController.getAllReports);
router.get("/file/:userId", FileReportController.getAllReportsByUser);

router.get(
  "/getSingleFile/:fileId",
  FileReportController.getSummaryReportAndDashboardDataByUser
);
router.delete("/delete/:fileId", FileReportController.deleteFile);

router.get("/analytics", FileReportController.getAnalytics);

export const fileUploadAndReportRoute = router;
