import express, { Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middlewares/global_error_handler";
import notFound from "./app/middlewares/not_found_api";
import cookieParser from "cookie-parser";
import appRouter from "./routes";
import bcrypt from "bcrypt";
import { User_Model } from "./app/modules/user/user.schema";
import { configs } from "./app/configs";


// define app
const app = express();

// middleware
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.raw());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", appRouter);

// stating point
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    status: "success",
    message: "Server is running successful !!",
    data: null,
  });
});

// Create Default SuperAdmin if not exists
export const createDefaultSuperAdmin = async () => {
  try {
    const existingAdmin = await User_Model.findOne({
      email: "mdsoyaibsourav11@gmail.com",
    });

    const hashedPassword = await bcrypt.hash(
      "admin@123", // Default password for Admin
      Number(configs.bcrypt_salt_rounds) // Ensure bcrypt_salt_rounds is correctly pulled from config
    );

    if (!existingAdmin) {
      await User_Model.create({
        
        email: "mdsoyaibsourav11@gmail.com",
        password: hashedPassword,
        confirmPassword: hashedPassword,
        role: "admin",
        accountType: 'personal'
        
      });
      console.log("✅ Default Admin created.");
    } else {
      console.log("ℹ️ SAdmin already exists.");
    }
  } catch (error) {
    console.error("❌ Failed to create Default Admin:", error);
  }
};

createDefaultSuperAdmin();

// global error handler
app.use(globalErrorHandler);
app.use(notFound);

// export app
export default app;
