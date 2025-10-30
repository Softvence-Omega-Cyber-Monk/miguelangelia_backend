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
Object.defineProperty(exports, "__esModule", { value: true });
const app_error_1 = require("../utils/app_error");
const configs_1 = require("../configs");
const JWT_1 = require("../utils/JWT");
const user_schema_1 = require("../modules/user/user.schema");
const auth = (...roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            const authHeader = req.headers.authorization;
            // ✅ Check if header exists and starts with Bearer
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new app_error_1.AppError("You are not authorize!!", 401);
            }
            // ✅ Extract token from "Bearer <token>"
            const token = authHeader.split(" ")[1];
            // ✅ Verify token using correct secret
            const verifiedUser = JWT_1.jwtHelpers.verifyToken(token, (_a = configs_1.configs.jwt) === null || _a === void 0 ? void 0 : _a.access_token_secret);
            // console.log("Varify user", verifiedUser)
            // ✅ Check if role is allowed (if roles are specified)
            if (roles.length && !roles.includes(verifiedUser.role)) {
                throw new app_error_1.AppError("You are not authorize!!", 401);
            }
            // ✅ Check if user still exists in DB
            const isUserExist = yield user_schema_1.User_Model.findOne({
                email: verifiedUser === null || verifiedUser === void 0 ? void 0 : verifiedUser.email,
            }).lean();
            if (!isUserExist) {
                throw new app_error_1.AppError("Account not found!", 404);
            }
            req.user = verifiedUser;
            // console.log("request user", req.user)
            next();
        }
        catch (err) {
            next(err);
        }
    });
};
exports.default = auth;
