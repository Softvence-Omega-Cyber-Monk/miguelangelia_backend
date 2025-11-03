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

    const updatedUser = await User_Model.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    })

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  },
  deleteUserService: async (userId: string) => {
    const deletedUser = await User_Model.findByIdAndDelete(userId);

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return {
      _id: deletedUser._id,
      email: deletedUser.email,
      organizationName: deletedUser.organizationName,
    };
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
  suspendUser: async (userId: string, data: any) => {
    try {
      console.log("Suspension data:", data, userId);

      const res = await User_Model.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            isSuspened: data?.isSuspened, // ✅ fixed spelling
          },
        },
        { new: true } // ✅ return updated document
      );

      return res;
    } catch (error) {
      console.error("Error suspending user:", error);
      throw error;
    }
  },
};
