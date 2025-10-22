"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_validations = void 0;
const zod_1 = require("zod");
const createUserValidaton = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod_1.z.string().min(6),
});
exports.user_validations = {
    createUserValidaton,
};
