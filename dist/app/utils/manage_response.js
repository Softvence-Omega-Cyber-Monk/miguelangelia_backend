"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manageResponse = (res, payload) => {
    res.status(payload.statusCode).json({
        success: payload.success,
        message: payload.message,
        data: payload.data || undefined || null,
        meta: payload.meta || undefined || null
    });
};
exports.default = manageResponse;
