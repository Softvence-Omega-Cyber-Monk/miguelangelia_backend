import { configs } from "../../configs";
import catchAsync from "../../utils/catch_async";
import manageResponse from "../../utils/manage_response";
import { auth_services } from "./auth.service";
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

const forget_password = catchAsync(async (req, res) => {
  const { email } = req?.body;
  await auth_services.forget_password_from_db(email);
  manageResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Reset password link sent to your email!",
    data: null,
  });
});

export const auth_controllers = {
  login_user,

  refresh_token,

  forget_password,
};
