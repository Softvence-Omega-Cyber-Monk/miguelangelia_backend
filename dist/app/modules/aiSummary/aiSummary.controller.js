"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSummaryController = void 0;
const aiSummary_service_1 = require("./aiSummary.service");
exports.AiSummaryController = {
    createUsage: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const usage = yield aiSummary_service_1.AiSummaryService.createUsage(req.body);
            res.status(201).json({ success: true, data: usage });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }),
    getAllUsages: (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const usages = yield aiSummary_service_1.AiSummaryService.getAllUsages();
            res.json({ success: true, data: usages });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }),
    getUsageByUserId: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { userId } = req.params;
            const usage = yield aiSummary_service_1.AiSummaryService.getUsageByUserId(userId);
            if (!usage)
                return res.status(404).json({ success: false, message: "User not found" });
            res.json({ success: true, data: usage });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }),
};
