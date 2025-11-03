"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const request_validator_1 = __importDefault(require("../../middlewares/request_validator"));
const auth_validation_1 = require("./auth.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const authRoute = (0, express_1.Router)();
authRoute.post("/login", (0, request_validator_1.default)(auth_validation_1.auth_validation.login_validation), auth_controller_1.auth_controllers.login_user);
authRoute.post("/refresh-token", auth_controller_1.auth_controllers.refresh_token);
authRoute.put("/changePassword", (0, auth_1.default)('admin', 'user'), auth_controller_1.updatePasswordController);
authRoute.post("/forgot-password", 
// RequestValidator(auth_validation.forgotPassword),
auth_controller_1.auth_controllers.forget_password);
authRoute.post("/reset-password", auth_controller_1.auth_controllers.resetPasswordController);
exports.default = authRoute;
