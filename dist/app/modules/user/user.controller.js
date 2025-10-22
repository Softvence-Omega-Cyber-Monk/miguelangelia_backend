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
exports.user_controllers = exports.updateUserController = void 0;
const catch_async_1 = __importDefault(require("../../utils/catch_async"));
const manage_response_1 = __importDefault(require("../../utils/manage_response"));
const http_status_1 = __importDefault(require("http-status"));
const user_service_1 = require("./user.service");
const create_user = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userData = req.body;
    const result = yield user_service_1.user_service.createUser(userData);
    (0, manage_response_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "User created successfully.",
        data: result,
    });
}));
const get_single_user = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield user_service_1.user_service.getUserById(id);
    (0, manage_response_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "User fetched successfully",
        data: result,
    });
}));
const get_all_users = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.user_service.getAllUsers();
    (0, manage_response_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "All users fetched successfully.",
        data: result,
    });
}));
exports.updateUserController = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params; // user id from URL
    const updateData = req.body;
    // optionally, remove restricted fields like password here
    delete updateData.password;
    delete updateData.confirmPassword;
    delete updateData.email; // often we don’t allow email changes
    const updatedUser = yield (0, user_service_1.updateUserService)(id, updateData);
    res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
    });
}));
const DashboardAnalytis = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.user_service.DashboardAnalytis();
    (0, manage_response_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "All users fetched successfully.",
        data: result,
    });
}));
exports.user_controllers = {
    create_user,
    get_single_user,
    get_all_users,
    updateUserController: exports.updateUserController,
    DashboardAnalytis,
};
