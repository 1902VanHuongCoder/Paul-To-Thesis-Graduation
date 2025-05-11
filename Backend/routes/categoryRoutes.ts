import express from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController";

const router = express.Router();

// GET all categories
router.get("/", getAllCategories);

// GET a category by ID
router.get("/:id", getCategoryById);

// POST a new category
router.post("/", createCategory);

// PUT (update) a category by ID
router.put("/:id", updateCategory);

// DELETE a category by ID
router.delete("/:id", deleteCategory);

export default router;