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
router.get("/:newsID", getNewsById);

// POST a new news article
router.post("/", createNews);

// PUT (update) an existing news article by ID
router.put("/:newsID", updateNews);

// DELETE a news article by ID
router.delete("/:newsID", deleteNews);


export default router;