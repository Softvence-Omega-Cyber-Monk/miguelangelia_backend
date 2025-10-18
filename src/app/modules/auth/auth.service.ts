import { AppError } from "../../utils/app_error";
import { TLoginPayload } from "./auth.interface";
import { Account_Model } from "./auth.schema";
import httpStatus from "http-status";
import bcrypt from "bcrypt";

import { jwtHelpers } from "../../utils/JWT";
import { configs } from "../../configs";
import { Secret } from "jsonwebtoken";
import sendMail from "../../utils/mail_sender";
import { isAccountExist } from "../../utils/isAccountExist";
import { User_Model } from "../user/user.schema";

const login_user_from_db = async (payload: TLoginPayload) => {
  // check account info

  console.log("payload", payload);

  const isExistAccount: any = await User_Model.findOne({
    email: payload?.email,
  });

  const isPasswordMatch = await bcrypt.compare(
    payload.password,
    isExistAccount?.password
  );
  if (!isPasswordMatch) {
    throw new AppError("Invalid password", httpStatus.UNAUTHORIZED);
  }
  const accessToken = jwtHelpers.generateToken(
    {
      email: isExistAccount.email,
      role: isExistAccount.role,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_expires as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: isExistAccount.email,
      role: isExistAccount.role,
    },
    configs.jwt.refresh_token_secret as Secret,
    configs.jwt.refresh_expires as string
  );
  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    role: isExistAccount.role,
  };
};

const refresh_token_from_db = async (token: string) => {
  let decodedData;
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      configs.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await Account_Model.findOne({
    email: decodedData.email,
    status: "ACTIVE",
    isDeleted: false,
  });

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData!.email,
      role: userData!.role,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_expires as string
  );

  return accessToken;
};

const forget_password_from_db = async (email: string) => {
  const isAccountExists = await User_Model.findOne({ email: email });
  console.log('is exit ', isAccountExist)
  const resetToken = jwtHelpers.generateToken(
    {
      email: isAccountExists?.email,
      role: isAccountExists?.role,
    },
    configs.jwt.reset_secret as Secret,
    configs.jwt.reset_expires as string
  );

  console.log("reset toekn", resetToken);

  const resetPasswordLink = `${configs.jwt.front_end_url}/reset?token=${resetToken}&email=${isAccountExists?.email}`;
  const emailTemplate = `<p>Click the link below to reset your password:</p><a href="${resetPasswordLink}">Reset Password</a>`;

  await sendMail({
    to: email,
    subject: "Password reset successful!",
    textBody: "Your password is successfully reset.",
    htmlBody: emailTemplate,
  });

  return "Check your email for reset link";
};

export const auth_services = {
  login_user_from_db,

  refresh_token_from_db,

  forget_password_from_db,
};
