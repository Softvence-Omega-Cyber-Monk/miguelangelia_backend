import express from "express";
import { PowerBIController } from "./powerbi.controller";

const router = express.Router();

router.post("/powerbi/token", PowerBIController.saveToken);

router.get("/connect/:userId", PowerBIController.getAuthUrl);

// Step 2: Handle callback and store tokens
router.get("/callback", PowerBIController.callback);

router.get("/reports/:userId", PowerBIController.getReports);
router.get("/dashboards/:userId", PowerBIController.getDashboards);
router.get("/dataset/:workspaceId/:userId", PowerBIController.getDatasets);

export const powerbiRoute = router;
