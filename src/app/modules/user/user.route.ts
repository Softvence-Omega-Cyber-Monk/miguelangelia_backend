import { Router } from "express";
import { user_controllers } from "./user.controller";

const userRoute = Router();

userRoute.post("/create", user_controllers.create_user);
userRoute.get("/get-single/:id", user_controllers.get_single_user);
userRoute.get("/getAll", user_controllers.get_all_users);
userRoute.put("/update/:id", user_controllers.updateUserController);
userRoute.get("/getAnalytis", user_controllers.DashboardAnalytis);
userRoute.put("/suspendUser/:userId", user_controllers.suspendUser);

export default userRoute;
