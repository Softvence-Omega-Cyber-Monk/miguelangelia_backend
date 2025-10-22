import { TUser } from "./user.interface";
import bcrypt from "bcrypt";
import { User_Model } from "./user.schema";

export const user_service = {
  createUser: async (userData: TUser) => {
    console.log("user data ", userData);

    // Check if email already exists
    const existingUser = await User_Model.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("Email already exists. Please use a different email.");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = new User_Model({
      ...userData,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });

    return await user.save();
  },

  // Get single user by ID
  getUserById: async (id: string) => {
    const user = await User_Model.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  // Get all users
  getAllUsers: async () => {
    return await User_Model.find().sort({ createdAt: -1 }); // newest first
  },

  updateUserService: async (userId: string, updateData: Partial<TUser>) => {
    console.log(updateData);
    const updatedUser = await User_Model.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password -confirmPassword"); // don't return sensitive data

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  },
  DashboardAnalytis: async () => {
    const allUsers = await User_Model.find();
    const organazations = await User_Model.find({
      accountType: "organizations",
    });

    return {
      allUser: allUsers.length,
      organazations: organazations.length,
    };
  },
};

// export const updateUserService = async (
//   userId: string,
//   updateData: Partial<TUser>
// ) => {
//   console.log(updateData);
//   const updatedUser = await User_Model.findByIdAndUpdate(userId, updateData, {
//     new: true,
//     runValidators: true,
//   }).select("-password -confirmPassword"); // don't return sensitive data

//   if (!updatedUser) {
//     throw new Error("User not found");
//   }

//   return updatedUser;
// };
