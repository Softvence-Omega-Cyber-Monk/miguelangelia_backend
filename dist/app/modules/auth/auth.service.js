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
exports.auth_services = void 0;
const app_error_1 = require("../../utils/app_error");
const auth_schema_1 = require("./auth.schema");
const http_status_1 = __importDefault(require("http-status"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_1 = require("../../utils/JWT");
const configs_1 = require("../../configs");
const mail_sender_1 = __importDefault(require("../../utils/mail_sender"));
const isAccountExist_1 = require("../../utils/isAccountExist");
const user_schema_1 = require("../user/user.schema");
const login_user_from_db = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // check account info
    console.log("payload", payload);
    const isExistAccount = yield user_schema_1.User_Model.findOne({
        email: payload === null || payload === void 0 ? void 0 : payload.email,
    });
    const isPasswordMatch = yield bcrypt_1.default.compare(payload.password, isExistAccount === null || isExistAccount === void 0 ? void 0 : isExistAccount.password);
    if (!isPasswordMatch) {
        throw new app_error_1.AppError("Invalid password", http_status_1.default.UNAUTHORIZED);
    }
    const accessToken = JWT_1.jwtHelpers.generateToken({
        email: isExistAccount.email,
        role: isExistAccount.role,
    }, configs_1.configs.jwt.access_token_secret, configs_1.configs.jwt.access_expires);
    const refreshToken = JWT_1.jwtHelpers.generateToken({
        email: isExistAccount.email,
        role: isExistAccount.role,
    }, configs_1.configs.jwt.refresh_token_secret, configs_1.configs.jwt.refresh_expires);
    return {
        accessToken: accessToken,
        refreshToken: refreshToken,
        role: isExistAccount.role,
    };
});
const refresh_token_from_db = (token) => __awaiter(void 0, void 0, void 0, function* () {
    let decodedData;
    try {
        decodedData = JWT_1.jwtHelpers.verifyToken(token, configs_1.configs.jwt.refresh_token_secret);
    }
    catch (err) {
        throw new Error("You are not authorized!");
    }
    const userData = yield auth_schema_1.Account_Model.findOne({
        email: decodedData.email,
        status: "ACTIVE",
        isDeleted: false,
    });
    const accessToken = JWT_1.jwtHelpers.generateToken({
        email: userData.email,
        role: userData.role,
    }, configs_1.configs.jwt.access_token_secret, configs_1.configs.jwt.access_expires);
    return accessToken;
});
const forget_password_from_db = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isAccountExists = yield user_schema_1.User_Model.findOne({ email: email });
    console.log('is exit ', isAccountExist_1.isAccountExist);
    const resetToken = JWT_1.jwtHelpers.generateToken({
        email: isAccountExists === null || isAccountExists === void 0 ? void 0 : isAccountExists.email,
        role: isAccountExists === null || isAccountExists === void 0 ? void 0 : isAccountExists.role,
    }, configs_1.configs.jwt.reset_secret, configs_1.configs.jwt.reset_expires);
    console.log("reset toekn", resetToken);
    const resetPasswordLink = `${configs_1.configs.jwt.front_end_url}/reset?token=${resetToken}&email=${isAccountExists === null || isAccountExists === void 0 ? void 0 : isAccountExists.email}`;
    const emailTemplate = `<p>Click the link below to reset your password:</p><a href="${resetPasswordLink}">Reset Password</a>`;
    yield (0, mail_sender_1.default)({
        to: email,
        subject: "Password reset successful!",
        textBody: "Your password is successfully reset.",
        htmlBody: emailTemplate,
    });
    return "Check your email for reset link";
});
exports.auth_services = {
    login_user_from_db,
    refresh_token_from_db,
    forget_password_from_db,
};
