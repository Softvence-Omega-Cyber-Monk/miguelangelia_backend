import { Router } from "express";
import { GeneralChatHistoryController } from "./generalChatHistory.controller";

const router = Router();

router.post("/create", GeneralChatHistoryController.create);
router.get("/getSingle/:userId", GeneralChatHistoryController.getByUser);

export const GeneralChatHistoryRoute = router;
