import { AppError } from "../../utils/app_error";
import { TLoginPayload } from "./auth.interface";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import bcrypt from "bcrypt";

import { jwtHelpers } from "../../utils/JWT";
import { configs } from "../../configs";
import { JwtPayload, Secret } from "jsonwebtoken";

import { isAccountExist } from "../../utils/isAccountExist";
import { User_Model } from "../user/user.schema";
import { sendMail } from "../../utils/mail_sender";

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
      userId: isExistAccount._id,
      email: isExistAccount.email,
      role: isExistAccount.role,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_expires as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      userId: isExistAccount._id,
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

  const userData = await User_Model.findOne({
    email: decodedData?.email,
    // isActive: true,
  });

  // console.log('user ', userData)

  const accessToken = jwtHelpers.generateToken(
    {
      email: userData!.email,
      role: userData!.role,
    },
    configs.jwt.access_token_secret as Secret,
    configs.jwt.access_expires as string
  );

  return { accessToken };
};

export const forget_password_from_db = async (email: string) => {
  const user = await User_Model.findOne({ email });

  if (!user) {
    throw new Error("No account found with this email");
  }

  const resetToken = jwtHelpers.generateToken(
    { email: user.email, role: user.role },
    configs.jwt.reset_secret as Secret,
    configs.jwt.reset_expires as string
  );

  const resetPasswordLink = `${configs.jwt.front_end_url}/reset?token=${resetToken}&email=${user.email}`;

  const emailTemplate = `
    <p>Hi there,</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetPasswordLink}">Reset Password</a>
    <p>This link will expire in ${configs.jwt.reset_expires}.</p>
  `;

  await sendMail({
    to: user.email,
    subject: "Reset your password",
    textBody: "Please click the link below to reset your password.",
    htmlBody: emailTemplate,
  });

  return "Password reset link sent to your email.";
};

export const resetPasswordService = async (
  email: string,
  token: string,
  password: string
) => {
  // Verify token
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(
      token,
      configs.jwt.reset_secret as Secret
    ) as JwtPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }

  // Ensure the email matches the token payload
  if (decoded.email !== email) {
    throw new Error("Invalid token or email mismatch");
  }

  // Find user
  const user = await User_Model.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user password
  user.password = hashedPassword;
  user.confirmPassword = hashedPassword;
  await user.save();

  return "Password reset successful!";
};

export const auth_services = {
  login_user_from_db,

  refresh_token_from_db,

  forget_password_from_db,
  resetPasswordService,
};
