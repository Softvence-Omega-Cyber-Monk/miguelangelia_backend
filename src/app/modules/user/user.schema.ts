import { model, Schema } from "mongoose";
import { TUser } from "./user.interface";

const user_schema = new Schema<TUser>(
  {
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    confirmPassword: { type: String, required: true },
    organizationName: {
      type: String,
    },
    organizationSize: {
      type: String,
    },
    address: {
      type: String,
    },
    teamMemberNo: {
      type: Number,
    },
    yourRole: {
      type: String,
    },
    accountType: {
      type: String,
      enum: ["personal", "organizations"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const User_Model = model("user", user_schema);
