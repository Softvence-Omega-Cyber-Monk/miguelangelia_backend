import catchAsync from "../../utils/catch_async";
import manageResponse from "../../utils/manage_response";
import httpStatus from "http-status";
import { user_service } from "./user.service";
import uploadCloud from "../../utils/cloudinary";

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

export const updateUserController = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const updateData = { ...req.body };

  // Handle profile image if uploaded
  if (req.file) {
    const uploadedImage = await uploadCloud(req.file);
    if (uploadedImage?.secure_url) {
      updateData.profileImage = uploadedImage.secure_url;
    }
  }

  const updatedUser = await user_service.updateUserService(userId, updateData);

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: updatedUser,
  });
});

export const deleteUserController = catchAsync(async (req, res) => {
  const { userId } = req.params;

  const deletedUser = await user_service.deleteUserService(userId);

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    data: deletedUser,
  });
});

const DashboardAnalytis = catchAsync(async (req, res) => {
  const result = await user_service.DashboardAnalytis();

  manageResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Dashboard analytis fetched successfully.",
    data: result,
  });
});

const suspendUser = catchAsync(async (req, res) => {
  const userId = req.params.userId;
  const data = req.body;

  const result = await user_service.suspendUser(userId, data);

  manageResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "user suspended successfully.",
    data: result,
  });
});

export const user_controllers = {
  create_user,
  get_single_user,
  get_all_users,
  updateUserController,
  deleteUserController,
  DashboardAnalytis,
  suspendUser,
};
