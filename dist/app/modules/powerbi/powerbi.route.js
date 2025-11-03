"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.powerbiRoute = void 0;
const express_1 = __importDefault(require("express"));
const powerbi_controller_1 = require("./powerbi.controller");
const router = express_1.default.Router();
router.post("/powerbi/token", powerbi_controller_1.PowerBIController.saveToken);
router.get("/connect/:userId", powerbi_controller_1.PowerBIController.getAuthUrl);
// Step 2: Handle callback and store tokens
router.get("/callback", powerbi_controller_1.PowerBIController.callback);
router.get("/reports/:userId", powerbi_controller_1.PowerBIController.getReports);
router.get("/dashboards/:userId", powerbi_controller_1.PowerBIController.getDashboards);
router.get("/dataset/:workspaceId/:userId", powerbi_controller_1.PowerBIController.getDatasets);
exports.powerbiRoute = router;
