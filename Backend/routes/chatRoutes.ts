import {
  addNewMessage,
  createConversation,
  getConversations,
  addMemberIntoGroup,
  getConversationsUserBelongs,
} from "../controllers/chatController";
import express from "express";

const router = express.Router();

router.get("/:conversationID", getConversations);
router.post("/add-new-message", addNewMessage);
router.post("/create-conversation", createConversation);
router.post("/add-member", addMemberIntoGroup);
router.get("/conversations/:userID", getConversationsUserBelongs); // Assuming this is to get conversations by userID

export default router;
