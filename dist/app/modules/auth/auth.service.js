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
exports.auth_services = exports.resetPasswordService = exports.forget_password_from_db = void 0;
exports.updatePassword = updatePassword;
const app_error_1 = require("../../utils/app_error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_status_1 = __importDefault(require("http-status"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_1 = require("../../utils/JWT");
const configs_1 = require("../../configs");
const user_schema_1 = require("../user/user.schema");
const mail_sender_1 = require("../../utils/mail_sender");
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
        userId: isExistAccount._id,
        email: isExistAccount.email,
        role: isExistAccount.role,
    }, configs_1.configs.jwt.access_token_secret, configs_1.configs.jwt.access_expires);
    const refreshToken = JWT_1.jwtHelpers.generateToken({
        userId: isExistAccount._id,
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
    const userData = yield user_schema_1.User_Model.findOne({
        email: decodedData === null || decodedData === void 0 ? void 0 : decodedData.email,
        // isActive: true,
    });
    // console.log('user ', userData)
    const accessToken = JWT_1.jwtHelpers.generateToken({
        email: userData.email,
        role: userData.role,
    }, configs_1.configs.jwt.access_token_secret, configs_1.configs.jwt.access_expires);
    return { accessToken };
});
function updatePassword(userId, currentPassword, newPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentPassword || !newPassword) {
            return {
                success: false,
                message: "Both current and new passwords are required",
            };
        }
        // fetch user (adjust for your ORM)
        const user = yield user_schema_1.User_Model.findById(userId).select("password");
        if (!user)
            return { success: false, message: "User not found" };
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch)
            return { success: false, message: "Current password is incorrect" };
        // optionally prevent reuse
        const isSameAsOld = yield bcrypt_1.default.compare(newPassword, user.password);
        if (isSameAsOld)
            return {
                success: false,
                message: "New password must be different from the old password",
            };
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashed = yield bcrypt_1.default.hash(newPassword, salt);
        user.password = hashed;
        yield user.save();
        return { success: true };
    });
}
const forget_password_from_db = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.User_Model.findOne({ email });
    if (!user) {
        throw new Error("No account found with this email");
    }
    const resetToken = JWT_1.jwtHelpers.generateToken({ email: user.email, role: user.role }, configs_1.configs.jwt.reset_secret, configs_1.configs.jwt.reset_expires);
    const resetPasswordLink = `${configs_1.configs.jwt.front_end_url}/reset?token=${resetToken}&email=${user.email}`;
    const emailTemplate = `
    <p>Hi there,</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetPasswordLink}">Reset Password</a>
    <p>This link will expire in ${configs_1.configs.jwt.reset_expires}.</p>
  `;
    yield (0, mail_sender_1.sendMail)({
        to: user.email,
        subject: "Reset your password",
        textBody: "Please click the link below to reset your password.",
        htmlBody: emailTemplate,
    });
    return "Password reset link sent to your email.";
});
exports.forget_password_from_db = forget_password_from_db;
const resetPasswordService = (email, token, password) => __awaiter(void 0, void 0, void 0, function* () {
    // Verify token
    let decoded;
    try {
        decoded = jsonwebtoken_1.default.verify(token, configs_1.configs.jwt.reset_secret);
    }
    catch (error) {
        throw new Error("Invalid or expired token");
    }
    // Ensure the email matches the token payload
    if (decoded.email !== email) {
        throw new Error("Invalid token or email mismatch");
    }
    // Find user
    const user = yield user_schema_1.User_Model.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    // Hash new password
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    // Update user password
    user.password = hashedPassword;
    user.confirmPassword = hashedPassword;
    yield user.save();
    return "Password reset successful!";
});
exports.resetPasswordService = resetPasswordService;
exports.auth_services = {
    login_user_from_db,
    refresh_token_from_db,
    forget_password_from_db: exports.forget_password_from_db,
    resetPasswordService: exports.resetPasswordService,
};
