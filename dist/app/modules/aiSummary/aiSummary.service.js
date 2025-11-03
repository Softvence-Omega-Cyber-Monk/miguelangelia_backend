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
exports.AiSummaryService = void 0;
const aiSummary_model_1 = require("./aiSummary.model");
exports.AiSummaryService = {
    createUsage: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const usage = yield aiSummary_model_1.AiUsageModel.create(Object.assign({}, data));
        return usage;
    }),
    getAllUsages: () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield aiSummary_model_1.AiUsageModel.find();
        // const totalTokenUsed = res.singleApiTokenUsed;
        // return {
        //   totalApiCall: res.length,
        // };
    }),
    getUsageByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield aiSummary_model_1.AiUsageModel.find({ userId });
    }),
};
