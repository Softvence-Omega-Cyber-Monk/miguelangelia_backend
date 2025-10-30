"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User_Model = void 0;
const mongoose_1 = require("mongoose");
const user_schema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    organizationName: {
        type: String,
    },
    organizationSize: {
        type: String,
    },
    address: {
        type: String,
    },
    teamMemberNo: {
        type: Number,
    },
    yourRole: {
        type: String,
    },
    accountType: {
        type: String,
        enum: ["personal", "organizations"],
        required: true,
    },
    isActive: {
        type: Boolean,
        required: true,
        default: true,
    },
}, {
    timestamps: true,
});
exports.User_Model = (0, mongoose_1.model)("user", user_schema);
