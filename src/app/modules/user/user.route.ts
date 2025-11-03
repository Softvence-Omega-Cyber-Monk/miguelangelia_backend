import { Router } from "express";
import { user_controllers } from "./user.controller";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

const userRoute = Router();

userRoute.post("/create", user_controllers.create_user);
userRoute.get("/get-single/:id", user_controllers.get_single_user);
userRoute.get("/getAll", user_controllers.get_all_users);

userRoute.put(
  "/update/:userId",
  upload.single("profileImage"),
  user_controllers.updateUserController
);
userRoute.delete("/delete/:userId", user_controllers.deleteUserController);

userRoute.get("/getAnalytis", user_controllers.DashboardAnalytis);
userRoute.put("/suspendUser/:userId", user_controllers.suspendUser);

export default userRoute;
