import { Request, Response } from "express";
import Comment from "../models/Comment";
import User from "../models/User";
import Product from "../models/Product";

// GET all comments
export const getAllComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, as: "user" },
        { model: Product, as: "product" },
      ],
    });
    res.status(200).json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// GET a specific comment by ID
export const getCommentById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByPk(id, {
      include: [
        { model: User, as: "user" },
        { model: Product, as: "product" },
      ],
    });

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    res.status(200).json(comment);
  } catch (error) {
    console.error("Error fetching comment by ID:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// POST a new comment
export const createComment = async (req: Request, res: Response): Promise<void> => {
  const { userID, productID, content, rating, status } = req.body;

  try {
    const newComment = await Comment.create({
      userID,
      productID,
      content,
      commentAt: new Date(),
      rating,
      status,
    });

    res.status(201).json(newComment);
  } catch (error) {
    console.error("Error creating comment:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// PUT (update) an existing comment by ID
export const updateComment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { content, rating, status } = req.body;

  try {
    const comment = await Comment.findByPk(id);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    await comment.update({
      content,
      rating,
      status,
    });

    res.status(200).json({ message: "Comment updated successfully", comment });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};

// DELETE a comment by ID
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const comment = await Comment.findByPk(id);

    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    await comment.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ error: (error as Error).message });
  }
};