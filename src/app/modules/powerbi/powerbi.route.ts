import express from "express";
import { generatePowerBIToken, PowerBIController } from "./powerbi.controller";

const router = express.Router();

router.get("/accessToken", generatePowerBIToken);
router.get("/reports", PowerBIController.getReports);
router.get("/dashboards", PowerBIController.getDashboards);

router.get("/connect", PowerBIController.getAuthUrl);

// Step 2: Handle callback and store tokens
router.get("/callback", PowerBIController.callback);

export const powerbiRoute = router;
