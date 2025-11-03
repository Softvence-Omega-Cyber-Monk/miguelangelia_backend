"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth_validation = void 0;
const zod_1 = require("zod");
const login_validation = zod_1.z.object({
    email: zod_1.z.string({ message: "Email is required" }),
    password: zod_1.z.string({ message: "password is required" })
});
const changePassword = zod_1.z.object({
    oldPassword: zod_1.z.string({ message: "Old Password is required" }),
    newPassword: zod_1.z.string({ message: "New Password is required" })
});
const forgotPassword = zod_1.z.object({ email: zod_1.z.string({ message: "Email is required" }) });
const resetPassword = zod_1.z.object({
    token: zod_1.z.string(),
    newPassword: zod_1.z.string(),
    email: zod_1.z.string()
});
const verified_account = zod_1.z.object({
    token: zod_1.z.string({ message: "Token is Required!!" })
});
exports.auth_validation = {
    login_validation,
    changePassword,
    forgotPassword,
    resetPassword,
    verified_account
};
