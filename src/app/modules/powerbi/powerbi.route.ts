import express from "express";
import { PowerBIController } from "./powerbi.controller";
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Preserve the original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/connect/:userId", PowerBIController.getAuthUrl);
// Step 2: Handle callback and store tokens
router.get("/callback", PowerBIController.callback);

router.post("/powerbi/token", PowerBIController.saveToken);

router.get("/getSavedToken/:userId", PowerBIController.getSavedToken);

router.get("/reports/:userId/:workspaceId", PowerBIController.getReports);
router.get("/dashboards/:userId/:workspaceId", PowerBIController.getDashboards);
router.post(
  "/upload/file",
  upload.single("file"),
  PowerBIController.uploadCsvController
);

export const powerbiRoute = router;
