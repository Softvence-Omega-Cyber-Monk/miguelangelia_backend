import express from "express";
import { PowerBIController } from "./powerbi.controller";
import multer from "multer";

const upload = multer({ dest: "uploads/" }); // temporary folder for CSV

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
