import { Request, Response } from "express";
import { GeneralChatHistoryService } from "./generalChatHistory.service";

export const GeneralChatHistoryController = {
  // POST /api/chat-history
  async create(req: Request, res: Response) {
    try {
      const { userId, thread_id, question, response: message } = req.body;
      if (!userId || !thread_id || !message) {
        return res.status(400).json({ success: false, message: "Missing required fields" });
      }

      const chat = await GeneralChatHistoryService.create({ userId, thread_id,  question, response: message });
      return res.status(201).json({ success: true, data: chat });
    } catch (error) {
      console.error("Error creating chat history:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // GET /api/chat-history/:userId
  async getByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const chats = await GeneralChatHistoryService.getByUser(userId);
      return res.json({ success: true, data: chats });
    } catch (error) {
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },
};
