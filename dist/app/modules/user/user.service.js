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
exports.updateUserService = exports.user_service = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_schema_1 = require("./user.schema");
exports.user_service = {
    createUser: (userData) => __awaiter(void 0, void 0, void 0, function* () {
        console.log("user data ", userData);
        // Check if email already exists
        const existingUser = yield user_schema_1.User_Model.findOne({ email: userData.email });
        if (existingUser) {
            throw new Error("Email already exists. Please use a different email.");
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(userData.password, 10);
        const user = new user_schema_1.User_Model(Object.assign(Object.assign({}, userData), { password: hashedPassword, confirmPassword: hashedPassword }));
        return yield user.save();
    }),
    // Get single user by ID
    getUserById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield user_schema_1.User_Model.findById(id);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    }),
    // Get all users
    getAllUsers: () => __awaiter(void 0, void 0, void 0, function* () {
        return yield user_schema_1.User_Model.find().sort({ createdAt: -1 }); // newest first
    }),
    DashboardAnalytis: () => __awaiter(void 0, void 0, void 0, function* () {
        const allUsers = yield user_schema_1.User_Model.find();
        const organazations = yield user_schema_1.User_Model.find({ accountType: "organizations" });
        return {
            allUser: allUsers.length,
            organazations: organazations.length
        };
    }),
};
const updateUserService = (userId, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(updateData);
    const updatedUser = yield user_schema_1.User_Model.findByIdAndUpdate(userId, updateData, {
        new: true,
        runValidators: true,
    }).select("-password -confirmPassword"); // don't return sensitive data
    if (!updatedUser) {
        throw new Error("User not found");
    }
    return updatedUser;
});
exports.updateUserService = updateUserService;
