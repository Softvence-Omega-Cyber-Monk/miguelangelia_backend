import { Request, Response, NextFunction } from "express";
import { configs } from "../../configs";
import catchAsync from "../../utils/catch_async";
import manageResponse from "../../utils/manage_response";
import { auth_services, updatePassword } from "./auth.service";
import httpStatus from "http-status";

const login_user = catchAsync(async (req, res) => {
  const result = await auth_services.login_user_from_db(req.body);

  res.cookie("refreshToken", result.refreshToken, {
    secure: configs.env == "production",
    httpOnly: true,
  });

  manageResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User is logged in successful !",
    data: {
      accessToken: result.accessToken,
      refresh_token: result.refreshToken,
      role: result?.role,
    },
  });
});

const refresh_token = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await auth_services.refresh_token_from_db(refreshToken);
  manageResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Refresh token generated successfully!",
    data: result,
  });
});

// expects: { currentPassword: string, newPassword: string }
export const updatePasswordController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    console.log("User ID from req.user:", userId);
    const { currentPassword, newPassword } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const result = await updatePassword(userId, currentPassword, newPassword);

    if (!result.success)
      return res.status(400).json({ message: result.message });

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
};

const forget_password = catchAsync(async (req, res) => {
  const { email } = req?.body;

  await auth_services.forget_password_from_db(email);
  manageResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset password link sent to your email!",
  });
});

export const resetPasswordController = catchAsync(async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, token, and password are required",
      });
    }

    const result = await auth_services.resetPasswordService(
      email,
      token,
      password
    );

    res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to reset password",
    });
  }
});

export const auth_controllers = {
  login_user,

  refresh_token,

  forget_password,
  resetPasswordController,
};
