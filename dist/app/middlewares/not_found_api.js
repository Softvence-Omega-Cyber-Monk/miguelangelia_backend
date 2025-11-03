"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res, next) => {
    res.status(404).json({
        message: 'Sorry Route is not found!! 😴😴😴',
        success: false,
        error: '',
    });
};
exports.default = notFound;
