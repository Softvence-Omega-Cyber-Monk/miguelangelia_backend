import express from "express";
import { PowerBIController } from "./powerbi.controller";

const router = express.Router();

router.get("/reports", PowerBIController.getReports);
router.get("/dashboards", PowerBIController.getDashboards);

export const powerbiRoute = router;
