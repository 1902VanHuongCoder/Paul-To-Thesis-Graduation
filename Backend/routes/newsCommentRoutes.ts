import express from "express";
import {
  getCommentsByNewsID,
  createNewsComment,
  deleteNewsComment,
  updateLikeOrDislikeCount,
} from "../controllers/newsCommentController";

const router = express.Router();

// Get all comments for a specific news article
router.get("/news/:newsID", getCommentsByNewsID);

// Post a new comment to a news article
router.post("/", createNewsComment);

// Soft delete a comment by commentID
router.delete("/:commentID", deleteNewsComment);


router.put("/:newsCommentID", updateLikeOrDislikeCount); 


export default router;