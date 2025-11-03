"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_route_1 = __importDefault(require("./app/modules/auth/auth.route"));
const user_route_1 = __importDefault(require("./app/modules/user/user.route"));
const powerbi_route_1 = require("./app/modules/powerbi/powerbi.route");
const aiSummary_route_1 = require("./app/modules/aiSummary/aiSummary.route");
const fileUploadAndReport_route_1 = require("./app/modules/fileUploadAndReport/fileUploadAndReport.route");
const appRouter = (0, express_1.Router)();
const moduleRoutes = [
    { path: '/auth', route: auth_route_1.default },
    { path: "/user", route: user_route_1.default },
    { path: "/powerbi", route: powerbi_route_1.powerbiRoute },
    { path: "/aiUsage", route: aiSummary_route_1.aiUsageRoutes },
    { path: "/fileUploadAndReport", route: fileUploadAndReport_route_1.fileUploadAndReportRoute },
];
moduleRoutes.forEach(route => appRouter.use(route.path, route.route));
exports.default = appRouter;
