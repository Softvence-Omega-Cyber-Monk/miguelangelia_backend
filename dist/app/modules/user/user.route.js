"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const userRoute = (0, express_1.Router)();
userRoute.post("/create", user_controller_1.user_controllers.create_user);
// Get single user by ID
userRoute.get("/get-single/:id", user_controller_1.user_controllers.get_single_user);
// Get all users
userRoute.get("/getAll", user_controller_1.user_controllers.get_all_users);
userRoute.put("/update/:id", user_controller_1.user_controllers.updateUserController);
exports.default = userRoute;
