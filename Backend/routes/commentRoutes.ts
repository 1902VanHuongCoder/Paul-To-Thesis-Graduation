import express from "express";
import {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController";

const router = express.Router();

// GET all comments
router.get("/", getAllComments);

// GET a specific comment by ID
router.get("/:id", getCommentById);

// POST a new comment
router.post("/", createComment);

// PUT (update) an existing comment by ID
router.put("/:id", updateComment);

// DELETE a comment by ID
router.delete("/:id", deleteComment);

export default router;