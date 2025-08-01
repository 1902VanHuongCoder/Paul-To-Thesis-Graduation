import express from "express";
import {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentsByProductId,
  updateCommentReaction
} from "../controllers/commentController";

const router = express.Router();

// GET all comments
router.get("/", getAllComments);

// GET a specific comment by ID
router.get("/:commentID", getCommentById);

// POST a new comment
router.post("/", createComment);

// PUT (update) an existing comment by ID
router.put("/:commentID", updateComment);

// DELETE a comment by ID
router.delete("/:commentID", deleteComment);

router.get("/product/:productID", getCommentsByProductId); 

router.put("/reaction/:commentID", updateCommentReaction); 

export default router;