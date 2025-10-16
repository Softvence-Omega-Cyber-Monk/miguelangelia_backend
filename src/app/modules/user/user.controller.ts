import catchAsync from "../../utils/catch_async";
import manageResponse from "../../utils/manage_response";
import httpStatus from "http-status";
import { user_service } from "./user.service";

const create_user = catchAsync(async (req, res) => {
  const userData = req.body;

  const result = await user_service.createUser(userData);

  manageResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User created successfully.",
    data: result,
  });
});

const get_single_user = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await user_service.getUserById(id);

  manageResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User fetched successfully",
    data: result,
  });
});

const get_all_users = catchAsync(async (req, res) => {
  const result = await user_service.getAllUsers();

  manageResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All users fetched successfully.",
    data: result,
  });
});

export const user_controllers = {
  create_user,
  get_single_user,
  get_all_users,
};
