"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiUsageRoutes = void 0;
const express_1 = __importDefault(require("express"));
const aiSummary_controller_1 = require("./aiSummary.controller");
const router = express_1.default.Router();
router.post("/create", aiSummary_controller_1.AiSummaryController.createUsage);
router.get("/getAll", aiSummary_controller_1.AiSummaryController.getAllUsages);
router.get("/getSingleUser/:userId", aiSummary_controller_1.AiSummaryController.getUsageByUserId);
exports.aiUsageRoutes = router;
