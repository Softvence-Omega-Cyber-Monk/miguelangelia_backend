import { NextFunction, Request, Response, Router } from "express";
import { user_controllers } from "./user.controller";
import uploader from "../../middlewares/uploader";
import { user_validations } from "./user.validation";
import auth from "../../middlewares/auth";

const userRoute = Router();

userRoute.post("/create", user_controllers.create_user);

// Get single user by ID
userRoute.get("/get-single/:id", user_controllers.get_single_user);

// Get all users
userRoute.get("/getAll", user_controllers.get_all_users);
userRoute.put("/update/:id", user_controllers.updateUserController);
userRoute.get("/getAnalytis", user_controllers.DashboardAnalytis);


export default userRoute;
