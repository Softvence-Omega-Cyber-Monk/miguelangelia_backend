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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth_controllers = void 0;
const configs_1 = require("../../configs");
const catch_async_1 = __importDefault(require("../../utils/catch_async"));
const manage_response_1 = __importDefault(require("../../utils/manage_response"));
const auth_service_1 = require("./auth.service");
const http_status_1 = __importDefault(require("http-status"));
const login_user = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield auth_service_1.auth_services.login_user_from_db(req.body);
    res.cookie("refreshToken", result.refreshToken, {
        secure: configs_1.configs.env == "production",
        httpOnly: true,
    });
    (0, manage_response_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User is logged in successful !",
        data: {
            accessToken: result.accessToken,
            refresh_token: result.refreshToken,
            role: result === null || result === void 0 ? void 0 : result.role,
        },
    });
}));
const refresh_token = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield auth_service_1.auth_services.refresh_token_from_db(refreshToken);
    (0, manage_response_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Refresh token generated successfully!",
        data: result,
    });
}));
const forget_password = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req === null || req === void 0 ? void 0 : req.body;
    yield auth_service_1.auth_services.forget_password_from_db(email);
    (0, manage_response_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Reset password link sent to your email!",
        data: null,
    });
}));
exports.auth_controllers = {
    login_user,
    refresh_token,
    forget_password,
};
