"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Account_Model = void 0;
const mongoose_1 = require("mongoose");
const authSchema = new mongoose_1.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    lastPasswordChange: { type: String },
    isDeleted: { type: Boolean, default: false },
    accountStatus: { type: String, default: "ACTIVE" },
    role: { type: String, default: "USER" },
    isVerified: { type: Boolean, default: false }
}, {
    versionKey: false,
    timestamps: true
});
exports.Account_Model = (0, mongoose_1.model)("account", authSchema);
