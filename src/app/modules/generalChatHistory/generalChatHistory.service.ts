import { GeneralChatHistoryModel } from "./generalChatHistory.model";

export const GeneralChatHistoryService = {
  // Create new chat history
  async create(data: any) {
    try {
      // Check if a chat history already exists for this user
      // const existingChat = await GeneralChatHistoryModel.findOne({
      //   userId: data.userId,
      // });

      // if (existingChat) {
      //   return {
      //     success: false,
      //     message:
      //       "Chat history for this user already exists. Please use update instead.",
      //   };
      // }

      // Create new chat record
      const newChat = await GeneralChatHistoryModel.create(data);

      return {
        success: true,
        message: "Chat history created successfully.",
        data: newChat,
      };
    } catch (error) {
      console.error("Error creating chat history:", error);
      return {
        success: false,
        message: "An error occurred while saving chat history.",
        error,
      };
    }
  },

  async getByUser(userId: string) {
    return await GeneralChatHistoryModel.find({ userId })
      .sort({
        createdAt: -1,
      })
      .select(" userId thread_id  response question");
  },
};
