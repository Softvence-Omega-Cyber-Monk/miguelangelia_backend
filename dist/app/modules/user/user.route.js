"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: "uploads/" });
const userRoute = (0, express_1.Router)();
userRoute.post("/create", user_controller_1.user_controllers.create_user);
userRoute.get("/get-single/:id", user_controller_1.user_controllers.get_single_user);
userRoute.get("/getAll", user_controller_1.user_controllers.get_all_users);
userRoute.put("/update/:userId", upload.single("profileImage"), user_controller_1.user_controllers.updateUserController);
userRoute.delete("/delete/:userId", user_controller_1.user_controllers.deleteUserController);
userRoute.get("/getAnalytis", user_controller_1.user_controllers.DashboardAnalytis);
userRoute.put("/suspendUser/:userId", user_controller_1.user_controllers.suspendUser);
exports.default = userRoute;
