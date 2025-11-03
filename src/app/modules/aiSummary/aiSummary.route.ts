import express from "express";
import { AiSummaryController } from "./aiSummary.controller";

const router = express.Router();

router.post("/create", AiSummaryController.createUsage);
router.get("/getAll", AiSummaryController.getAllUsages);
router.get("/getSingleUser/:userId", AiSummaryController.getUsageByUserId);


export const aiUsageRoutes = router;
