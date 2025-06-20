import { Request, Response } from "express";
import NewsComment from "../models/NewsComment";
import User from "../models/User";
// Get all comments for all news articles
export const getAllNewsComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const comments = await NewsComment.findAll({
      include: [
        {
          model: User,
          as: "user_comments",
          attributes: ["userID", "username", "avatar"], // adjust as needed
        },
      ],
      order: [["commentAt", "DESC"]],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};


// Get all comments for a news article
export const getCommentsByNewsID = async (req: Request, res: Response) => {
  const { newsID } = req.params;
  console.log("Fetching comments for newsID:", newsID);

  try {
    const comments = await NewsComment.findAll({
      where: { newsID },
      include: [
        {
          model: User,
          as: "user_comments",
          attributes: ["userID", "username", "avatar"], // adjust as needed
        },
      ],
      order: [["commentAt", "DESC"]],
    });
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Post a new comment to a news article
export const createNewsComment = async (req: Request, res: Response) => {
  const { userID, newsID, content } = req.body;
  try {
    const newComment = await NewsComment.create({
      userID,
      newsID,
      content,
      commentAt: new Date(),
      status: "active",
    });
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

// Optionally: Delete a comment (soft delete by status)
export const deleteNewsComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { commentID } = req.params;
  try {
    const comment = await NewsComment.findByPk(commentID);
    if (!comment) {
      res.status(404).json({ message: "Comment not found" });
    } else {
      comment.status = "deleted";
      await comment.save();
      res.status(200).json({ message: "Comment deleted" });
    }
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const updateLikeOrDislikeCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { newsCommentID } = req.params;
  const { action } = req.body;

  try {
    const newsArticle = await NewsComment.findByPk(newsCommentID);
    if (!newsArticle) {
      res.status(404).json({ message: "News article not found" });
      return;
    }
    if (action !== "like" && action !== "dislike") {
      res
        .status(400)
        .json({ message: "Invalid action. Use 'like' or 'dislike'." });
      return;
    }
    if (action === "dislike") {
       await newsArticle.update({
        dislikeCount: newsArticle.dislikeCount + 1,
      });
    } else {
     await newsArticle.update({
        likeCount: newsArticle.likeCount + 1,
      });
    }
    res
      .status(200)
      .json({ message: "Like count updated successfully", newsArticle });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
