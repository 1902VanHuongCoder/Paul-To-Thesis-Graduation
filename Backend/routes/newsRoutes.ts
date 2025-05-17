import express from "express";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
} from "../controllers/newsController";

const router = express.Router();

// GET all news articles
router.get("/", getAllNews);

// GET a specific news article by ID
router.get("/:id", getNewsById);

// POST a new news article
router.post("/", createNews);

// PUT (update) an existing news article by ID
router.put("/:id", updateNews);

// DELETE a news article by ID
router.delete("/:id", deleteNews);

export default router;