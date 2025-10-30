"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.powerbiRoute = void 0;
const express_1 = __importDefault(require("express"));
const powerbi_controller_1 = require("./powerbi.controller");
const router = express_1.default.Router();
router.get("/accessToken", powerbi_controller_1.generatePowerBIToken);
router.get("/reports", powerbi_controller_1.PowerBIController.getReports);
router.get("/dashboards", powerbi_controller_1.PowerBIController.getDashboards);
router.get("/connect", powerbi_controller_1.PowerBIController.getAuthUrl);
// Step 2: Handle callback and store tokens
router.get("/callback", powerbi_controller_1.PowerBIController.callback);
exports.powerbiRoute = router;
